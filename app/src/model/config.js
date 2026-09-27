/**
 * config.js — 模型接入配置
 *
 * 安全约束（按用户明确要求调整过，改动前先读这段）：
 *  - **默认不改**：API Key 只进内存容器 `secret`，任何对 modelConfig 的整体序列化都不会带上它。
 *  - **可选加密落盘**：用户可开启「在本机加密保存」。开启后，Key 用本机随机生成的
 *    AES-GCM 密钥加密再写入 localStorage（见 model/keystore.js），刷新自动解回，免重复粘贴。
 *    这是**混淆级**防护：同样的保险箱密钥也在本机存储里，能执行本页脚本的人仍可解开。
 *    设置页已如实说明，不要对外宣称"绝对安全"。
 *  - 可持久化的非敏感项：Base URL、模型名、以及"是否加密保存"开关。
 *  - 请求直连用户自己配置的服务商；本产品没有（也不会有）自己的中转服务器。
 *
 * Phase 2（Tauri 桌面版）接入后，Key 改由 Rust 侧读系统钥匙串，webview/JS
 * 不再接触明文 Key —— 届时只需替换本模块与调用侧，其余代码不动。
 */
import { computed, reactive, ref, watch } from 'vue'
import * as vault from './keystore'

export const DEFAULT_BASE_URL = 'https://api.deepseek.com'
// 2026-09 起 DeepSeek 的现行模型名（V4.1 Flash）；旧名 deepseek-chat 将弃用。
// 任何 OpenAI 兼容服务商都可以填在这里（改 Base URL + 模型名即可）。
export const DEFAULT_MODEL = 'deepseek-flash'

const KEY_STORAGE = 'recast.model.v0'

/** 本环境能否做加密持久化（安全上下文 + localStorage） */
export const persistenceAvailable = vault.isAvailable()

function loadPersisted() {
  try {
    const raw = localStorage.getItem(KEY_STORAGE)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return {
      baseUrl: typeof parsed.baseUrl === 'string' && parsed.baseUrl ? parsed.baseUrl : DEFAULT_BASE_URL,
      model: typeof parsed.model === 'string' && parsed.model ? parsed.model : DEFAULT_MODEL,
      persistKey: parsed.persistKey !== false,
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
  persistKey: true,
  ...loadPersisted(),
})

/**
 * 敏感容器：刻意与 modelConfig 分开。
 * 这样任何对 modelConfig 的展开 / 序列化都不可能带上 Key。
 */
const secret = reactive({ apiKey: '' })

/** 最近一次「测试连接」的结果，仅本会话有效（刷新后回到 configured） */
const verify = reactive({ state: 'unknown', ms: 0 })

/** 当前本机是否存有加密密文（供状态指示与设置页提示） */
export const keyPersisted = ref(vault.hasStored())

export const hasApiKey = computed(() => secret.apiKey.length > 0)
export const verifyState = computed(() => verify.state)

/**
 * 顶栏状态指示用：
 *  - unconfigured：没有 Key → 演示模式
 *  - configured：有 Key，但本次会话还没测通
 *  - verified：有 Key，且本次会话测通
 */
export const modelStatus = computed(() => {
  if (!secret.apiKey) return 'unconfigured'
  return verify.state === 'ok' ? 'verified' : 'configured'
})

let persistTimer = null

function schedulePersist(value) {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(async () => {
    persistTimer = null
    const ok = await vault.save(value)
    keyPersisted.value = ok ? vault.hasStored() : false
  }, 300)
}

export function setApiKey(value) {
  const v = String(value ?? '').trim()
  secret.apiKey = v
  verify.state = 'unknown'
  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
  if (!v) {
    vault.clear().then(() => {
      keyPersisted.value = false
    })
  } else if (modelConfig.persistKey) {
    schedulePersist(v)
  }
}

/** 立即清空：内存 + 本机密文 */
export function forgetApiKey() {
  secret.apiKey = ''
  verify.state = 'unknown'
  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
  vault.clear().then(() => {
    keyPersisted.value = false
  })
}

/** 仅供 model/client.js 取用；视图与日志里不要读取、不要打印 */
export function getApiKey() {
  return secret.apiKey
}

/** SettingsView 测试结束后回报，供顶栏状态显示 */
export function setVerifyResult(ok, ms = 0) {
  verify.state = ok ? 'ok' : 'fail'
  verify.ms = ms
}

/** 开关「在本机加密保存」；关闭时立即清除已存密文 */
export function setPersistEnabled(on) {
  modelConfig.persistKey = Boolean(on)
  if (!on) {
    vault.clear().then(() => {
      keyPersisted.value = false
    })
  } else if (secret.apiKey) {
    schedulePersist(secret.apiKey)
  }
}

/**
 * 启动时恢复：读取并解密本机保存的 Key，写回内存。
 * 返回是否恢复成功。不可用 / 未开启 / 无密文时安静返回 false。
 */
export async function restoreApiKey() {
  if (!persistenceAvailable || !modelConfig.persistKey) return false
  const key = await vault.load()
  if (!key) {
    keyPersisted.value = false
    return false
  }
  secret.apiKey = key
  keyPersisted.value = true
  return true
}

watch(
  modelConfig,
  (v) => {
    try {
      localStorage.setItem(
        KEY_STORAGE,
        JSON.stringify({ baseUrl: v.baseUrl, model: v.model, persistKey: v.persistKey }),
      )
    } catch {
      /* 本地存储不可用时仅本次会话生效 */
    }
  },
  { deep: true },
)