/**
 * remote.js — 真实模型路径（BYOK：用你自己的 Key 直连你配置的服务商）
 *
 * 流水线 = 两次模型调用 + 一次确定性预检 +（按需）一次机械修复：
 *   1. 改写：上下文胶囊装配 → chatCompletion(json) → 容错解析
 *   2. 修复：只处理可确定的漂移（语言不匹配 / 人称残留），不改内容
 *   3. 预检：人称残留 / 语言 / 长度比（确定性规则，先于质检）
 *   4. 质检：独立的第二次调用，只判 5 条判据（见 model/prompts.js）
 *
 * 预检为什么放在质检前：人称残留、语言跑偏和长度失控是结构性问题，确定性的，
 * 不必再花一次模型调用去判。**判据本身（是否发生重构）仍然交给模型；人称从来
 * 不是通过标准。**
 *
 * 修复为什么只修语言/人称：这两类是机械错误，可以由一次短调用可靠修掉；
 * 长度和内容若也交给"修复"，模型会顺手删掉刚加进去的重构句——实测过，不采用。
 * 长度仍由预检保守拦截（2.2×），提示词里的 1.6× 是软约束。
 *
 * 重试：session 会把上一稿 + 未命中的判据作为 `previous` 传进来，装配成
 * feedback 胶囊。没有它，模型换一句引导语后经常产出几乎一样的文字。
 *
 * 质检调用失败时整个 runRecast 向上抛 ModelError：不把基础设施故障伪装成
 * 「未通过」，错误由 session 收敛为 code、界面给出可操作提示。
 */
import { ModelError, chatCompletion } from '../model/client'
import { modelConfig, getApiKey } from '../model/config'
import {
  REWRITE_REPAIR_SYSTEM,
  PROMPT_VERSION,
  CRITIQUE_VERSION,
} from '../model/prompts'
import { LENSES } from '../mock/fixtures'
import { buildRewriteContext, buildCritiqueContext } from '../context/capsules'
import { styleAnchors } from '../context/memory'
import { pronounPair } from '../stores/prefs'
import { buildCritique } from './findings'

const REWRITE_MAX_TOKENS = 2000
const CRITIQUE_MAX_TOKENS = 500
const REPAIR_MAX_TOKENS = 2000

/* 温度：改写需要一点重构空间，质检需要稳定，修复只需要机械改写 */
const REWRITE_TEMPERATURE = 0.4
const CRITIQUE_TEMPERATURE = 0.2
const REPAIR_TEMPERATURE = 0.2

/** 结构预检阈值（保守：拦下的只是明显坏掉的情况） */
const RESIDUE_LIMIT = 2 // 第一人称残留 ≥2 处
const LENGTH_MIN = 0.45 // 成稿 / 原文 的字数比下限
const LENGTH_MAX = 2.2 // 上限
const RATIO_MIN_BASE = 120 // 原文短于此长度时不做长度比检查（比值噪声太大）

