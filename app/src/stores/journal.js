import { reactive, watch } from 'vue'
import { weekStart } from './session'

/**
 * journal.js — 条目、叙事线、剂量、复核
 *
 * 两条来自设计文档的硬约束落在这里，不是可选项：
 *
 * 1. **量表分数不渲染、不形成轨迹。** §7 合规要求"不对外展示 RRS-brooding / PHQ-9 轨迹"，
 *    量表仅用于自评与转介触发。因此分数只以 `baseline` 形式留在本地，
 *    用途仅限复核时的内部比较（是否恶化），界面上任何地方都读不到分数序列。
 *
 * 2. **自选择记录必须按可分析结构落库。** Step 3 约束 2：四种视角由用户自选属自选择偏倚，
 *    端内不假装做因果归因，但必须留下可与内嵌实验对照的结构化字段
 *    （视角 ID、强度、主题、是否通过质检、是否复选同一视角）。
 */

const KEY = 'recast.v0'

const blank = () => ({
  entries: [],
  dose: { weekStart: weekStart(), used: {}, warnings: 0 },
  checkins: [],
  // 内部比较用，永不渲染（见文件头约束 1）
  baseline: null, // { phq9, gad7, rrs, at }
  meta: { lastMetaNoteAt: null, metaNoteSeen: [], offRamp: false },
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return blank()
    const parsed = JSON.parse(raw)
    // 剂量按周重置
    if (parsed.dose?.weekStart !== weekStart()) {
      parsed.dose = { weekStart: weekStart(), used: {}, warnings: parsed.dose?.warnings ?? 0 }
    }
    return { ...blank(), ...parsed }
  } catch {
    return blank()
  }
}

export const journal = reactive(load())

watch(
  journal,
  (v) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v))
    } catch {
      /* 本地存储不可用时静默降级为内存态 */
    }
  },
  { deep: true }
)

export const journalApi = {
  /**
   * Step 9 归档。provenance 字段为可分析结构，供将来与内嵌实验对照。
   * `rewrite` 是通过质检的成稿，只截 400 字存入 `sample`，供 context/memory.js
   * 作为"记忆"里的风格样例；重评路径没有成稿，两个字段都不产生。
   */
  archive({ text, rewrite = '', intensity, band, lens, passed, critiqueHits, kind }) {
    const themes = inferThemes({ passed, critiqueHits })
    const entry = {
      id: `e_${Date.now().toString(36)}`,
      at: new Date().toISOString(),
      kind, // 'recast' | 'reappraisal'（低强度走重评，不计数为重构）
      intensity,
      band,
      lens,
      passed,
      critiqueHits,
      themes,
      excerpt: text.slice(0, 120),
      sample: kind === 'recast' && passed ? rewrite.slice(0, 400) : '',
      length: text.replace(/\s+/g, '').length,
      // 复选：同一视角是否被重复选择（用于观察耐受）
      repeatLens: journal.entries.some((e) => e.lens === lens && e.kind === 'recast'),
    }
    journal.entries.unshift(entry)
    if (kind === 'recast') journalApi.countDose()
    return entry
  },

  countDose() {
    const wk = weekStart()
    journal.dose.used[wk] = (journal.dose.used[wk] || 0) + 1
  },

  usedThisWeek() {
    return journal.dose.used[weekStart()] || 0
  },

  /** Step 0 · 记下分诊基线分数（内部比较用，不渲染） */
  setBaseline({ phq9, gad7, rrs }) {
    journal.baseline = { phq9, gad7, rrs, at: new Date().toISOString() }
  },

  /**
   * Step 10 · 复核。只存**结论**，不存分数序列。
   * `compare()` 在内部读基线做比较，结果一进一出都不落库、不上屏。
   */
  recordCheckin({ verdict, tier }) {
    journal.checkins.unshift({
      at: new Date().toISOString(),
      verdict, // 'stable' | 'improved' | 'worsened'
      tier,
    })
  },

  /**
   * 与基线比较。恶化判据取保守值：PHQ-9 +5 或 RRS-brooding +4。
   * （阈值为保守设定，需在验证阶段调整；依据 Giovanetti 2019 的 2 周伤害窗口。）
   */
  compare({ phq9, rrs }) {
    const b = journal.baseline
    if (!b) return 'stable'
    if (phq9 - b.phq9 >= 5 || rrs - b.rrs >= 4) return 'worsened'
    if (phq9 - b.phq9 <= -5 || rrs - b.rrs <= -4) return 'improved'
    return 'stable'
  },

  lastCheckin() {
    return journal.checkins[0] || null
  },

  checkinDue(tier) {
    const weeks = { routine: [2, 4, 8], watch: [2, 4, 6, 8], distress: [2, 4, 8] }[tier] || [2]
    const first = journal.entries.length
      ? Math.min(...journal.entries.map((e) => daysSince(e.at)))
      : 0
    const done = new Set(journal.checkins.map((c) => Math.floor(daysSince(c.at) / 7)))
    const dueWeek = weeks.find((w) => first >= w * 7 && !done.has(w))
    return { due: Boolean(dueWeek), week: dueWeek ?? null, schedule: weeks }
  },

  /** Step 10 · 退出设计（off-ramp）：主动降级路径 */
  setOffRamp(on) {
    journal.meta.offRamp = on
  },

  /** Step 8：元认知短内容，低频 */
  noteMetaSeen(id) {
    if (!journal.meta.metaNoteSeen.includes(id)) journal.meta.metaNoteSeen.push(id)
  },

  resetAll() {
    Object.assign(journal, blank())
  },
}

function daysSince(iso) {
  return (Date.now() - new Date(iso).getTime()) / 86400000
}

/**
 * 叙事主题标注（Step 9）。
 * 依据 Adler 2012（agency 上升先于症状改善）、McAdams & McLean 2013（redemption / contamination）。
 * 这里是桩规则；正式版应对文本做编码，且编码效度需先验证。
 */
function inferThemes({ passed, critiqueHits = [] }) {
  const has = (id) => critiqueHits.includes(id)
  return {
    agency: Boolean(passed) && has('action') ? 'rising' : 'flat',
    redemption: Boolean(passed) && has('meaning') ? 'redemption' : 'neutral',
    coherence: has('causal') && has('closure') ? 'high' : 'low',
  }
}

