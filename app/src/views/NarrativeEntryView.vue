<script setup>
/**
 * NarrativeEntryView — 叙事线条目详情
 *
 * 回看时的「只读一页」：不在这里写新素材，也不制造进度感。
 * 展示口径沿用 NarrativeView / ArchiveView：只读**已归档的结构化字段**
 * （时间、视角、强度、主题、命中判据、节选、改写稿），不渲染任何量表轨迹（§7）。
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '../components/Icon.vue'
import { journal } from '../stores/journal'
import { BAND_INFO } from '../engine'
import { LENSES, CRITIQUE_CRITERIA } from '../mock/fixtures'

const route = useRoute()
const { t } = useI18n()

const entry = computed(() => journal.entries.find((e) => e.id === route.params.id) || null)

/** 条目里存的是视角 / 判据的 id，展示时按当前语言取名字 */
const lensName = (id) => LENSES.value.find((l) => l.id === id)?.name || id
const criterion = (id) => CRITIQUE_CRITERIA.value.find((c) => c.id === id) || null

const bandInfo = computed(() => (entry.value?.band ? BAND_INFO.value[entry.value.band] : null))

/** 仅用于显示，不改变存储 */
const when = computed(() => {
  if (!entry.value) return ''
  const { at } = entry.value
  return `${at.slice(0, 10)} ${at.slice(11, 16)}`
})

/** excerpt 只存了开头一段；只有确实被截断时才补省略号 */
const excerptText = computed(() => {
  if (!entry.value) return ''
  return entry.value.length > entry.value.excerpt.length
    ? `${entry.value.excerpt}…`
    : entry.value.excerpt
})
</script>