export async function runRemoteRecast({ text, band, lens, guidance, previous = null }) {
  // 防御性：低强度在路由阶段就分流了，正常流程不会到这里
  if (band === 'low') {
    return {
      distanced: text,
      warmth: '',
      critique: { passed: false, skipped: true, reason: 'low-intensity', findings: [] },
      contextReport: null,
      engine: 'model',
      promptVersion: PROMPT_VERSION,
    }
  }

  const pronoun = pronounPair.value
  const name = pronounName(pronoun, text)

  /* ── 1. 改写 ── */
  const rewriteCtx = buildRewriteContext({
    text,
    lens: LENSES.value.find((l) => l.id === lens),
    guidance: String(guidance || '').trim(),
    pronoun,
    anchors: styleAnchors(),
    previous,
  })

  const rewriteRaw = await chatCompletion({
    baseUrl: modelConfig.baseUrl,
    apiKey: getApiKey(),
    model: modelConfig.model,
    messages: rewriteCtx.messages,
    json: true,
    maxTokens: REWRITE_MAX_TOKENS,
    temperature: REWRITE_TEMPERATURE,
  })

  const parsed = tryParseJson(rewriteRaw)
  let distanced = typeof parsed?.rewrite === 'string' ? parsed.rewrite.trim() : ''
  if (!distanced) throw new ModelError('badResponse')

  let reconstruction = normalizeReconstruction(parsed?.reconstruction, distanced)
  let repaired = false

  /* ── 2. 机械修复（语言 / 人称）── */
  const initial = inspect({ original: text, rewrite: distanced })
  if (!initial.languageMatch || initial.residue > 0) {
    const fixed = await repairPass({ original: text, rewrite: distanced, name })
    if (fixed && fixed !== distanced) {
      distanced = fixed
      repaired = true
      // 修复只改人称/语言；若模型顺手把重构句改没了，quality 会如实记录
      reconstruction = {
        ...reconstruction,
        lineInRewrite: lineInRewrite(distanced, reconstruction?.line || ''),
      }
    }
  }

  /* ── 3. 确定性预检 ── */
  const quality = inspect({ original: text, rewrite: distanced })
  const precheck = checkStructure({ original: text, rewrite: distanced })
  if (!precheck.ok) {
    return {
      distanced,
      warmth: '',
      critique: {
        passed: false,
        skipped: true,
        reason: 'structural',
        issue: precheck.issue,
        findings: [],
      },
      precheck,
      quality,
      reconstruction,
      repaired,
      contextReport: { rewrite: rewriteCtx.report, critique: null },
      engine: 'model',
      promptVersion: PROMPT_VERSION,
      critiqueVersion: CRITIQUE_VERSION,
    }
  }

  /* ── 4. 模型质检 ── */
  const critiqueCtx = buildCritiqueContext({ text, rewrite: distanced })
  const critiqueRaw = await chatCompletion({
    baseUrl: modelConfig.baseUrl,
    apiKey: getApiKey(),
    model: modelConfig.model,
    messages: critiqueCtx.messages,
    json: true,
    maxTokens: CRITIQUE_MAX_TOKENS,
    temperature: CRITIQUE_TEMPERATURE,
  })

  const judged = tryParseJson(critiqueRaw)
  const critique = buildCritique(judged?.criteria, {
    note: typeof judged?.note === 'string' ? judged.note.trim() : '',
  })
  const warmth = typeof parsed.warmth === 'string' ? parsed.warmth.trim() : ''

  return {
    distanced,
    warmth: critique.passed ? warmth : '',
    critique,
    precheck,
    quality,
    reconstruction,
    repaired,
    contextReport: { rewrite: rewriteCtx.report, critique: critiqueCtx.report },
    engine: 'model',
    promptVersion: PROMPT_VERSION,
    critiqueVersion: CRITIQUE_VERSION,
  }
}

/* ── 解析 ── */

/** 容错解析：json 模式下仍可能带围栏或前后缀 */
function tryParseJson(raw) {
  if (typeof raw !== 'string') return null
  const s = raw.trim()
  const unfenced = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const candidates = [unfenced]
  const a = unfenced.indexOf('{')
  const b = unfenced.lastIndexOf('}')
  if (a >= 0 && b > a) candidates.push(unfenced.slice(a, b + 1))

  for (const c of candidates) {
    try {
      const value = JSON.parse(c)
      if (value && typeof value === 'object') return value
    } catch {
      /* 试下一个候选 */
    }
  }
  return null
}

/* ── 修复 ── */

/**
 * 只修语言与第一人称。失败（网络/解析）时安静返回 null，让主流程继续，
 * 由结构预检兜底——修复不是关键路径。
 */
