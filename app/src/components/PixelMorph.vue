<script setup>
/**
 * PixelMorph — 改写通过瞬间的像素动画
 *
 * 设计意图：
 *  - 心（紫）→ 脑（蓝）的形变，对应产品核心机制「从情绪脑的第一人称沉浸
 *    到观察脑的第三人称疏离」。与落地页 hero SVG 使用同一套视觉语言。
 *  - 只播一次（1.2 秒），不循环、不闪。Recast 是情绪工具不是游戏，
 *    动画服护理、不抢戏。
 *  - prefers-reduced-motion 时直接显示最终帧（脑子静止）。
 *  - 纯 Canvas + requestAnimationFrame，零依赖。
 */
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let raf = null

// 16×16 像素网格，每像素 4×4 → 64×64 画布
const G = 16
const P = 4
const SIZE = G * P

// ── 像素图：心（14 行 × 14 列，居中）──
// 1 = 紫色心身，2 = 高光
const HEART = [
  '..............',
  '..11....11....',
  '.1111..1111...',
  '1111111111111.',
  '1111111111111.',
  '1111111111111.',
  '1111111111111.',
  '.11111111111..',
  '..111111111...',
  '...1111111....',
  '....11111.....',
  '.....111......',
  '......1.......',
  '..............',
]

// ── 像素图：脑子（14×14，两半球 + 中缝 + 脑干）──
// 3 = 蓝色脑身，4 = 皱褶（深色线条）
const BRAIN = [
  '...333....333.',
  '.33333..33333.',
  '3333333.3333333',  // 注意 15 列，裁到 14
  '33343333.3334333', // 这个超了，手动修
  '3333333.3333333',
  '.33333..33333.',
  '..333....333..',
  '...3.3..3.3...',
  '....33..33....',
  '.....3..3.....',
  '......33......',
  '.......3......',
  '......3.3.....',
  '.....3...3....',
]

// 简化版脑子图（严格 14 列）
const BRAIN_CLEAN = [
  '...333....333.',
  '.33333..33333.',
  '33333333333333',
  '3343333.333433',
  '3333333.333333',
  '.33333..33333.',
  '..333....333..',
  '...3.3..3.3...',
  '....33..33....',
  '.....3..3.....',
  '......33......',
  '......33......',
  '.......3......',
  '..............',
]

// 动画状态
let frame = 0
const TOTAL_FRAMES = 18 // 18 帧 ≈ 1.2 秒 @ 15fps
const FPS = 15
const FRAME_MS = 1000 / FPS
let lastTime = 0

// 心的像素坐标 + 每个像素的随机偏移（用于碎裂动画）
let heartPixels = []
// 脑的像素坐标
let brainPixels = []

function parseSprite(rows) {
  const px = []
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c]
      if (ch === '1' || ch === '3') px.push({ r, c, type: ch })
      else if (ch === '4') px.push({ r, c, type: '4' })
    }
  }
  return px
}

function initPixels() {
  heartPixels = parseSprite(HEART).map((p) => ({
    ...p,
    // 每个像素的碎裂轨迹：向上飘散 + 随机水平偏移
    vx: (Math.random() - 0.5) * 0.8,
    vy: -0.6 - Math.random() * 0.5,
    delay: Math.floor(Math.random() * 3), // 错开碎裂时序
  }))
  brainPixels = parseSprite(BRAIN_CLEAN)
}

