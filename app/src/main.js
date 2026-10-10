import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { i18n, i18nReady } from './i18n'
import { applyTheme } from './stores/prefs'
import { restoreApiKey } from './model/config'
import './design/base.css'

// 主题在挂载前应用，避免刷新时先亮后暗的闪烁
applyTheme()

// 挂载前并行完成两件小事，保证首屏状态正确：
//  1. 恢复本机加密保存的 Key（不可用时立即返回），顶栏状态与设置页首屏即正确；
//  2. 若用户上次选择了非默认语言，拉取其语言包（本地 chunk，通常毫秒级），
//     避免中文用户首屏闪一遍英文。
Promise.all([restoreApiKey().catch(() => {}), i18nReady]).finally(() => {
  createApp(App).use(router).use(i18n).mount('#app')
})