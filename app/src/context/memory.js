/**
 * memory.js — 记忆层（只派生，不分析）
 *
 * 三条边界来自设计文档，不要放宽：
 *  1. **不用模型做静默分析**：这里不调用任何模型，只从用户自己的归档里取
 *     「通过质检的改写样例」（archive 时截取 400 字的成稿片段）。
 *  2. **可见、可控**：设置页能看到当前正在用的样例，可整体关闭（prefs.useMemory）。
 *  3. **只影响改写风格**：记忆不参与剂量、不分流、不触发任何东西。
 *
 * 「上下文胶囊」装配时，本模块的输出会作为 memory 胶囊进入请求（见 capsules.js）。
 */
import { journal } from '../stores/journal'
import { prefs } from '../stores/prefs'

const ANCHOR_LIMIT = 2

/** 候选样例：最近 ≤2 条「已接受且通过质检」的改写片段（与开关无关，供设置页展示） */
export function candidateAnchors() {
  return journal.entries
    .filter((e) => e.kind === 'recast' && e.passed && e.sample)
    .slice(0, ANCHOR_LIMIT)
    .map((e) => ({ id: e.id, at: e.at, sample: e.sample }))
}

/** 实际进入请求的样例：开关关闭时为空 */
export function styleAnchors() {
  if (!prefs.useMemory) return []
  return candidateAnchors()
}