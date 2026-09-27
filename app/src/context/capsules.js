/**
 * capsules.js — 上下文胶囊
 *
 * 「胶囊」= 一段目的明确、可整体取舍的上下文单元。每次模型调用前按优先级装配：
 *   规则（guard）→ 任务（task）→ 原文（source）→ 记忆（memory）
 *
 * 为什么不用现成 agent 框架的 memory / context 抽象：它们默认「服务端会话 +
 * 向量召回」，与本产品边界冲突（全本地、可见、可清除、不静默分析）。这里用
 * 不到百行把概念落实清楚：
 *   - 每枚胶囊声明 role / priority / budget 意义上的可截断性；
 *   - 装配在总字符预算内进行，被截断 / 挤掉的部分写入 report，
 *     界面（RecastView 的「本次上下文」）与调试读同一份数据。
 *
 * 预算用字符数而不是 token 数：不引 tokenizer 依赖；DeepSeek 侧上下文窗口
 * 远大于我们的实际用量，字符预算是保守近似。
 */
import { REWRITE_SYSTEM, CRITIQUE_SYSTEM } from '../model/prompts'

const TRUNCATION_MARK = '\n[…truncated to fit the request budget…]'

/** 单次请求的总字符预算（含全部胶囊） */
export const REWRITE_BUDGET = 9000
export const CRITIQUE_BUDGET = 12000

/**
 * 按优先级装配胶囊。
 * @param {Array<{id:string, kind:string, role:'system'|'user', priority:number, truncatable?:boolean, text:string}>} capsules
 * @param {number} totalChars
 * @returns {{ messages: Array<{role:string, content:string}>, report: object }}
 */
export function assembleCapsules(capsules, totalChars) {
  const ordered = [...capsules].sort((a, b) => b.priority - a.priority)
  const included = []
  const dropped = []
  let used = 0

  for (const c of ordered) {
    const remaining = totalChars - used
    if (c.text.length <= remaining) {
      included.push(c)
      used += c.text.length
    } else if (c.truncatable && remaining > TRUNCATION_MARK.length + 80) {
      included.push({ ...c, text: `${c.text.slice(0, remaining - TRUNCATION_MARK.length)}${TRUNCATION_MARK}` })
      used = totalChars
    } else {
      dropped.push({ id: c.id, kind: c.kind, chars: c.text.length, why: 'budget' })
    }
  }

  // system 在前、user 在后；同角色内保持优先级顺序
  const content = (role) => included.filter((c) => c.role === role).map((c) => c.text).join('\n\n')
  const messages = []
  const sys = content('system')
  const usr = content('user')
  if (sys) messages.push({ role: 'system', content: sys })
  if (usr) messages.push({ role: 'user', content: usr })

  return {
    messages,
    report: {
      budget: totalChars,
      used,
      included: included.map((c) => ({ id: c.id, kind: c.kind, chars: c.text.length })),
      dropped,
    },
  }
}

/* ══ 改写任务 ══ */

export function buildRewriteContext({ text, lens, guidance, pronoun, anchors = [] }) {
  const capsules = [
    {
      id: 'rules.rewrite',
      kind: 'guard',
      role: 'system',
      priority: 100,
      text: REWRITE_SYSTEM.replace('{pronoun}', pronoun),
    },
    {
      id: 'task.recast',
      kind: 'task',
      role: 'user',
      priority: 90,
      text: taskText({ lens, guidance, pronoun }),
    },
    {
      id: 'source.entry',
      kind: 'source',
      role: 'user',
      priority: 80,
      truncatable: true,
      text: `The entry (first person, unedited):\n"""\n${text}\n"""`,
    },
  ]

  if (anchors.length) {
    capsules.push({
      id: 'memory.style',
      kind: 'memory',
      role: 'system',
      priority: 60,
      truncatable: true,
      text: memoryText(anchors),
    })
  }

  return assembleCapsules(capsules, REWRITE_BUDGET)
}

function taskText({ lens, guidance, pronoun }) {
  const lines = [
    'Rewrite this entry now, as a json object with "rewrite" and "warmth".',
    `- Third-person pronoun for the writer: ${pronoun}.`,
  ]
  if (lens) lines.push(`- Perspective in use: ${lens.name} — ${lens.desc}`)
  if (guidance) lines.push(`- Guiding question (drives the reconstruction, do not answer it literally): ${guidance}`)
  return lines.join('\n')
}

function memoryText(anchors) {
  const head =
    'Style reference only: these are earlier rewrites the writer accepted. Match their plain, grounded tone. Do not copy their content.'
  const samples = anchors.map((a, i) => `Sample ${i + 1}:\n"""\n${a.sample}\n"""`)
  return [head, ...samples].join('\n\n')
}

/* ══ 质检任务 ══ */

export function buildCritiqueContext({ text, rewrite }) {
  const capsules = [
    { id: 'rules.critique', kind: 'guard', role: 'system', priority: 100, text: CRITIQUE_SYSTEM },
    {
      id: 'source.entry',
      kind: 'source',
      role: 'user',
      priority: 80,
      truncatable: true,
      text: `The original (first person):\n"""\n${text}\n"""`,
    },
    {
      id: 'source.rewrite',
      kind: 'source',
      role: 'user',
      priority: 70,
      truncatable: true,
      text: `The rewrite (third person):\n"""\n${rewrite}\n"""`,
    },
  ]
  return assembleCapsules(capsules, CRITIQUE_BUDGET)
}