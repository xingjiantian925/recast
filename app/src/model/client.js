/**
 * client.js — OpenAI 兼容协议的薄客户端（一个端点，两个方法）
 *
 * 为什么手写而不引入 agent / LLM 框架：recast 只需要「改写」「质检」两次
 * 确定性调用，不需要自主循环、工具调用或服务端会话。薄客户端让 Key 的
 * 流动路径最短、最好审计（Key 只出现在本文件的请求头里）。
 *
 * 如果将来需要流式输出或多协议适配，再换成 ai / @ai-sdk/openai-compatible，
 * 替换面就是本文件。
 *
 * 错误一律收敛为 ModelError(code)：视图按 code 取 i18n 文案，
 * 不把原始报文（可能含服务商细节）直接抛给界面。
 */
const DEFAULT_TIMEOUT_MS = 90_000

export class ModelError extends Error {
  /**
   * @param {'auth'|'balance'|'rate'|'server'|'network'|'timeout'|'badResponse'} code
   */
  constructor(code, { status, detail } = {}) {
    super(code)
    this.name = 'ModelError'
    this.code = code
    this.status = status
    this.detail = detail // 仅供调试，不上屏
  }
}

function endpoint(baseUrl) {
  // 同时兼容 https://host 与 https://host/v1 两种写法
  return `${String(baseUrl).replace(/\/+$/, '')}/chat/completions`
}

function errorFromStatus(status, detail) {
  if (status === 401 || status === 403) return new ModelError('auth', { status, detail })
  if (status === 402) return new ModelError('balance', { status, detail })
  if (status === 429) return new ModelError('rate', { status, detail })
  return new ModelError('server', { status, detail })
}

/**
 * 一次非流式 chat 调用，返回 message.content 文本。
 * @returns {Promise<string>}
 */
export async function chatCompletion({
  baseUrl,
  apiKey,
  model,
  messages,
  json = false,
  maxTokens,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    let res
    try {
      res = await fetch(endpoint(baseUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          ...(json ? { response_format: { type: 'json_object' } } : {}),
          ...(maxTokens ? { max_tokens: maxTokens } : {}),
        }),
        signal: controller.signal,
      })
    } catch (err) {
      if (err?.name === 'AbortError') throw new ModelError('timeout')
      throw new ModelError('network')
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw errorFromStatus(res.status, detail.slice(0, 300))
    }

    const data = await res.json().catch(() => null)
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== 'string' || !content.trim()) throw new ModelError('badResponse')
    return content
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 设置页「测试连接」：一次最小调用。
 * 同时验证三件事：Base URL 可达、模型名有效、Key 通过鉴权。
 */
export async function pingModel({ baseUrl, apiKey, model, timeoutMs = 20_000 }) {
  const started = Date.now()
  await chatCompletion({
    baseUrl,
    apiKey,
    model,
    messages: [{ role: 'user', content: 'ping' }],
    maxTokens: 8,
    timeoutMs,
  })
  return { ms: Date.now() - started }
}