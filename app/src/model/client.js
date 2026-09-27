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

/**
 * DeepSeek 的 flash / pro 是思考型模型：默认开启思考，思维链 token 与正文共享
 * max_tokens 预算，且显著拉长延迟。改写与质检都是短的确定性任务，思维链没有
 * 增益，所以对 DeepSeek 显式关闭（实测：关闭后同一条改写 <1s、正文预算充足）。
 * 其他服务商不带该非标准字段，避免被严格实现拒绝。
 */
function isDeepSeek(baseUrl) {
  try {
    const host = new URL(baseUrl).hostname
    return host === 'api.deepseek.com' || host.endsWith('.deepseek.com')
  } catch {
    return false
  }
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
  requireContent = true,
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
          ...(isDeepSeek(baseUrl) ? { thinking: { type: 'disabled' } } : {}),
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
    if (typeof content === 'string' && content.trim()) return content
    // requireContent=false 用于「测试连接」：思考型模型可能把预算全用在
    // reasoning 上、正文为空，此时只要拿到合法 choices 就说明链路通。
    if (!requireContent && Array.isArray(data?.choices) && data.choices.length > 0) return ''
    throw new ModelError('badResponse', { detail: JSON.stringify(data ?? {}).slice(0, 300) })
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
    requireContent: false,
  })
  return { ms: Date.now() - started }
}