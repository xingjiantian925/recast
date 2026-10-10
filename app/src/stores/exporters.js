import { journal } from './journal'
import { LENSES } from '../mock/fixtures'

/**
 * exporters.js — 数据可携带（导出/备份）
 *
 * 产品承诺"数据只留在本地"，但只留本地不等于用户拥有数据：
 * 换设备、清缓存之前，用户应该能把自己的记录带走。
 *
 * 两条红线：
 *  1. API Key / 加密材料**永不**进入导出内容（它们本来也不在 journal 里）。
 *  2. §7 合规：基线量表分数（journal.baseline）仅内部比较用，不写入导出，
 *     避免形成任何可传播的分数轨迹文件。
 */

function download(filename, mime, content) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function stamp() {
  return new Date().toISOString().slice(0, 10)
}

/** JSON：机器可读，可用于将来导入或自行分析 */
export function exportJson() {
  const payload = {
    app: 'recast',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: journal.entries,
    checkins: journal.checkins,
    dose: journal.dose,
  }
  download(`recast-export-${stamp()}.json`, 'application/json', JSON.stringify(payload, null, 2))
}

/** Markdown：人类可读的叙事摘要 */
export function exportMarkdown(t) {
  const lines = [
    `# ${t('settings.exportMdTitle')}`,
    '',
    `${t('settings.exportMdGenerated')} ${new Date().toLocaleString()}`,
    '',
  ]
  if (!journal.entries.length) {
    lines.push(t('settings.exportMdEmpty'), '')
  }
  for (const e of journal.entries) {
    const when = new Date(e.at).toLocaleString()
    const kind = e.kind === 'recast' ? t('narrative.filterRecast') : t('narrative.filterReappraisal')
    lines.push(`## ${when} · ${kind}`, '')
    lines.push(`- ${t('settings.exportMdBand')}: ${e.band || '—'}`)
    if (e.lens) {
      const lens = LENSES.value.find((l) => l.id === e.lens)?.name || e.lens
      lines.push(`- ${t('settings.exportMdLens')}: ${lens}`)
    }
    lines.push(`- ${t('settings.exportMdPassed')}: ${e.passed ? '✓' : '—'}`)
    if (e.intensity != null) lines.push(`- ${t('settings.exportMdIntensity')}: ${e.intensity}`)
    lines.push('', `> ${e.excerpt || ''}`, '')
    if (e.sample) {
      lines.push(t('settings.exportMdSample'), '', e.sample, '')
    }
  }
  download(`recast-export-${stamp()}.md`, 'text/markdown', lines.join('\n'))
}