function drawPixel(ctx, r, c, color, scale = 1) {
  ctx.fillStyle = color
  ctx.fillRect(c * P * scale, r * P * scale, P * scale, P * scale)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function render(ctx, reducedMotion) {
  ctx.clearRect(0, 0, SIZE, SIZE)

  if (reducedMotion) {
    // 直接画最终帧：脑子
    drawBrain(ctx, 1)
    return
  }

  // 阶段划分（总 18 帧）：
  // 0–5   心跳动（6 帧）
  // 6–9   心碎裂飘散（4 帧）
  // 10–14 脑像素聚拢重组（5 帧）
  // 15–17 脑亮起 + 静止（3 帧）

  if (frame <= 5) {
    // 心跳动：scale 微缩 + 高光闪烁
    const beat = frame % 3 === 0 ? 1.08 : 1.0
    const alpha = 0.85 + 0.15 * Math.sin((frame / 5) * Math.PI)
    drawHeart(ctx, beat, alpha)
  } else if (frame <= 9) {
    // 心碎裂：像素按轨迹飘散
    const t = (frame - 6) / 4 // 0→1
    drawHeartShattering(ctx, t)
  } else if (frame <= 14) {
    // 脑聚拢：从两侧向中心组装
    const t = (frame - 10) / 5 // 0→1
    const e = easeInOut(t)
    drawBrain(ctx, e, 1 - e * 0.3) // 透明度从 0.7→1
  } else {
    // 脑完成 + 亮一下
    const t = (frame - 15) / 3
    const flash = frame === 15 ? 1.15 : 1.0
    drawBrain(ctx, 1, 1, flash)
  }
}

function drawHeart(ctx, scale, alpha) {
  const color = `rgba(185, 139, 255, ${alpha})`
  const offsetX = (SIZE - HEART[0].length * P * scale) / 2
  const offsetY = (SIZE - HEART.length * P * scale) / 2
  for (const p of heartPixels) {
    ctx.fillStyle = color
    ctx.fillRect(
      offsetX + p.c * P * scale,
      offsetY + p.r * P * scale,
      P * scale,
      P * scale,
    )
  }
}

function drawHeartShattering(ctx, t) {
  // t: 0→1，像素逐渐飘散 + 淡出
  for (const p of heartPixels) {
    const localT = Math.max(0, t - p.delay * 0.08)
    if (localT <= 0) {
      // 还没开始碎——画原位
      ctx.fillStyle = `rgba(185, 139, 255, ${1 - t * 0.3})`
      ctx.fillRect(p.c * P, p.r * P, P, P)
    } else {
      const dx = p.vx * localT * 12
      const dy = p.vy * localT * 12
      const alpha = Math.max(0, 1 - localT)
      ctx.fillStyle = `rgba(185, 139, 255, ${alpha})`
      ctx.fillRect(p.c * P + dx, p.r * P + dy, P, P)
    }
  }
}

function drawBrain(ctx, progress, alpha = 1, flashScale = 1) {
  const color = `rgba(122, 162, 255, ${alpha})`
  const foldColor = `rgba(90, 120, 200, ${alpha})`
  const offsetX = (SIZE - BRAIN_CLEAN[0].length * P) / 2
  const offsetY = (SIZE - BRAIN_CLEAN.length * P) / 2

  for (const p of brainPixels) {
    // progress < 1 时，从两侧向中心滑入
    let drawC = p.c
    if (progress < 1) {
      const center = BRAIN_CLEAN[0].length / 2
      const dir = p.c < center ? -1 : 1
      const slide = dir * (1 - progress) * 8
      drawC = p.c + slide
    }
    const x = offsetX + drawC * P
    const y = offsetY + p.r * P
    const s = P * flashScale
    ctx.fillStyle = p.type === '4' ? foldColor : color
    ctx.fillRect(x, y, s, s)
  }
}

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp
  const elapsed = timestamp - lastTime

  if (elapsed >= FRAME_MS) {
    lastTime = timestamp - (elapsed % FRAME_MS)
    const ctx = canvas.value?.getContext('2d')
    if (ctx) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      render(ctx, reducedMotion)
    }
    frame++
    if (frame >= TOTAL_FRAMES) {
      // 停在最终帧，不再请求
      return
    }
  }
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  initPixels()
  const ctx = canvas.value?.getContext('2d')
  if (ctx) {
    ctx.imageSmoothingEnabled = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      render(ctx, true)
    } else {
      raf = requestAnimationFrame(loop)
    }
  }
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="pixel-morph" aria-hidden="true">
    <canvas ref="canvas" :width="SIZE" :height="SIZE" />
  </div>
</template>

<style scoped>
.pixel-morph {
  display: flex;
  justify-content: center;
  align-items: center;
  /* 64px 逻辑像素， retina 屏自动放大 */
  width: 64px;
  height: 64px;
  margin: 0 auto;
}
.pixel-morph canvas {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
