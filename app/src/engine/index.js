/**
 * index.js — 引擎门面
 *
 * 上层（session / 视图）只认这里，不关心本次跑的是哪种模式：
 *   - model：用户配置了自己的 Key → 真实模型（engine/remote.js）
 *   - demo ：没有 Key → 桩（engine/stub.js），保留刻意设计的演示行为
 * 模式在两次调用之间可以随时切换（设置页填上 Key 即生效），调用方代码不变。
 *
 * 领域逻辑（路由 / 分诊 / 剂量）与质检形状从子模块转出，方便视图单点导入。
 */
import { computed } from 'vue'
import { hasApiKey } from '../model/config'
import { runStubRecast } from './stub'
import { runRemoteRecast } from './remote'

export { routeByIntensity, triage, BAND_INFO, TIER_INFO } from './domain'
export { FAIL_EVIDENCE, PASS_EVIDENCE, buildCritique } from './findings'

export const engineMode = computed(() => (hasApiKey.value ? 'model' : 'demo'))

/**
 * 一次改写（含质检）。参数契约：
 * @param {{ text: string, intensity: number, band: 'high'|'mid'|'low', lens: string, attempt: number, guidance?: string }} params
 * @returns {Promise<{ distanced: string, warmth: string, critique: object, contextReport: object|null, engine: 'model'|'demo' }>}
 */
export function runRecast(params) {
  return engineMode.value === 'model' ? runRemoteRecast(params) : runStubRecast(params)
}