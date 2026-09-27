import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zh from './locales/zh'

/**
 * i18n/index.js — 语言层
 *
 * 三条产品决定，集中写在这里而不是散到各视图：
 *  1. **默认英文**，且刻意**不做浏览器语言嗅探**：语言是用户显式选择的结果，
 *     不是从环境推断出来的。选择写入 localStorage，下次进来沿用。
 *  2. `<html lang>` / `<title>` / meta description 由本文件统一下沉同步，
 *     视图不各写一份。
 *  3. 定位于健康工具：英文侧的危机资源号码与量表措辞须与中文侧**分别**核对，
 *     见 locales/*.js 里的 [REVIEW] 标记。
 */
export const LOCALES = ['en', 'zh']
export const DEFAULT_LOCALE = 'en'

const STORAGE_KEY = 'recast.locale'
const HTML_LANG = { en: 'en', zh: 'zh-CN' }

function storedLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && LOCALES.includes(saved)) return saved
  } catch {
    /* 本地存储不可用时退回默认语言 */
  }
  return DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: storedLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: { en, zh },
})

/** 切换语言：i18n 只管文案，DOM 与存储由这里落地 */
export function setLocale(next) {
  if (!LOCALES.includes(next)) return
  i18n.global.locale.value = next
  document.documentElement.setAttribute('lang', HTML_LANG[next])
  document.title = i18n.global.t('app.title')
  const meta = document.querySelector('meta[name="description"]')
  if (meta) meta.setAttribute('content', i18n.global.t('app.description'))
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* 忽略：存储不可用时仅本次会话生效 */
  }
}

setLocale(i18n.global.locale.value)