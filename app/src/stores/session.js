import { reactive, watch } from 'vue'
// 只从 domain 静态导入：engine 门面会经 remote → memory → journal 回到本模块，
// 静态导入会形成环；门面本身在 runEngine 里用动态 import 取。
import { routeByIntensity, TIER_KEYS } from '../engine/domain'

/**
 * session.js — 一次书写会话的状态机
 *
 * 严格对应 `产品设计纲要.md` §3 的 Step 0 → Step 9。
 * `canEnter()` 不是 UI 装饰，是流程正确性：它阻止"没分诊就改写""低强度却走抽离"
 * 这类会直接违反证据的路径。
 *
 * 草稿持久化：除瞬时态（busy / error）外全部字段写入 localStorage，
 * 刷新或误关标签页不丢稿；刷新后落在质检页也能看到上一次的结果。
 * 擦除走 resetAll()（SafetyView 的"清除本机全部数据"）。
 */

const KEY = 'recast.session.v0'

/** 需要跨刷新保留的字段。busy / error 是瞬时态，刻意不在列。 */
const PERSISTED = [
  'tier',
  'triagedAt',
  'text',
  'startedAt',
  'writtenAt',
  'elapsedMs',
  'intensity',
  'band',
  'lens',
  'lensTouched',
  'attempt',
  'result',
  'stabilized',
  'flags',
]

function blank() {
  return {
    /* Step 0 */
    tier: null,
    triagedAt: null,

    /* Step 1 */
    text: '',
    startedAt: null,
    // 「写完了，下一步」的确认时间戳。Step 1 的完成以用户确认为准，不以字数门槛为准：
    // 允许空稿继续，缺失的要素在后续步骤用选项 + 输入补齐。entryRoute 用它与字数为 0 区分开。
    writtenAt: null,
    elapsedMs: 0,

    /* Step 2 */
    intensity: null,
    band: null,

    /* Step 3 */
    // 首次引导默认值：未来的自己（时间距离机制独立于社会距离，不依赖文化上是否可用的"旁观者智慧"）
    // 默认值本身是一个有效选择，因此不必等用户点选就能继续；lensTouched 只记录"用户主动改过"。
    lens: 'future',
    lensTouched: false,

    /* Step 4–6 */
    attempt: 0,
    busy: false,
    error: null, // 模型层错误码（ModelError.code），界面按码取文案
    result: null, // { distanced, warmth, critique, contextReport, engine }

    /* Step 7 / Step 10 */
    stabilized: false,
    flags: [],
  }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    const draft = Object.fromEntries(PERSISTED.filter((k) => k in parsed).map((k) => [k, parsed[k]]))
    // 旧版本可能留下已废弃的 tier（例如 everyday）。无效分层会让所有按 tier 取文案的页面在渲染时抛错，
    // 表现为整页空白。这里统一回退为"未分诊"，把用户安全地送回 /intake，草稿正文不受影响。
    if (draft.tier && !TIER_KEYS.includes(draft.tier)) {
      draft.tier = null
      draft.triagedAt = null
    }
    return draft
  } catch {
    /* 存储不可用或内容损坏时从空白开始 */
    return {}
  }
}

export const session = reactive({
  ...blank(),
  ...loadDraft(),

  /* ── 计算 ── */
  get wordCount() {
    return this.text.replace(/\s+/g, '').length
  },
  get minutes() {
    return this.elapsedMs / 60000
  },
  get reachEvidenceDose() {
    return this.minutes >= 15
  },

  /* ── 动作 ── */
  setTier(t) {
    this.tier = t
    this.triagedAt = new Date().toISOString()
  },
  startWriting() {
    if (!this.startedAt) this.startedAt = Date.now()
  },
  /** 用户确认"这一步写完了"（不要求字数）——标记 Step 1 已走过，允许进入下一步 */
  finishWriting() {
    this.writtenAt = Date.now()
  },
  setElapsed(ms) {
    this.elapsedMs = ms
  },
  setIntensity(v) {
    this.intensity = v
    this.band = routeByIntensity(v)
  },
  chooseLens(id) {
    this.lens = id
    this.lensTouched = true
  },
  /**
   * 跑一次改写 + 质检。
   * attempt 只在成功拿到结果后自增：网络/鉴权失败不消耗重试次数，
   * 否则三次网络抖动就会把用户误判成"该素材不适合抽离"。
   */
  async runEngine({ guidance } = {}) {
    if (this.busy) return
    this.busy = true
    this.error = null
    const nextAttempt = this.attempt + 1
    try {
      const { runRecast } = await import('../engine')
      this.result = await runRecast({
        text: this.text,
        intensity: this.intensity,
        band: this.band,
        lens: this.lens,
        attempt: nextAttempt,
        guidance,
      })
      this.attempt = nextAttempt
    } catch (err) {
      // 模型层错误收敛为 code；未知错误按服务端错误处理
      this.error = err?.code || 'server'
      this.result = null
    } finally {
      this.busy = false
    }
  },
  get exhausted() {
    // 连续 3 次未通过 → 判定该素材不适合抽离，转稳定化（Step 5 → Step 7）
    // 结果缺失或结构不完整时不算耗尽（避免持久化的旧数据把界面判成耗尽）
    return this.attempt >= 3 && !!this.result?.critique && !this.result.critique.passed
  },
  stabilize(reason) {
    this.stabilized = true
    this.flags.push({ reason, at: new Date().toISOString() })
  },

  /* ── 守卫 ── */
  canEnter(need) {
    switch (need) {
      case 'triaged':
        return !!this.tier && this.tier !== 'crisis'
      case 'written':
        // 不再以字数设门槛：空稿也能继续，缺失的要素留给后续步骤补齐。
        // 只要求已分诊（保证流程顺序与安全分流），而不是要求写了多少字。
        return !!this.tier && this.tier !== 'crisis'
      case 'routed':
        return this.band !== null
      case 'lensed':
        return (this.band === 'high' || this.band === 'mid') && !!this.lens
      default:
        return true
    }
  },
  entryRoute() {
    if (!this.tier) return { name: 'intake' }
    if (this.tier === 'crisis' || this.stabilized) return { name: 'support' }
    if (!this.writtenAt) return { name: 'write' }
    if (this.band === null) return { name: 'intensity' }
    if (this.band === 'low') return { name: 'archive' }
    if (!this.lens) return { name: 'lens' }
    return { name: 'recast' }
  },

  /* ── 归档后清空会话，开始新的一次（保留分层：剂量上限按会话生效） ── */
  reset() {
    const t = this.tier
    const at = this.triagedAt
    Object.assign(this, blank())
    this.tier = t
    this.triagedAt = at
  },

  /* ── 全量擦除（含分层），供"清除本机全部数据"使用 ── */
  resetAll() {
    Object.assign(this, blank())
  },
})

/* 草稿落盘：400ms 防抖，避免书写时每个键击都同步写 localStorage */
let saveTimer = null
watch(
  session,
  (s) => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        const snapshot = Object.fromEntries(PERSISTED.map((k) => [k, s[k]]))
        localStorage.setItem(KEY, JSON.stringify(snapshot))
      } catch {
        /* 存储不可用时降级为内存态 */
      }
    }, 400)
  },
  { deep: true },
)

export { weekStart }

function weekStart(d = new Date()) {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // 周一为一周起点
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x.toISOString().slice(0, 10)
}