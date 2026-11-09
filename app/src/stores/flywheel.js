/**
 * flywheel.js — 端侧数据飞轮（只在本机采集，不上传）
 *
 * 为什么要有它：改写质量提升靠两件事——提示词迭代与真实样本。前者已经做了
 * （model/prompts.js 的 rewrite-v2）；后者需要把每一次「输入 → 改写 → 质检 →
 * 用户决定」完整留在本机，形成可训练、可审计的数据。未来手机端要跑一个超小
 * 量级本地模型，这批数据就是冷启动的 SFT / 偏好对来源。
 *
 * 三种产物：
 *  1. events     每次尝试的完整记录（原文、输出、质检、用户决定、提示词版本）
 *  2. SFT 对     真实模型 + 通过质检 + 用户归档的样本（拒绝采样后的正例）
 *  3. 偏好对     同一原文下「后一次通过 vs 前一次被拦」的相邻尝试（用于 DPO）
 *
 * 隐私边界（改动前先读）：
 *  - **默认关闭**，设置页显式开启；开启后也只写 localStorage，不发网络请求。
 *  - 导出默认脱敏（邮箱 / 手机号 / URL / 长数字串），可在飞轮页关闭。
 *  - 导出永不含 API Key、Base URL、量表分数、分层与复核记录。
 *  - 可一键清空；关闭开关只停止新增，不删除已有样本（删除是单独动作）。
 *  - 上限 2000 条，超出时优先丢弃最旧的未归档 / 非配对样本。
 */
import { computed, reactive, watch } from 'vue'
import { modelConfig } from '../model/config'
import { PROMPT_VERSION, CRITIQUE_VERSION, REWRITE_SYSTEM } from '../model/prompts'
import { LENSES } from '../mock/fixtures'

const KEY = 'recast.flywheel.v0'
const MAX_EVENTS = 2000
const SCHEMA = 'recast.flywheel.v1'

const blank = () => ({
  schema: SCHEMA,
  enabled: false,
  redactOnExport: true,
  seq: 0,
  events: [],
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return blank()
    const parsed = JSON.parse(raw)
    return {
      ...blank(),
      ...parsed,
      events: Array.isArray(parsed.events) ? parsed.events : [],
    }
  } catch {
    return blank()
  }
}

export const flywheel = reactive(load())

watch(
  flywheel,
  (v) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v))
    } catch {
      /* 存储不可用时静默降级为内存态 */
    }
  },
  // sync：开关与样本都是低频写入；同步落盘避免「刚开启就跳页导致开关丢失」
  { deep: true, flush: 'sync' }
)