<template>
  <main class="page page--narrow">
    <RouterLink to="/narrative" class="btn btn-secondary btn-sm back" style="text-decoration: none">
      <Icon name="arrow-left" :size="15" />
      {{ t('narrative.detail.back') }}
    </RouterLink>

    <div v-if="!entry" class="card card--quiet" style="margin-top: var(--space-4)">
      <p class="t-body t-dim" style="margin: 0">{{ t('narrative.detail.notFound') }}</p>
      <RouterLink
        to="/narrative"
        class="btn btn-secondary btn-sm"
        style="margin-top: var(--space-4); text-decoration: none"
      >
        {{ t('narrative.detail.back') }}
      </RouterLink>
    </div>

    <template v-else>
      <!-- 概览 -->
      <section class="card" style="margin-top: var(--space-4)">
        <div class="row row--between">
          <div class="row" style="gap: var(--space-2)">
            <span v-if="entry.kind === 'reappraisal'" class="tag tag--outline">
              {{ t('narrative.reappraisalTag') }}
            </span>
            <span v-else class="tag tag--primary">{{ lensName(entry.lens) }}</span>
            <span class="tag tag--neutral">{{ t('narrative.intensityTag', { n: entry.intensity }) }}</span>
            <span v-if="entry.repeatLens" class="tag tag--outline">{{ t('narrative.repeatTag') }}</span>
          </div>
          <span
            v-if="entry.kind === 'recast'"
            class="tag"
            :class="entry.passed ? 'tag--success' : 'tag--neutral'"
          >
            {{ entry.passed ? t('narrative.detail.resultPass') : t('narrative.detail.resultFail') }}
          </span>
        </div>

        <p class="t-mono t-dim" style="font-size: 12px; margin-top: var(--space-3)">{{ when }}</p>

        <!-- 主题标注 -->
        <hr class="hr" />
        <p class="t-eyebrow">{{ t('archive.themesEyebrow') }}</p>
        <p class="t-caption" style="margin-top: var(--space-2); line-height: 1.7">
          {{ t('archive.themesNote') }}
        </p>
        <div class="themes">
          <div class="theme">
            <span class="theme__k">{{ t('archive.themeAgency') }}</span>
            <span class="tag" :class="entry.themes.agency === 'rising' ? 'tag--success' : 'tag--neutral'">
              {{ t('themes.agency.' + entry.themes.agency) }}
            </span>
          </div>
          <div class="theme">
            <span class="theme__k">{{ t('archive.themeType') }}</span>
            <span class="tag" :class="entry.themes.redemption === 'redemption' ? 'tag--accent' : 'tag--neutral'">
              {{ t('themes.redemption.' + entry.themes.redemption) }}
            </span>
          </div>
          <div class="theme">
            <span class="theme__k">{{ t('archive.themeCoherence') }}</span>
            <span class="tag" :class="entry.themes.coherence === 'high' ? 'tag--primary' : 'tag--neutral'">
              {{ t('themes.coherence.' + entry.themes.coherence) }}
            </span>
          </div>
        </div>
      </section>

      <!-- 当时的记录（节选） -->
      <section class="card" style="margin-top: var(--space-3)">
        <h2 class="t-h3">{{ t('narrative.detail.excerptTitle') }}</h2>
        <p class="prose" style="margin-top: var(--space-3)">{{ excerptText }}</p>
        <p class="t-caption" style="margin-top: var(--space-3); line-height: 1.7">
          {{ t('narrative.detail.excerptNote') }}
        </p>
      </section>

      <!-- 改写后的叙述 -->
      <section class="card" style="margin-top: var(--space-3)">
        <h2 class="t-h3">{{ t('narrative.detail.sampleTitle') }}</h2>
        <p v-if="entry.sample" class="prose" style="margin-top: var(--space-3)">{{ entry.sample }}</p>
        <p v-else class="t-body t-dim" style="margin: var(--space-3) 0 0">
          {{ t('narrative.detail.noSample') }}
        </p>
        <p v-if="entry.sample" class="t-caption" style="margin-top: var(--space-3); line-height: 1.7">
          {{ t('narrative.detail.sampleNote', { lens: lensName(entry.lens) }) }}
        </p>
      </section>

      <!-- 命中的判据 -->
      <section class="card" style="margin-top: var(--space-3)">
        <h2 class="t-h3">{{ t('narrative.detail.hitsTitle') }}</h2>
        <div v-if="entry.critiqueHits?.length" class="crit-list">
          <div v-for="h in entry.critiqueHits" :key="h" class="crit">
            <span class="hit">{{ criterion(h)?.label || h }}</span>
            <span v-if="criterion(h)?.hint" class="t-caption crit__hint">{{ criterion(h).hint }}</span>
          </div>
        </div>
        <p v-else class="t-body t-dim" style="margin: var(--space-3) 0 0">
          {{ t('narrative.detail.hitsNone') }}
        </p>
      </section>

      <!-- 这个强度为什么这样处理 -->
      <section v-if="bandInfo" class="card" style="margin-top: var(--space-3)">
        <h2 class="t-h3">{{ t('narrative.detail.bandTitle') }}</h2>
        <p class="t-body" style="margin-top: var(--space-3)">
          <strong>{{ bandInfo.label }}</strong>
          <span class="t-dim"> · {{ bandInfo.method }}</span>
        </p>
        <p class="t-body t-dim" style="margin-top: var(--space-2); line-height: 1.8">{{ bandInfo.why }}</p>
      </section>

      <div class="note note--quiet" style="margin-top: var(--space-5)">{{ t('archive.notScoreNote') }}</div>

      <div class="row row--end" style="margin-top: var(--space-5)">
        <RouterLink to="/narrative" class="btn btn-secondary" style="text-decoration: none">
          {{ t('narrative.detail.back') }}
        </RouterLink>
      </div>
    </template>
  </main>
</template>

<style scoped>
.back { display: inline-flex; align-items: center; gap: 6px; }

.themes { display: flex; flex-wrap: wrap; gap: var(--space-5); margin-top: var(--space-4); }
.theme { display: flex; flex-direction: column; gap: var(--space-2); }
.theme__k { font-size: var(--font-size-caption); color: var(--txj-neutral-400); }

.prose { font-size: 14.5px; line-height: 1.85; color: var(--muted-foreground); white-space: pre-wrap; }

.crit-list { display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-4); }
.crit { display: flex; flex-direction: column; gap: 3px; }
.hit {
  align-self: flex-start;
  font-family: var(--font-mono); font-size: 11px; padding: 1px 6px;
  border-radius: var(--radius-sm); background: var(--txj-primary-50); color: var(--txj-primary-700);
}
.crit__hint { line-height: 1.7; }
</style>