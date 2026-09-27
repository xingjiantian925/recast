<script setup>
/**
 * NarrativeView — Step 9 叙事线回看
 *
 * 这是低剂量设计下黏性的正当来源：不写新素材，只回看。
 * 依据：Adler 2012（agency 上升先于症状改善，叙事线变化是**领先指标**）。
 *
 * 合规红线（§7）：这里**不显示 RRS-brooding / PHQ-9 的任何轨迹**。
 * 允许展示的只有过程指标（重构次数、通过率、视角轮换）。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../components/Icon.vue'
import { journal } from '../stores/journal'
import { session } from '../stores/session'
import { TIER_INFO } from '../mock/engine'
import { LENSES, CRITIQUE_CRITERIA } from '../mock/fixtures'

const { t } = useI18n()
const entries = computed(() => journal.entries)
const recastEntries = computed(() => entries.value.filter((e) => e.kind === 'recast'))

const lensUse = computed(() => {
  const m = {}
  for (const e of recastEntries.value) m[e.lens] = (m[e.lens] || 0) + 1
  return Object.entries(m).sort((a, b) => b[1] - a[1])
})

const cap = computed(() => (session.tier ? TIER_INFO.value[session.tier].doseCap : 3))
const doseCapNote = computed(() => t('narrative.statDoseNote', { n: cap.value }))

/** 条目里存的是视角 / 判据的 id，展示时按当前语言取名字 */
const lensName = (id) => LENSES.value.find((l) => l.id === id)?.name || id
const criterionLabel = (id) => CRITIQUE_CRITERIA.value.find((c) => c.id === id)?.label || id

const weekLabel = (i, label) =>
  i === 7 ? t('narrative.thisWeek') : t('narrative.weeksAgo', { n: -label })

/** 近 8 周的每周重构次数（过程指标，不是症状轨迹） */
const weekly = computed(() => {
  const buckets = Array.from({ length: 8 }, (_, i) => ({ label: i - 7, n: 0 }))
  const now = Date.now()
  for (const e of recastEntries.value) {
    const wAgo = Math.floor((now - new Date(e.at).getTime()) / (7 * 86400000))
    const idx = 7 - wAgo
    if (idx >= 0 && idx < 8) buckets[idx].n += 1
  }
  return buckets
})
const weeklyMax = computed(() => Math.max(1, ...weekly.value.map((b) => b.n)))

const agencyTrend = computed(() => {
  const recent = recastEntries.value.slice(0, 3)
  if (recent.length < 2) return null
  const rising = recent.filter((e) => e.themes.agency === 'rising').length
  return { rising, of: recent.length }
})
</script>

