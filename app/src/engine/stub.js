/**
 * stub.js — 演示模式引擎（没有配置模型 Key 时的默认路径）
 *
 * 刻意保留的演示行为（不是 bug）：
 *  - 第 1 次 attempt 返回"第三人称但仍在复述 + 自我批判"的输出 → 质检拦截。
 *    这是产品设计纲要 Step 4 标注的、Giovanetti 伤害最可能的成因形态，
 *    必须能在界面上被看见、被阻断。
 *  - 第 2 次起返回发生重构的输出 → 质检通过。
 *  - attempt ≥ 3 视为"该素材不适合抽离" → 转稳定化分流（由 session 判定）。
 *
 * 真实模型路径见 remote.js；模式分派见 index.js。
 */
import { buildCritique } from './findings'
import { i18n } from '../i18n'
import { STUB_FAIL_OUTPUT, STUB_PASS_OUTPUT, STUB_WARMTH_OUTPUT } from '../mock/fixtures'

const t = (key, params) => i18n.global.t(key, params)

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

const LOW_INTENSITY = {
  passed: false,
  skipped: true,
  reason: 'low-intensity',
  findings: [],
}

export async function runStubRecast({ text, band, attempt }) {
  // 模拟一次模型往返的延迟，让 UI 的加载态能被看见
  await new Promise((r) => setTimeout(r, 620))

  if (band === 'low') {
    return { distanced: text, warmth: '', critique: LOW_INTENSITY, contextReport: null, engine: 'demo' }
  }

  const failed = attempt <= 1
  // 演示改写基于**用户自己的原文**生成，而不是一段固定示例：
  // 否则不管输入什么都只会看到同一段"评审会"文本，用户会以为工具根本没在处理自己的输入。
  // 原文为空（Step 1 现在允许空稿继续）时，退回固定桩文本，保证流程仍可走通。
  const body = (text || '').trim()
  const hasBody = body.length > 0
  const distanced = hasBody
    ? t(failed ? 'stub.failWrap' : 'stub.passWrap', { text: body })
    : (failed ? STUB_FAIL_OUTPUT.value : STUB_PASS_OUTPUT.value)
  const warmth = failed ? '' : (hasBody ? t('stub.warmWrap') : STUB_WARMTH_OUTPUT.value)

  return {
    distanced,
    warmth,
    critique: buildCritique(failed ? FAIL_FINDINGS : PASS_FINDINGS),
    contextReport: null,
    engine: 'demo',
  }
}