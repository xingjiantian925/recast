/**
 * domain.js — 领域逻辑（确定性部分，与模型无关）
 *
 * 强度路由、分诊、分层剂量、分带说明都在这里。放这个文件的理由：
 * 它们是产品规则，不是模型行为——桩模式与真实模型模式共用同一套判断，
 * 接入模型不得改变路由/分诊/剂量的任何结论。
 *
 * i18n：文案来自 locales/，以 computed 暴露，切语言自动重算；
 * script 里访问必须写 `.value`，模板里自动解包。
 */
import { computed } from 'vue'
import { i18n } from '../i18n'

const tm = (key) => i18n.global.tm(key)

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

/** 合法分层键。持久化草稿可能来自旧版本（如已废弃的 everyday），加载时用它兜底校验。 */
export const TIER_KEYS = Object.keys(TIER_DOSE)

/** 分层信息 = 数字（本文件）+ 文案（locales 的 tier.*）。合并后调用方写法不变。 */
export const TIER_INFO = computed(() => {
  const copy = tm('tier')
  return Object.fromEntries(
    Object.entries(TIER_DOSE).map(([k, v]) => [k, { ...copy[k], ...v }]),
  )
})