<template>
  <main class="page">
    <header style="margin-bottom: var(--space-5)">
      <h1 class="t-h2">{{ t('narrative.title') }}</h1>
      <p class="t-body t-dim" style="margin-top: var(--space-2); max-width: 620px; line-height: 1.8">
        {{ t('narrative.lede') }}
      </p>
    </header>

    <div v-if="entries.length === 0" class="card card--quiet">
      <p class="t-body t-dim" style="margin: 0">
        {{ t('narrative.empty') }}
      </p>
      <RouterLink to="/" class="btn btn-secondary btn-sm" style="margin-top: var(--space-4); text-decoration: none">
        {{ t('narrative.home') }}
      </RouterLink>
    </div>

    <template v-else>
      <!-- 过程指标 -->
      <div class="grid-4">
        <div class="card">
          <p class="t-eyebrow">{{ t('narrative.statRecasts') }}</p>
          <p class="stat">{{ recastEntries.length }}</p>
          <p class="t-caption">{{ t('narrative.statRecastsNote') }}</p>
        </div>
        <div class="card">
          <p class="t-eyebrow">{{ t('narrative.statDose') }}</p>
          <p class="stat">{{ journal.dose.used[Object.keys(journal.dose.used).sort().pop()] || 0 }}</p>
          <p class="t-caption">{{ doseCapNote }}</p>
        </div>
        <div class="card">
          <p class="t-eyebrow">{{ t('narrative.statLenses') }}</p>
          <p class="stat">{{ lensUse.length }}</p>
          <p class="t-caption">{{ t('narrative.statLensesNote') }}</p>
        </div>
        <div class="card">
          <p class="t-eyebrow">{{ t('narrative.statAgency') }}</p>
          <p class="stat">
            {{ agencyTrend ? `${agencyTrend.rising}/${agencyTrend.of}` : '—' }}
          </p>
          <p class="t-caption">{{ t('narrative.statAgencyNote') }}</p>
        </div>
      </div>

      <!-- 周频次（过程指标） -->
      <section class="card" style="margin-top: var(--space-4)">
        <div class="row row--between">
          <div>
            <h2 class="card-title">{{ t('narrative.weeklyTitle') }}</h2>
            <p class="t-caption" style="margin-top: var(--space-1)">
              {{ t('narrative.weeklyNote') }}
            </p>
          </div>
          <span class="tag tag--outline">{{ t('narrative.weeklyTag') }}</span>
        </div>

        <div class="bars" style="margin-top: var(--space-5)">
          <div v-for="(b, i) in weekly" :key="i" class="bar">
            <div class="bar__col">
              <div
                class="bar__fill"
                :style="{ height: (b.n / weeklyMax) * 100 + '%' }"
                :class="{ 'is-zero': b.n === 0 }"
              />
            </div>
            <span class="bar__label">{{ weekLabel(i, b.label) }}</span>
          </div>
        </div>

        <div class="note note--quiet" style="margin-top: var(--space-5)">
          {{ t('narrative.noScaleNote') }}
        </div>
      </section>

      <!-- 条目 -->
      <section style="margin-top: var(--space-6)">
        <h2 class="t-h3" style="margin-bottom: var(--space-3)">{{ t('narrative.entriesTitle') }}</h2>
        <div class="stack--sm" style="display: flex; flex-direction: column; gap: var(--space-3)">
          <article v-for="e in entries" :key="e.id" class="card card--flat entry">
            <div class="row row--between">
              <div class="row" style="gap: var(--space-2)">
                <span class="t-mono t-dim" style="font-size: 12px">{{ e.at.slice(0, 10) }}</span>
                <span v-if="e.kind === 'reappraisal'" class="tag tag--outline">{{ t('narrative.reappraisalTag') }}</span>
                <span v-else class="tag tag--primary">{{ lensName(e.lens) }}</span>
                <span class="tag tag--neutral">{{ t('narrative.intensityTag', { n: e.intensity }) }}</span>
                <span v-if="e.repeatLens" class="tag tag--outline">{{ t('narrative.repeatTag') }}</span>
              </div>
              <div class="row" style="gap: var(--space-1)">
                <span v-if="e.themes.agency === 'rising'" class="tag tag--success">
                  {{ t('themes.agency.rising') }}
                </span>
                <span v-if="e.themes.redemption === 'redemption'" class="tag tag--accent">
                  {{ t('themes.redemption.redemption') }}
                </span>
                <span v-if="e.themes.coherence === 'high'" class="tag tag--info">
                  {{ t('themes.coherence.high') }}
                </span>
              </div>
            </div>
            <p class="entry__excerpt">{{ e.excerpt }}…</p>
            <div v-if="e.critiqueHits?.length" class="hits">
              <span class="t-caption">{{ t('narrative.hitsLabel') }}</span>
              <span v-for="h in e.critiqueHits" :key="h" class="hit">{{ criterionLabel(h) }}</span>
            </div>
          </article>
        </div>
      </section>

      <p class="t-caption" style="margin-top: var(--space-5); display: flex; align-items: center; gap: 6px">
        <Icon name="chevrons-down-up" :size="14" />
        {{ t('narrative.footerNote') }}
      </p>
    </template>
  </main>
</template>

<style scoped>
.stat { font-family: var(--font-mono); font-size: 28px; margin-top: var(--space-2); }

.bars { display: flex; gap: var(--space-2); align-items: flex-end; height: 120px; }
.bar { flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-2); height: 100%; }
.bar__col { flex: 1; width: 100%; display: flex; align-items: flex-end; background: var(--muted); border-radius: var(--radius-sm); overflow: hidden; }
.bar__fill { width: 100%; background: var(--primary); border-radius: var(--radius-sm) var(--radius-sm) 0 0; transition: height .4s; min-height: 2px; }
.bar__fill.is-zero { background: transparent; }
.bar__label { font-size: 11px; color: var(--txj-neutral-400); white-space: nowrap; }

.entry { padding: var(--space-4); }
.entry__excerpt { margin-top: var(--space-2); color: var(--muted-foreground); font-size: 14.5px; line-height: 1.75; }
.hits { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: var(--space-3); }
.hit {
  font-family: var(--font-mono); font-size: 11px; padding: 1px 6px;
  border-radius: var(--radius-sm); background: var(--txj-primary-50); color: var(--txj-primary-700);
}
</style>