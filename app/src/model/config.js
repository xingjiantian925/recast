/**
 * config.js — 模型接入配置
 *
 * 安全约束（用户硬要求，不要放宽）：
 *  - **API Key 只存在于内存**：用独立的容器持有，绝不写入 localStorage / cookie /
 *    IndexedDB / 日志 / 导出，刷新即失效。任何整体序列化都不要带上它。
 *  - 可持久化的只有非敏感项：Base URL 与模型名。
 *  - 请求直连用户自己配置的服务商；本产品没有（也不会有）自己的中转服务器。
 *
 * Phase 2（Tauri 桌面版）接入后，Key 改由 Rust 侧读系统钥匙串，webview/JS
 * 不再接触明文 Key —— 届时只需替换本模块与调用侧，其余代码不动。
 */
import { computed, reactive, watch } from 'vue'

export const DEFAULT_BASE_URL = 'https://api.deepseek.com'
// 2026-09 起 DeepSeek 的现行模型名（V4.1 Flash）；旧名 deepseek-chat 将弃用。
// 任何 OpenAI 兼容服务商都可以填在这里（改 Base URL + 模型名即可）。
export const DEFAULT_MODEL = 'deepseek-flash'

const KEY_STORAGE = 'recast.model.v0'

function loadPersisted() {
  try {
    const raw = localStorage.getItem(KEY_STORAGE)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return {
      baseUrl: typeof parsed.baseUrl === 'string' && parsed.baseUrl ? parsed.baseUrl : DEFAULT_BASE_URL,
      model: typeof parsed.model === 'string' && parsed.model ? parsed.model : DEFAULT_MODEL,
    }
  } catch {
    /* 存储不可用或内容损坏时退回默认值 */
    return {}
  }
}

/** 非敏感配置：随输入即时持久化，下次进来继续可用 */
export const modelConfig = reactive({
  baseUrl: DEFAULT_BASE_URL,
  model: DEFAULT_MODEL,
  ...loadPersisted(),
})

/**
 * 敏感容器：刻意与 modelConfig 分开。
 * 这样任何对 modelConfig 的展开 / 序列化都不可能带上 Key。
 */
const secret = reactive({ apiKey: '' })

export const hasApiKey = computed(() => secret.apiKey.length > 0)

export function setApiKey(value) {
  secret.apiKey = String(value ?? '').trim()
}

/** 仅供 model/client.js 取用；视图与日志里不要读取、不要打印 */
export function getApiKey() {
  return secret.apiKey
}

watch(
  modelConfig,
  (v) => {
    try {
      localStorage.setItem(KEY_STORAGE, JSON.stringify({ baseUrl: v.baseUrl, model: v.model }))
    } catch {
      /* 本地存储不可用时仅本次会话生效 */
    }
  },
  { deep: true },
)