async function repairPass({ original, rewrite, name }) {
  try {
    const messages = [
      { role: 'system', content: REWRITE_REPAIR_SYSTEM.replace(/{pronoun}/g, name) },
      {
        role: 'user',
        content: `Original entry (language reference):\n"""\n${original}\n"""\n\nRewrite to repair:\n"""\n${rewrite}\n"""`,
      },
    ]
    const raw = await chatCompletion({
      baseUrl: modelConfig.baseUrl,
      apiKey: getApiKey(),
      model: modelConfig.model,
      messages,
      json: true,
      maxTokens: REPAIR_MAX_TOKENS,
      temperature: REPAIR_TEMPERATURE,
    })
    const parsed = tryParseJson(raw)
    const fixed = typeof parsed?.rewrite === 'string' ? parsed.rewrite.trim() : ''
    return fixed || null
  } catch {
    return null
  }
}

/* ── 检查 ── */

const QUOTED = /"[^"]*"|“[^”]*”|「[^」]*」|『[^』]*』/g
const EN_FIRST = /\bI(?:['’](?:m|ve|d|ll))?\b|\b(?:me|my|mine|myself)\b/g

function countFirstPerson(text) {
  const bare = String(text).replace(QUOTED, ' ')
  let count = (bare.match(EN_FIRST) || []).length
  // 中文：逐字扫「我」，排除「自我 / 忘我 / 无我」这类第三人称用法
  for (let i = 0; i < bare.length; i += 1) {
    if (bare[i] !== '我') continue
    const prev = bare[i - 1]
    if (prev === '自' || prev === '忘' || prev === '无') continue
    count += 1
  }
  return count
}

const normLen = (s) => String(s).replace(/\s+/g, '').length

function hasCJK(s) {
  return /[\u3400-\u9fff\uf900-\ufaff]/.test(String(s))
}

/** 语言是否一致（只看"是否含 CJK"，对中英双语产品足够；不引入语言识别依赖） */
function languageMatch(original, rewrite) {
  return hasCJK(original) === hasCJK(rewrite)
}

/** 供预检与训练数据质量字段共用的确定性观测 */
function inspect({ original, rewrite }) {
  const ratio = normLen(original) >= RATIO_MIN_BASE ? normLen(rewrite) / normLen(original) : null
  return {
    languageMatch: languageMatch(original, rewrite),
    residue: countFirstPerson(rewrite),
    ratio: ratio == null ? null : Number(ratio.toFixed(2)),
    length: normLen(rewrite),
  }
}

/**
 * 只拦明显坏掉的情况：人称残留、语言跑偏、长度失控。
 * @returns {{ ok: true, residue: number } | { ok: false, issue: 'pronoun'|'language'|'length', residue?: number, ratio?: number }}
 */
function checkStructure({ original, rewrite }) {
  if (!languageMatch(original, rewrite)) return { ok: false, issue: 'language' }

  const residue = countFirstPerson(rewrite)
  if (residue >= RESIDUE_LIMIT) return { ok: false, issue: 'pronoun', residue }

  const origLen = normLen(original)
  if (origLen >= RATIO_MIN_BASE) {
    const ratio = normLen(rewrite) / origLen
    if (ratio < LENGTH_MIN || ratio > LENGTH_MAX) {
      return { ok: false, issue: 'length', ratio: Number(ratio.toFixed(2)) }
    }
  }
  return { ok: true, residue }
}

/* ── 重构句校验（不改判据，只用于质量记录 / 飞轮筛选）── */

function normalizeReconstruction(value, rewrite) {
  if (!value || typeof value !== 'object') return null
  const criterion = typeof value.criterion === 'string' ? value.criterion.trim() : ''
  const line = typeof value.line === 'string' ? value.line.trim() : ''
  return {
    criterion,
    line,
    lineInRewrite: lineInRewrite(rewrite, line),
  }
}

const stripForMatch = (s) => String(s).replace(/[\s"'“”‘’「」『』，,。.!！?？：:；;—-]/g, '')

function lineInRewrite(rewrite, line) {
  const l = stripForMatch(line)
  if (l.length < 12) return false
  return stripForMatch(rewrite).includes(l)
}

/** 第三人称唯一称呼：按原文语言给出（与 capsules.js 的规则保持一致） */
function pronounName(pronoun, text) {
  const p = pronoun || { zh: 'TA', en: 'they' }
  return hasCJK(text) ? p.zh : p.en
}
