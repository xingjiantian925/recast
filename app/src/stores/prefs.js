/**
 * prefs.js — 用户偏好（可持久化，且不含任何敏感项）
 *
 * 目前三项：
 *  - pronoun   ：第三人称称呼（neutral / feminine / masculine），进入改写请求
 *  - useMemory ：是否把「记忆」里的风格样例带进请求（context/memory.js 读取）
 *  - theme     ：浅色 / 深色（tokens.css 已备 .dark 令牌组）
 *
 * 与模型 Key 无关；Key 永远只在 model/config.js 的内存容器里。
 */
import { computed, reactive, watch } from 'vue'
import { i18n } from '../i18n'

const KEY = 'recast.prefs.v0'
const DEFAULTS = { pronoun: 'neutral', useMemory: true, theme: 'light' }
const PRONOUNS = ['neutral', 'feminine', 'masculine']
const THEMES = ['light', 'dark']

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return {
      pronoun: PRONOUNS.includes(parsed.pronoun) ? parsed.pronoun : DEFAULTS.pronoun,
      useMemory: typeof parsed.useMemory === 'boolean' ? parsed.useMemory : DEFAULTS.useMemory,
      theme: THEMES.includes(parsed.theme) ? parsed.theme : DEFAULTS.theme,
    }
  } catch {
    /* 存储不可用或内容损坏时退回默认值 */
    return {}
  }
}

export const prefs = reactive({ ...DEFAULTS, ...load() })

watch(
  prefs,
  (v) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v))
    } catch {
      /* 本地存储不可用时仅本次会话生效 */
    }
  },
  { deep: true },
)

/** 第三人称词：中文侧 TA / 她 / 他，英文侧 they / she / he（数据取自 locales，用 tm()） */
export const pronounWord = computed(
  () => i18n.global.tm('settings.pronounWords')[prefs.pronoun] || 'TA',
)

/** 主题：把 .dark 类挂到 <html>（tokens.css 的选择器是 .dark） */
export function applyTheme() {
  document.documentElement.classList.toggle('dark', prefs.theme === 'dark')
}

export function setTheme(next) {
  if (!THEMES.includes(next)) return
  prefs.theme = next
  applyTheme()
}