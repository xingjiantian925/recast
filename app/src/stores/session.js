import { reactive } from 'vue'
import { routeByIntensity } from '../mock/engine'

/**
 * session.js — 一次书写会话的状态机
 *
 * 严格对应 `产品设计纲要.md` §3 的 Step 0 → Step 9。
 * `canEnter()` 不是 UI 装饰，是流程正确性：它阻止"没分诊就改写""低强度却走抽离"
 * 这类会直接违反证据的路径。
 */

function weekStart(d = new Date()) {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // 周一为一周起点
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x.toISOString().slice(0, 10)
}

export const session = reactive({
  /* Step 0 */
  tier: null,
  triagedAt: null,

  /* Step 1 */
  text: '',
  startedAt: null,
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
  result: null, // { distanced, warmth, critique }

  /* Step 7 / Step 10 */
  stabilized: false,
  flags: [],

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
  async runEngine() {
    const { runRecast } = await import('../mock/engine')
    this.busy = true
    this.attempt += 1
    try {
      this.result = await runRecast({
        text: this.text,
        intensity: this.intensity,
        band: this.band,
        lens: this.lens,
        attempt: this.attempt,
      })
    } finally {
      this.busy = false
    }
  },
  get exhausted() {
    // 连续 3 次未通过 → 判定该素材不适合抽离，转稳定化（Step 5 → Step 7）
    return this.attempt >= 3 && this.result && !this.result.critique.passed
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
        return this.wordCount >= 20
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
    if (this.wordCount < 20) return { name: 'write' }
    if (this.band === null) return { name: 'intensity' }
    if (this.band === 'low') return { name: 'archive' }
    if (!this.lens) return { name: 'lens' }
    return { name: 'recast' }
  },

  /* ── 归档后清空会话，开始新的一次 ── */
  reset() {
    this.text = ''
    this.startedAt = null
    this.elapsedMs = 0
    this.intensity = null
    this.band = null
    this.lens = 'future'
    this.lensTouched = false
    this.attempt = 0
    this.result = null
    this.busy = false
    this.stabilized = false
    this.flags = []
  },
})

export { weekStart }