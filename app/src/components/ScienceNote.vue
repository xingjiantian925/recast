<script setup>
/**
 * ScienceNote — 改写通过后的论文背书卡片
 *
 * 设计意图：
 *  - 在用户刚经历「看见自己变成 TA」的瞬间，给出一个克制的、有来源的解释：
 *    为什么这一刻有效、它的边界在哪里。
 *  - 不是科普长文，是 3 条关键结论 + 来源，每条映射到 Recast 做了什么。
 *  - 可折叠（默认收起），不抢走改写结果本身的注意力。
 *  - 诚实标注证据等级与边界（P10 Giovanetti 反面证据），不回避风险。
 */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const open = ref(false)
</script>

<template>
  <details class="science" :open="open" @toggle="open = $event.target.open">
    <summary class="science__summary">
      <span class="science__icon" aria-hidden="true">§</span>
      {{ t('science.title') }}
    </summary>

    <div class="science__body">
      <!-- 结论 1：重构 > 复述 -->
      <div class="finding">
        <p class="finding__claim">
          <b>{{ t('science.f1Claim') }}</b>
        </p>
        <p class="finding__cite">
          {{ t('science.f1Cite') }}
        </p>
        <p class="finding__map">
          {{ t('science.f1Map') }}
        </p>
      </div>

      <!-- 结论 2：抽离 ≠ 回避 -->
      <div class="finding">
        <p class="finding__claim">
          <b>{{ t('science.f2Claim') }}</b>
        </p>
        <p class="finding__cite">
          {{ t('science.f2Cite') }}
        </p>
        <p class="finding__map">
          {{ t('science.f2Map') }}
        </p>
      </div>

      <!-- 结论 3：剂量与指导方式（含反面证据） -->
      <div class="finding finding--caution">
        <p class="finding__claim">
          <b>{{ t('science.f3Claim') }}</b>
        </p>
        <p class="finding__cite">
          {{ t('science.f3Cite') }}
        </p>
        <p class="finding__map">
          {{ t('science.f3Map') }}
        </p>
      </div>

      <!-- 诚实声明 -->
      <p class="science__disclaimer">
        {{ t('science.disclaimer') }}
      </p>
    </div>
  </details>
</template>

<style scoped>
.science {
  margin-top: var(--space-5);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--surface);
  overflow: hidden;
}
.science__summary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted-foreground);
  transition: color 0.15s;
  list-style: none;
}
.science__summary::-webkit-details-marker { display: none; }
.science__summary:hover { color: var(--foreground); }
.science__icon {
  font-family: var(--font-serif, Georgia, serif);
  font-size: 16px;
  color: var(--primary);
  opacity: 0.7;
}

.science__body {
  padding: 0 var(--space-4) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.finding {
  padding: var(--space-3) 0;
  border-top: 1px solid var(--border-subtle);
}
.finding:first-child {
  border-top: 0;
  padding-top: var(--space-2);
}
.finding--caution {
  /* 反面证据：左侧细线标记 */
  border-left: 3px solid var(--color-warning, #d97706);
  padding-left: var(--space-3);
  margin-left: calc(var(--space-3) * -1);
}

.finding__claim {
  margin: 0 0 var(--space-1);
  font-size: 14.5px;
  line-height: 1.6;
}
.finding__cite {
  margin: 0 0 var(--space-2);
  font-size: 12.5px;
  color: var(--muted-foreground);
  font-family: var(--font-mono, monospace);
  line-height: 1.7;
}
.finding__map {
  margin: 0;
  font-size: 13px;
  line-height: 1.75;
  color: var(--muted-foreground);
}
.finding__map::before {
  content: "→ ";
  color: var(--primary);
  font-weight: 600;
}

.science__disclaimer {
  margin: var(--space-2) 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--muted-foreground);
  opacity: 0.7;
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--space-3);
}
</style>