const hasCJK = (s) => /[\u3400-\u9fff\uf900-\ufaff]/.test(String(s))
const normLen = (s) => String(s).replace(/\s+/g, '').length
const stripForMatch = (s) => String(s).replace(/[\s"'“”‘’「」『』，,。.!！?？：:；;—-]/g, '')

/**
 * 记录一次尝试。返回 event id；飞轮关闭时返回 null（调用方据此跳过后续标记）。
 * @param {object} p
 * @param {string} p.text 原文
 * @param {number} p.intensity
 * @param {'high'|'mid'|'low'} p.band
 * @param {string} p.lens 视角 id
 * @param {string} p.guidance 引导语
 * @param {number} p.attempt
 * @param {string|null} p.prevId 上一次尝试的 event id（重试链）
 * @param {object} p.result engine/remote.js 的返回值
 */
export function recordAttempt({ text, intensity, band, lens, guidance, attempt, prevId, result }) {
  if (!flywheel.enabled) return null
  const t = String(text || '')
  const id = `fw_${Date.now().toString(36)}_${(flywheel.seq += 1)}`
  const lensInfo = LENSES.value.find((l) => l.id === lens)

  const line = result?.reconstruction?.line || ''
  const lineCopied = Boolean(line) && stripForMatch(t).includes(stripForMatch(line))

  const event = {
    id,
    at: new Date().toISOString(),
    schema: SCHEMA,
    promptVersion: result?.promptVersion || (result?.engine === 'model' ? PROMPT_VERSION : 'demo-stub'),
    critiqueVersion:
      result?.critiqueVersion || (result?.engine === 'model' ? CRITIQUE_VERSION : 'demo-stub'),
    engine: result?.engine || 'unknown',
    model: result?.engine === 'model' ? modelConfig.model : 'demo',
    prevId: prevId || null,
    input: {
      text: t,
      lang: hasCJK(t) ? 'zh' : 'en',
      chars: normLen(t),
      intensity: intensity ?? null,
      band: band || null,
      lens: lens || null,
      lensName: lensInfo?.name || lens || null,
      guidance: String(guidance || '').trim(),
      attempt: attempt || 1,
    },
    output: {
      rewrite: result?.distanced || '',
      warmth: result?.warmth || '',
      reconstruction: result?.reconstruction || null,
    },
    critique: result?.critique
      ? {
          passed: Boolean(result.critique.passed),
          skipped: Boolean(result.critique.skipped),
          reason: result.critique.reason || null,
          issue: result.critique.issue || null,
          note: result.critique.note || null,
          findings: Array.isArray(result.critique.findings)
            ? result.critique.findings.map((f) => ({ id: f.id, hit: Boolean(f.hit), why: f.why || '' }))
            : [],
        }
      : null,
    quality: {
      ...(result?.quality || {}),
      lineInRewrite: Boolean(result?.reconstruction?.lineInRewrite),
      lineCopied,
      repaired: Boolean(result?.repaired),
    },
    user: {
      decision: 'pending', // pending | accepted | retried | exhausted
      at: null,
    },
  }

  flywheel.events.unshift(event)
  trim()
  return id
}

/** 用户对某次尝试的决定；用于把「通过 / 被拦 / 被放弃」变成可训练的标签 */
export function markDecision(id, decision) {
  if (!id) return
  const e = flywheel.events.find((x) => x.id === id)
  if (!e) return
  e.user = { decision, at: new Date().toISOString() }
}

export function setEnabled(on) {
  flywheel.enabled = Boolean(on)
}

export function setRedact(on) {
  flywheel.redactOnExport = Boolean(on)
}

export function clearAll() {
  flywheel.events.splice(0, flywheel.events.length)
  flywheel.seq = 0
}

/** 「清除本机全部数据」的一部分：连开关一起回到默认关闭 */
export function resetAll() {
  clearAll()
  flywheel.enabled = false
  flywheel.redactOnExport = true
}

function trim() {
  if (flywheel.events.length <= MAX_EVENTS) return
  // 优先丢最旧的 unaccepted，再丢最旧；保持偏好链尽量完整
  for (let i = flywheel.events.length - 1; i >= 0 && flywheel.events.length > MAX_EVENTS; i -= 1) {
    if (flywheel.events[i].user?.decision !== 'accepted') flywheel.events.splice(i, 1)
  }
  if (flywheel.events.length > MAX_EVENTS) flywheel.events.length = MAX_EVENTS
}

/* ══ 统计 ══ */

export const flywheelStats = computed(() => {
  const events = flywheel.events
  const total = events.length
  let accepted = 0
  let retried = 0
  let exhausted = 0
  let pending = 0
  let passed = 0
  let failed = 0
  let modelSamples = 0
  const byLang = { zh: 0, en: 0 }
  const byLens = {}
  const criteria = { insight: 0, meaning: 0, causal: 0, closure: 0, action: 0 }

  for (const e of events) {
    const decision = e.user?.decision || 'pending'
    if (decision === 'accepted') accepted += 1
    else if (decision === 'retried') retried += 1
    else if (decision === 'exhausted') exhausted += 1
    else pending += 1

    if (e.critique?.passed) passed += 1
    else if (e.critique && !e.critique.skipped) failed += 1

    if (e.engine === 'model') modelSamples += 1
    if (e.input?.lang === 'zh') byLang.zh += 1
    else if (e.input?.lang === 'en') byLang.en += 1
    if (e.input?.lens) byLens[e.input.lens] = (byLens[e.input.lens] || 0) + 1
    for (const f of e.critique?.findings || []) if (f.hit) criteria[f.id] = (criteria[f.id] || 0) + 1
  }

  return {
    total,
    accepted,
    retried,
    exhausted,
    pending,
    passed,
    failed,
    modelSamples,
    sftCount: buildSftRecords().length,
    pairCount: buildPreferencePairs().length,
    byLang,
    byLens,
    criteria,
    lastAt: events[0]?.at || null,
  }
})

/* ══ 导出构建 ══ */

function redact(text) {
  if (!flywheel.redactOnExport) return text
  return String(text)
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, '[email]')
    .replace(/(?:\+?86)?1[3-9]\d{9}/g, '[phone]')
    .replace(/https?:\/\/[^\s/]+[^\s]*/g, '[url]')
    .replace(/\b\d{18}\b/g, '[id]')
    .replace(/\b\d{15}\b/g, '[id]')
}

const OUT_LANG = (lang) => (lang === 'zh' ? 'TA' : 'they')

function buildMessages(event) {
  const lang = event.input.lang === 'zh' ? 'zh' : 'en'
  const name = OUT_LANG(lang)
  const lens = event.input.lensName ? `\n- Perspective in use: ${event.input.lensName}` : ''
  const guide = event.input.guidance
    ? `\n- Guiding question (drives the reconstruction, do not answer it literally): ${event.input.guidance}`
    : ''
  const task = `Rewrite this entry now, as a json object with "rewrite", "warmth" and "reconstruction".\n- Third-person pronoun for the writer: "${name}" (singular).${lens}${guide}`
  return [
    { role: 'system', content: REWRITE_SYSTEM.replace(/{pronoun}/g, name) },
    { role: 'user', content: `${task}\n\nThe entry (first person, unedited):\n"""\n${event.input.text}\n"""` },
  ]
}

/** 训练目标只保留模型真正被要求输出的字段（lineInRewrite 是运行时校验，不是模型输出） */
function cleanReconstruction(rec) {
  if (!rec) return { criterion: '', line: '' }
  return { criterion: rec.criterion || '', line: rec.line || '' }
}

function asResponse(event) {
  return JSON.stringify({
    rewrite: event.output.rewrite,
    warmth: event.output.warmth,
    reconstruction: cleanReconstruction(event.output.reconstruction),
  })
}

/**
 * SFT：真实模型 + 通过质检 + 用户归档。demo/stub 与未通过的一律不进 SFT。
 */
export function buildSftRecords() {
  return flywheel.events
    .filter(
      (e) =>
        e.engine === 'model' &&
        e.user?.decision === 'accepted' &&
        e.critique?.passed &&
        e.output?.rewrite,
    )
    .map((e) => ({
      id: e.id,
      schema: 'recast.sft.v1',
      lang: e.input.lang,
      promptVersion: e.promptVersion,
      messages: buildMessages(e).map((m) => ({ ...m, content: redact(m.content) })),
      response: redact(asResponse(e)),
    }))
}

/**
 * 偏好对：同一原文、同一视角链路里的相邻两次尝试，后者被用户归档或通过质检，
 * 前者被拦。用 DPO 训练「哪种重构更好」比单纯 SFT 更能校准小模型的判断。
 */
export function buildPreferencePairs() {
  const pairs = []
  const byId = new Map(flywheel.events.map((e) => [e.id, e]))
  for (const later of flywheel.events) {
    if (!later.prevId) continue
    const earlier = byId.get(later.prevId)
    if (!earlier) continue
    // demo 稿件是桩生成的，不能进入偏好对，否则会教小模型模仿模板
    if (earlier.engine !== 'model' || later.engine !== 'model') continue
    if (earlier.critique?.passed) continue
    if (!later.critique?.passed && later.user?.decision !== 'accepted') continue
    if (!earlier.output?.rewrite || !later.output?.rewrite) continue
    pairs.push({
      id: `${earlier.id}->${later.id}`,
      schema: 'recast.preference.v1',
      lang: later.input.lang,
      promptVersion: later.promptVersion,
      input: {
        original: redact(earlier.input.text),
        lens: earlier.input.lens,
        lensName: earlier.input.lensName,
        guidance: earlier.input.guidance,
      },
      chosen: {
        rewrite: redact(later.output.rewrite),
        warmth: redact(later.output.warmth),
        reconstruction: cleanReconstruction(later.output.reconstruction),
        critique: later.critique || null,
      },
      rejected: {
        rewrite: redact(earlier.output.rewrite),
        warmth: redact(earlier.output.warmth),
        reconstruction: cleanReconstruction(earlier.output.reconstruction),
        critique: earlier.critique || null,
      },
    })
  }
  return pairs
}

/** 原始事件（调试 / 自行分析用），同样脱敏 */
export function buildRawRecords() {
  return flywheel.events.map((e) => ({
    ...e,
    input: { ...e.input, text: redact(e.input.text) },
    output: { ...e.output, rewrite: redact(e.output.rewrite), warmth: redact(e.output.warmth) },
  }))
}

/* ══ 下载 ══ */

function toJsonl(records) {
  return records.map((r) => JSON.stringify(r)).join('\n')
}

/**
 * 飞轮自己的下载实现：刻意不 import stores/exporters（那条链会经 journal 绕回
 * session，形成循环依赖）。逻辑与 exporters.downloadFile 相同，只有三行。
 */
function downloadFile(filename, mime, content) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function stamp() {
  return new Date().toISOString().slice(0, 10)
}

function save(name, records) {
  if (!records.length) return false
  downloadFile(`recast-${name}-${stamp()}.jsonl`, 'application/x-ndjson', `${toJsonl(records)}\n`)
  return true
}

export function exportSft() {
  return save('sft', buildSftRecords())
}

export function exportPreferences() {
  return save('preference', buildPreferencePairs())
}

export function exportRaw() {
  return save('flywheel-raw', buildRawRecords())
}
