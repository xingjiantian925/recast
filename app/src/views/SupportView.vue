<script setup>
/**
 * SupportView — Step 7 稳定化分流 + Step 10 安全层（转介）
 *
 * 这一页的职责是**让产品退场**：
 *  - 停止改写，不在这里继续做任何第三人称引导。
 *  - 危机识别是独立通道，不交给改写流程顺带处理（Step 10 第 1 条）。
 *  - 依据：LLM 在自杀风险分层上表现不足，所以这一步不留任何自动化判断的余地。
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../components/Icon.vue'
import { session } from '../stores/session'
import { journal } from '../stores/journal'
import { CRISIS_RESOURCES, CRISIS_COPY } from '../mock/fixtures'

const { t } = useI18n()
const copied = ref(false)
const isCrisis = computed(() => session.tier === 'crisis')

const reason = computed(() => {
  if (isCrisis.value) return t('support.reasonTriage')
  if (session.stabilized) return t('support.reasonExhausted')
  return t('support.reasonSelf')
})

const entriesLabel = computed(() => t('support.entriesLabel', { n: journal.entries.length }))

async function exportText() {
  const text = [t('support.exportHeader'), '', session.text || t('support.exportEmpty')].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 2400)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <main class="page page--narrow">
    <div class="note note--danger">
      <b>{{ isCrisis ? CRISIS_COPY.title : t('support.notRecastTitle') }}</b>
      <p style="margin-top: var(--space-2)">
        {{ isCrisis ? CRISIS_COPY.body : t('support.notRecastBody') }}
      </p>
      <p style="margin-top: var(--space-2)">
        {{ isCrisis ? CRISIS_COPY.action : t('support.notRecastAction') }}
      </p>
    </div>

    <div class="card" style="margin-top: var(--space-5)">
      <h1 class="t-h4">{{ t('support.numbersTitle') }}</h1>
      <ul class="res">
        <li v-for="r in CRISIS_RESOURCES" :key="r.value" class="res__item">
          <div>
            <p class="res__name">{{ r.name }}</p>
            <p class="t-caption">{{ r.note }}</p>
          </div>
          <span class="res__num t-mono">{{ r.value }}</span>
        </li>
      </ul>
    </div>

    <div class="card" style="margin-top: var(--space-4)">
      <h2 class="t-h4">{{ t('support.proTitle') }}</h2>
      <p class="t-body t-dim" style="margin-top: var(--space-2); line-height: 1.8">
        {{ t('support.proBody') }}
      </p>
      <button class="btn btn-secondary" style="margin-top: var(--space-4)" @click="exportText">
        <Icon name="file" :size="16" class="btn-icon" />
        {{ copied ? t('support.copied') : t('support.copy') }}
      </button>
    </div>

    <div class="card card--quiet" style="margin-top: var(--space-4)">
      <p class="t-eyebrow">{{ t('support.stateEyebrow') }}</p>
      <p class="t-caption" style="margin-top: var(--space-2); line-height: 1.8">
        {{ t('support.reasonLabel') }}{{ reason }}<br />
        {{ entriesLabel }}
      </p>
      <p class="t-caption" style="margin-top: var(--space-3); line-height: 1.8">
        {{ t('support.backNote') }}
      </p>
      <RouterLink to="/safety" class="btn btn-tertiary btn-sm" style="margin-top: var(--space-3); text-decoration: none">
        {{ t('support.toSafety') }}
      </RouterLink>
    </div>

    <RouterLink to="/" class="btn btn-dark btn-lg btn-block" style="margin-top: var(--space-5); text-decoration: none">
      {{ t('crisis.continueLabel') }}
      <Icon name="arrow-right" :size="16" class="btn-icon" />
    </RouterLink>
  </main>
</template>

<style scoped>
.res { list-style: none; margin: var(--space-4) 0 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
.res__item {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
  padding: var(--space-3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  background: var(--surface);
}
.res__name { margin: 0; font-weight: 500; }
.res__num { font-size: 20px; color: var(--color-error); }
</style>