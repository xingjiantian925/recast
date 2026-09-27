/**
 * keystore.js — 浏览器本地加密存放 API Key
 *
 * 做法：用一个**页面本地生成**的 256 位随机密钥（AES-GCM）加密 Key，密文写进 localStorage。
 * 刷新后自动解回来，所以不必每次重新粘贴。
 *
 * 如实告知用户的边界（设置页文案与此一致，不要夸大）：
 *  - 这个"保险箱密钥"也放在同一个 localStorage 里，因此它只能挡住"顺手瞄一眼"
 *    （存储里看不到明文），**挡不住**能执行本页脚本或打开 DevTools 的人。
 *    本质是混淆级防护，不是端到端加密。
 *  - 只在安全上下文（https / localhost）提供 crypto.subtle；不可用时自动退回"只存内存"。
 *  - 明文只在本模块内短暂出现，不写日志、不进任何整体序列化。
 */

const WRAP_KEY = 'recast.model.key.v0' // 保险箱密钥（raw，base64）
const SEAL_KEY = 'recast.model.enc.v0' // 密文 { v, iv, ct }（base64）

function b64(bytes) {
  let s = ''
  for (let i = 0; i < bytes.length; i += 1) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

function unb64(str) {
  const bin = atob(str)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

/** 加密持久化是否可用（需要安全上下文 + localStorage） */
export function isAvailable() {
  try {
    return (
      typeof crypto !== 'undefined' &&
      !!(crypto.subtle && crypto.getRandomValues) &&
      typeof localStorage !== 'undefined'
    )
  } catch {
    return false
  }
}

/** 是否已经存有一份密文（同步探测，供状态指示用） */
export function hasStored() {
  try {
    return !!localStorage.getItem(SEAL_KEY)
  } catch {
    return false
  }
}

async function wrapKey() {
  const cached = localStorage.getItem(WRAP_KEY)
  if (cached) {
    try {
      return await crypto.subtle.importKey(
        'raw',
        unb64(cached),
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt'],
      )
    } catch {
      /* 密钥损坏则丢弃重来 */
    }
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ])
  const raw = await crypto.subtle.exportKey('raw', key)
  localStorage.setItem(WRAP_KEY, b64(new Uint8Array(raw)))
  return key
}

/** 读取并解密已保存的 Key；没有 / 解不开一律返回 ''（不抛错） */
export async function load() {
  if (!isAvailable()) return ''
  try {
    const raw = localStorage.getItem(SEAL_KEY)
    if (!raw) return ''
    const { iv, ct } = JSON.parse(raw)
    const key = await wrapKey()
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, key, unb64(ct))
    return new TextDecoder().decode(plain)
  } catch {
    return ''
  }
}

/** 加密并保存；返回是否成功 */
export async function save(value) {
  if (!isAvailable()) return false
  const text = String(value ?? '')
  if (!text) return clear()
  try {
    const key = await wrapKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(text),
    )
    localStorage.setItem(SEAL_KEY, JSON.stringify({ v: 1, iv: b64(iv), ct: b64(new Uint8Array(ct)) }))
    return true
  } catch {
    return false
  }
}

/** 只清密文，保留保险箱密钥（下次保存复用同一密钥） */
export async function clear() {
  try {
    localStorage.removeItem(SEAL_KEY)
  } catch {
    /* 存储不可用时忽略 */
  }
  return true
}

/** 彻底清除：密文 + 保险箱密钥（如「关闭并清除」） */
export function purge() {
  try {
    localStorage.removeItem(SEAL_KEY)
    localStorage.removeItem(WRAP_KEY)
  } catch {
    /* 存储不可用时忽略 */
  }
}