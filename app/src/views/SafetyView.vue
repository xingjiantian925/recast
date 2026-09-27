<script setup>
/**
 * SafetyView — Step 10 安全层 · 边界说明 · 退出设计（off-ramp）
 *
 * 这一页承担 §7 的合规定位声明，以及 §1.4 的"退出设计"：
 * Travers-Hill 2017 显示训练效果能泛化到未被指导的情境，
 * 所以**技能内化后应当减少使用**——本产品把"用户越来越少需要它"作为成功指标。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../components/Icon.vue'
import { session } from '../stores/session'
import { journal, journalApi } from '../stores/journal'
import {
  NEGATIVE_INDICATORS,
  CRISIS_RESOURCES,
  DOSE_TABLE,
  SAFETY_RULES,
} from '../mock/fixtures'
import { TIER_INFO } from '../mock/engine'

const { t } = useI18n()
const offRamp = computed(() => journal.meta.offRamp)
const cap = computed(() => (session.tier ? TIER_INFO.value[session.tier].doseCap : 3))
const tierLabel = computed(() => (session.tier ? TIER_INFO.value[session.tier].label : ''))
const capLabel = computed(() => t('safety.capValue', { n: cap.value }))
const storedCount = computed(() => t('safety.storedCount', { n: journal.entries.length }))
</script>

<template>
  <main class="page page--narrow">
    <header style="margin-bottom: var(--space-5)">
      <h1 class="t-h2">{{ t('safety.title') }}</h1>
      <p class="t-body t-dim" style="margin-top: var(--space-2); line-height: 1.8">
        {{ t('safety.ledeLead') }}<b>{{ t('safety.ledeBold') }}</b>{{ t('safety.ledeTail') }}
      </p>
    </header>

    <!-- 定位声明 -->
    <section class="card">
      <span class="t-eyebrow">{{ t('safety.positionEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('safety.positionTitle') }}</h2>
      <ul class="rules">
        <li v-for="(r, i) in SAFETY_RULES" :key="i">{{ r }}</li>
      </ul>
    </section>

    <!-- 剂量契约 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('safety.doseEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('safety.doseTitle') }}</h2>
      <div class="tbl-wrap" style="margin-top: var(--space-4)">
        <table class="tbl">
          <caption>{{ t('safety.doseCaption') }}</caption>
          <thead>
            <tr>
              <th>{{ t('safety.doseColParam') }}</th>
              <th>{{ t('safety.doseColRoutine') }}</th>
              <th>{{ t('safety.doseColWatch') }}</th>
              <th>{{ t('safety.doseColBasis') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in DOSE_TABLE" :key="row[0]">
              <td>{{ row[0] }}</td>
              <td>{{ row[1] }}</td>
              <td>{{ row[2] }}</td>
              <td class="t-caption">{{ row[3] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="t-caption" style="margin-top: var(--space-3)">
        {{ t('safety.capLead') }}<b>{{ capLabel }}</b>
        <span v-if="session.tier">（{{ tierLabel }}）</span>
      </p>
    </section>

    <!-- 负性指标 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('safety.monitorEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('safety.monitorTitle') }}</h2>
      <p class="t-caption" style="margin-top: var(--space-2); line-height: 1.75">
        {{ t('safety.monitorNote') }}
      </p>
      <div class="flags">
        <div v-for="n in NEGATIVE_INDICATORS" :key="n.id" class="flag">
          <b>{{ n.label }}</b>
          <span class="t-caption">{{ n.hint }}</span>
        </div>
      </div>
      <div class="note note--danger" style="margin-top: var(--space-4)">
        {{ t('safety.monitorDanger') }}
      </div>
    </section>

    <!-- 退出设计 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('safety.offRampEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('safety.offRampTitle') }}</h2>
      <p class="t-body t-dim" style="margin-top: var(--space-3); line-height: 1.8">
        {{ t('safety.offRampBodyLead') }}<b>{{ t('safety.offRampBodyBold') }}</b>{{ t('safety.offRampBodyTail') }}
        <br /><br />
        {{ t('safety.offRampEffect') }}
      </p>
      <div class="row" style="margin-top: var(--space-4)">
        <button
          class="btn"
          :class="offRamp ? 'btn-secondary' : 'btn-danger'"
          @click="journalApi.setOffRamp(!offRamp)"
        >
          {{ offRamp ? t('safety.offRampOn') : t('safety.offRampOff') }}
        </button>
        <span v-if="offRamp" class="tag tag--warning"><span class="dot" />{{ t('safety.offRampTag') }}</span>
      </div>
    </section>

    <!-- 数据 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('safety.dataEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('safety.dataTitle') }}</h2>
      <p class="t-body t-dim" style="margin-top: var(--space-3); line-height: 1.8">
        {{ t('safety.dataBody') }}
      </p>
      <div class="row" style="margin-top: var(--space-4)">
        <button class="btn btn-secondary btn-sm" @click="journalApi.resetAll()">
          <Icon name="trash-2" :size="14" class="btn-icon" />
          {{ t('safety.clearData') }}
        </button>
        <span class="t-caption">{{ storedCount }}</span>
      </div>
    </section>

    <!-- 危机资源 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('safety.crisisEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('safety.crisisTitle') }}</h2>
      <ul class="res">
        <li v-for="r in CRISIS_RESOURCES" :key="r.value" class="res__item">
          <div>
            <p class="res__name">{{ r.name }}</p>
            <p class="t-caption">{{ r.note }}</p>
          </div>
          <span class="res__num t-mono">{{ r.value }}</span>
        </li>
      </ul>
    </section>

    <p class="t-caption" style="margin-top: var(--space-5); line-height: 1.8">
      {{ t('safety.refsNote') }}
    </p>
  </main>
</template>

<style scoped>
.rules { margin: var(--space-3) 0 0; padding-left: 18px; color: var(--muted-foreground); font-size: 14.5px; line-height: 2; }
.flags { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-2); margin-top: var(--space-4); }
.flag {
  display: flex; flex-direction: column; gap: 2px;
  padding: var(--space-3); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md); background: var(--surface);
}
.res { list-style: none; margin: var(--space-4) 0 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
.res__item {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
  padding: var(--space-3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  background: var(--surface);
}
.res__name { margin: 0; font-weight: 500; }
.res__num { font-size: 20px; color: var(--color-error); }
</style>