import { createI18n } from 'vue-i18n'
import en from './locales/en'

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
 *
 * 性能决定：**语言包按需加载**。en 是默认语言与 fallback，随主包内置；
 * zh 走动态 import，由构建器拆成独立 chunk，只在用户选择中文时才下载。
 * 因此 setLocale 是异步的——调用方（顶栏语言 pill）不等待也安全：
 * 语言包就绪前界面短暂停留在 fallback 文案，就绪后整体切换。
 */
export const LOCALES = ['en', 'zh']
export const DEFAULT_LOCALE = 'en'

const STORAGE_KEY = 'recast.locale'
const HTML_LANG = { en: 'en', zh: 'zh-CN' }

const LOADERS = {
  en: () => Promise.resolve({ default: en }),
  zh: () => import('./locales/zh'),
}
const loaded = new Set(['en'])

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
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { en },
})

async function loadLocale(code) {
  if (loaded.has(code)) return
  const mod = await LOADERS[code]()
  i18n.global.setLocaleMessage(code, mod.default)
  loaded.add(code)
}

/** DOM 与存储的落地，与语言包加载解耦 */
function syncDom(code, { persist = true } = {}) {
  i18n.global.locale.value = code
  document.documentElement.setAttribute('lang', HTML_LANG[code])
  document.title = i18n.global.t('app.title')
  const meta = document.querySelector('meta[name="description"]')
  if (meta) meta.setAttribute('content', i18n.global.t('app.description'))
  if (!persist) return
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    /* 忽略：存储不可用时仅本次会话生效 */
  }
}

/** 切换语言：先确保语言包就绪，再落 DOM 与存储 */
export async function setLocale(next) {
  if (!LOCALES.includes(next)) return
  await loadLocale(next)
  syncDom(next)
}

/**
 * 启动就绪信号：上次选择的语言若不是默认语言，先拉取语言包再挂载，
 * 避免中文用户首屏闪一遍英文。加载失败（离线 + 无缓存）时留在 en，
 * 但**不覆盖**用户已存的语言偏好。
 */
export const i18nReady = (async () => {
  const saved = storedLocale()
  if (saved === DEFAULT_LOCALE) {
    syncDom(saved)
    return
  }
  try {
    await setLocale(saved)
  } catch {
    syncDom(DEFAULT_LOCALE, { persist: false })
  }
})()
