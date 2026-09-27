/**
 * findings.js — 质检结果的标准形状（桩与真实模型共用）
 *
 * 界面契约（RecastView 的质检门）依赖这里的三件事，改动前先看调用方：
 *  - findings 恒为 5 条判据，顺序 = criteria 定义顺序；
 *  - passed = 任一判据命中。**判据是"是否真的发生了重构"，不是"人称改对了没有"**；
 *  - findings 存 id + hit，并在模型给出时附 **why**（模型针对本次改写给出的一句依据）。
 *    label / 兜底 evidence 由界面按 id 从 CRITIQUE_CRITERIA / PASS_EVIDENCE /
 *    FAIL_EVIDENCE 现取，切语言即刻生效。**why 是原文引语，不翻译、不烘焙**：
 *    早先把文案烘焙进 result 会导致切语言后质检门停留在旧语言，而把固定示例
 *    当依据显示又会让人误以为工具没在处理自己的输入。
 *
 * note 字段只出现在模型路径（质检模型给的一句话总评），桩路径没有。
 */
import { computed } from 'vue'
import { i18n } from '../i18n'
import { CRITIQUE_CRITERIA } from '../mock/fixtures'

const tm = (key) => i18n.global.tm(key)

/** 质检证据（文案层，随语言切换） */
export const FAIL_EVIDENCE = computed(() => tm('evidence.fail'))
export const PASS_EVIDENCE = computed(() => tm('evidence.pass'))

/**
 * 把模型返回的单条判据归一化为 {hit, why}。
 * 兼容三种形状：boolean、字符串 "true"、以及模型路径的 {hit, why}。
 * why 只保留模型给出的原话（本次改写的引语），没有就是空串，由界面兜底。
 */
function normalize(value) {
  if (value && typeof value === 'object') {
    return {
      hit: value.hit === true || value.hit === 'true',
      why: typeof value.why === 'string' ? value.why.trim() : '',
    }
  }
  return { hit: value === true || value === 'true', why: '' }
}

/**
 * 由命中表生成标准质检结果。
 * @param {Record<string, boolean|string|{hit:boolean,why?:string}>} hitMap 判据 id → 命中情况
 * @param {{ note?: string }} [extra] 模型质检的一句话总评
 */
export function buildCritique(hitMap = {}, { note } = {}) {
  const findings = CRITIQUE_CRITERIA.value.map((c) => {
    const { hit, why } = normalize(hitMap[c.id])
    return { id: c.id, hit, ...(why ? { why } : {}) }
  })
  return {
    passed: findings.some((f) => f.hit),
    findings,
    ...(note ? { note } : {}),
  }
}