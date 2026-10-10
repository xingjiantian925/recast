/**
 * generate-icons.mjs — 生成 PWA 所需的 PNG 图标（无第三方依赖）
 *
 * 设计：与端内 PixelMorph 同一视觉语言——像素块。
 * 深绿底（--txj-primary-600 #4a6b5c）+ 浅色像素 "R"，
 * 图形落在 maskable 安全区（中心 80%）内，可复用为 maskable 图标。
 *
 * 用法：node scripts/generate-icons.mjs  → 输出到 public/icons/
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BG = [0x4a, 0x6b, 0x5c, 255]
const FG = [0xee, 0xf2, 0xe9, 255]

// 5×7 像素 "R"
const GLYPH = [
  '11110',
  '10001',
  '10001',
  '11110',
  '10100',
  '10010',
  '10001',
]

function crc32(buf) {
  let table = crc32.table
  if (!table) {
    table = crc32.table = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c
    }
  }
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(size) {
  const cell = size / 11 // 11×11 单位网格：字形 5×7 居中，四周留白进安全区
  const ox = 3 * cell
  const oy = 2 * cell
  const raw = Buffer.alloc(size * (size * 4 + 1))
  let p = 0
  for (let y = 0; y < size; y++) {
    raw[p++] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - ox) / cell)
      const gy = Math.floor((y - oy) / cell)
      const on = gx >= 0 && gx < 5 && gy >= 0 && gy < 7 && GLYPH[gy][gx] === '1'
      const c = on ? FG : BG
      raw[p++] = c[0]
      raw[p++] = c[1]
      raw[p++] = c[2]
      raw[p++] = c[3]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })
for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), encodePng(size))
}
writeFileSync(join(outDir, 'maskable-512.png'), encodePng(512))
console.log('icons written to', outDir)
