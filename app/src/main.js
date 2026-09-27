import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { i18n } from './i18n'
import { applyTheme } from './stores/prefs'
import { restoreApiKey } from './model/config'
import './design/base.css'

// 主题在挂载前应用，避免刷新时先亮后暗的闪烁
applyTheme()

// 挂载前先尝试恢复本机加密保存的 Key（不可用时立即返回），
// 这样顶栏状态与设置页在首屏就是正确的，不会先闪一下"未配置"。
restoreApiKey()
  .catch(() => {})
  .finally(() => {
    createApp(App).use(router).use(i18n).mount('#app')
  })