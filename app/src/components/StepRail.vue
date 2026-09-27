<script setup>
/**
 * StepRail.vue — 流程步进器
 * 只显示"你走到流程的哪一段"，不做"完成度""连续天数"这类激励性表达。
 */
defineProps({
  now: { type: Number, required: true },
  total: { type: Number, default: 6 },
  label: { type: String, default: '' },
})
</script>

<template>
  <div class="rail">
    <div class="steprail">
      <span
        v-for="i in total"
        :key="i"
        class="steprail__seg"
        :class="{ 'is-done': i < now, 'is-now': i === now }"
      />
    </div>
    <span v-if="label" class="t-caption">{{ label }}</span>
  </div>
</template>

<style scoped>
.rail {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.steprail { flex: 1; }
</style>