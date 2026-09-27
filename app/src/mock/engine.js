/**
 * engine.js — 改写引擎（**桩实现**）
 *
 * 这里是全产品唯一需要"模型"的地方，也是技术方案里三个未决架构项之一
 * （大模型在哪跑：客户端自带 key / 自建代理 / 端上模型）的落点。
 * 本文件把它隔离成一个纯函数接口，第一版用桩数据，接真实实现时只替换本文件。
 *
 * 接口契约（不要改签名，只改实现）：
 *   runRecast({ text, intensity, band, lens, attempt })
 *     → { distanced, warmth, critique: { passed, findings: [{id, hit, evidence}] } }
 *
 * i18n：本文件对外输出的文案全部来自 locales/，以 computed 暴露，切语言自动重算。
 *   script 里访问这些导出必须写 `.value`；模板里自动解包。
 *   `routeByIntensity` / `triage` 是纯数字逻辑，不随语言变。
 *
 * 桩行为（刻意如此，不是 bug）：
 *   - 第 1 次 attempt 返回"第三人称但仍复述 + 自我批判"的输出 → 质检拦截
 *     这是产品设计纲要 Step 4 标注的、Giovanetti 伤害最可能的成因形态，
 *     必须能在界面上被看见、被阻断。
 *   - 第 2 次起返回发生重构的输出 → 质检通过。
 *   - attempt ≥ 3 视为"该素材不适合抽离" → 转稳定化分流。
 */

import { computed } from 'vue'
import { i18n } from '../i18n'
import {
  STUB_FAIL_OUTPUT,
  STUB_PASS_OUTPUT,
  STUB_WARMTH_OUTPUT,
  CRITIQUE_CRITERIA,
} from './fixtures'

const tm = (key) => i18n.global.tm(key)

const FAIL_FINDINGS = {
  insight: false,
  meaning: false,
  causal: false,
  closure: false,
  action: false,
}

const PASS_FINDINGS = {
  insight: true,
  meaning: true,
  causal: true,
  closure: true,
  action: true,
}

/** 质检证据（文案层，随语言切换） */
export const FAIL_EVIDENCE = computed(() => tm('evidence.fail'))
export const PASS_EVIDENCE = computed(() => tm('evidence.pass'))

/** 质检门：Step 5。判据是**是否真的发生了重构**，而不是"人称改对了没有"。 */
function critique(text, findings) {
  const hit = (id) => Boolean(findings[id])
  return {
    passed: Object.values(findings).some(Boolean),
    findings: CRITIQUE_CRITERIA.value.map((c) => ({
      id: c.id,
      label: c.label,
      hint: c.hint,
      hit: hit(c.id),
      evidence: hit(c.id) ? PASS_EVIDENCE.value[c.id] : FAIL_EVIDENCE.value[c.id],
    })),
  }
}

/** 低强度（≤3）不走抽离，走积极重评 —— 见 Step 2 路由表 */
function reappraisal(text) {
  return {
    distanced: text,
    warmth: '',
    critique: {
      passed: false,
      skipped: true,
      reason: 'low-intensity',
      findings: [],
    },
  }
}

export async function runRecast({ text, intensity, band, lens, attempt }) {
  // 桩：模拟一次模型往返的延迟，让 UI 的加载态能被看见
  await new Promise((r) => setTimeout(r, 620))

  if (band === 'low') return reappraisal(text)

  const failed = attempt <= 1
  return {
    distanced: failed ? STUB_FAIL_OUTPUT.value : STUB_PASS_OUTPUT.value,
    warmth: failed ? '' : STUB_WARMTH_OUTPUT.value,
    critique: critique(text, failed ? FAIL_FINDINGS : PASS_FINDINGS),
  }
}

/** Step 2 路由：把自评强度映射到方法。**不许一刀切抽离。** */
export function routeByIntensity(intensity) {
  if (intensity >= 7) return 'high'
  if (intensity >= 4) return 'mid'
  return 'low'
}

/** 分带说明（文案随语言切换） */
export const BAND_INFO = computed(() => tm('band'))

/** Step 0 分诊：把量表分数映射到分层。分数本身**不向用户展示轨迹**。 */
export function triage({ phq9, gad7, rrs, selfHarmFlag }) {
  if (selfHarmFlag > 0) return 'crisis'
  if (phq9 >= 10 || gad7 >= 10) return 'distress'
  if (rrs >= 12) return 'watch'
  return 'routine'
}

/**
 * 剂量数字：不随语言变，因此留在本文件。
 * 数值本身是保守余量（见产品设计纲要 §4），需在验证阶段调整。
 */
const TIER_DOSE = {
  routine: { doseCap: 3, checkinWeeks: [2, 4, 8] },
  watch: { doseCap: 2, checkinWeeks: [2, 4, 6, 8], mustCheckWeek2: true },
  distress: { doseCap: 3, checkinWeeks: [2, 4, 8] },
  crisis: { doseCap: 0, checkinWeeks: [2] },
}

/** 分层信息 = 数字（本文件）+ 文案（locales 的 tier.*）。合并后调用方写法不变。 */
export const TIER_INFO = computed(() => {
  const copy = tm('tier')
  return Object.fromEntries(
    Object.entries(TIER_DOSE).map(([k, v]) => [k, { ...copy[k], ...v }]),
  )
})