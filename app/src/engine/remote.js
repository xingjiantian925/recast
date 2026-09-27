/**
 * remote.js — 真实模型路径（BYOK：用你自己的 Key 直连你配置的服务商）
 *
 * 流水线 = 两次模型调用 + 一次确定性预检：
 *   1. 改写：上下文胶囊装配 → chatCompletion(json) → 容错解析
 *   2. 预检：人称残留 / 长度比（确定性规则，先于质检）
 *   3. 质检：独立的第二次调用，只判 5 条判据（见 model/prompts.js）
 *
 * 预检为什么放在质检前：人称残留和长度失控是结构性问题，确定性的，不必再花一次
 * 模型调用去判。**判据本身（是否发生重构）仍然交给模型；人称从来不是通过标准。**
 * 防误伤：引号内的人称先剔除（转述原话是合法的），残留 ≥2 处才拦，长度比只在
 * 原文足够长时才判。
 *
 * 质检调用失败时整个 runRecast 向上抛 ModelError：不把基础设施故障伪装成
 * 「未通过」，错误由 session 收敛为 code、界面给出可操作提示。
 */
import { ModelError, chatCompletion } from '../model/client'
import { modelConfig, getApiKey } from '../model/config'
import { LENSES } from '../mock/fixtures'
import { buildRewriteContext, buildCritiqueContext } from '../context/capsules'
import { styleAnchors } from '../context/memory'
import { pronounPair } from '../stores/prefs'
import { buildCritique } from './findings'

const REWRITE_MAX_TOKENS = 2000
const CRITIQUE_MAX_TOKENS = 500

/** 结构预检阈值（保守：拦下的只是明显坏掉的情况） */
const RESIDUE_LIMIT = 2 // 第一人称残留 ≥2 处
const LENGTH_MIN = 0.45 // 成稿 / 原文 的字数比下限
const LENGTH_MAX = 2.2 // 上限
const RATIO_MIN_BASE = 120 // 原文短于此长度时不做长度比检查（比值噪声太大）

export async function runRemoteRecast({ text, band, lens, guidance }) {
  // 防御性：低强度在路由阶段就分流了，正常流程不会到这里
  if (band === 'low') {
    return {
      distanced: text,
      warmth: '',
      critique: { passed: false, skipped: true, reason: 'low-intensity', findings: [] },
      contextReport: null,
      engine: 'model',
    }
  }

  /* ── 1. 改写 ── */
  const rewriteCtx = buildRewriteContext({
    text,
    lens: LENSES.value.find((l) => l.id === lens),
    guidance: String(guidance || '').trim(),
    pronoun: pronounPair.value,
    anchors: styleAnchors(),
  })

  const rewriteRaw = await chatCompletion({
    baseUrl: modelConfig.baseUrl,
    apiKey: getApiKey(),
    model: modelConfig.model,
    messages: rewriteCtx.messages,
    json: true,
    maxTokens: REWRITE_MAX_TOKENS,
  })

  const parsed = tryParseJson(rewriteRaw)
  const distanced = typeof parsed?.rewrite === 'string' ? parsed.rewrite.trim() : ''
  if (!distanced) throw new ModelError('badResponse')

  /* ── 2. 确定性预检 ── */
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
      contextReport: { rewrite: rewriteCtx.report, critique: null },
      engine: 'model',
    }
  }

  /* ── 3. 模型质检 ── */
  const critiqueCtx = buildCritiqueContext({ text, rewrite: distanced })
  const critiqueRaw = await chatCompletion({
    baseUrl: modelConfig.baseUrl,
    apiKey: getApiKey(),
    model: modelConfig.model,
    messages: critiqueCtx.messages,
    json: true,
    maxTokens: CRITIQUE_MAX_TOKENS,
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
    contextReport: { rewrite: rewriteCtx.report, critique: critiqueCtx.report },
    engine: 'model',
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

/* ── 结构预检 ── */

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

/**
 * 只拦两类明显坏掉的情况：人称残留、长度失控。
 * @returns {{ ok: true, residue: number } | { ok: false, issue: 'pronoun'|'length', residue?: number, ratio?: number }}
 */
function checkStructure({ original, rewrite }) {
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