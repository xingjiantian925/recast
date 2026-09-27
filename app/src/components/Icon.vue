<script setup>
import { computed } from 'vue'

/**
 * Icon.vue — 消费设计系统 zip 的 assets/icons（40 个 Lucide 风格 SVG）
 * 以 ?raw 内联，使 stroke="currentColor" 能继承父级颜色（<img> 做不到）。
 */
const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 20 },
})

const modules = import.meta.glob('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const svg = computed(() => modules[`../assets/icons/${props.name}.svg`] ?? '')
</script>

<template>
  <span
    class="icon"
    :style="{ width: size + 'px', height: size + 'px' }"
    aria-hidden="true"
    v-html="svg"
  />
</template>

<style scoped>
.icon { display: inline-flex; flex-shrink: 0; }
.icon :deep(svg) { width: 100%; height: 100%; display: block; }
</style>