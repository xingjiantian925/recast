<script setup>
/**
 * ArchiveView — Step 9 归档与叙事线
 *
 * 两条路径都会到这里：
 *  - recast：已在 Step 6 通过质检并入库，这里只做**入库摘要与主题标注**。
 *  - reappraisal：低强度素材不走抽离（Step 2 路由），在这里以重评引导收尾后入库。
 *
 * 黏性的正当来源在这里：用户看到的是自己的叙事在变（Adler 2012：agency 上升**先于**
 * 症状改善，回看是在读领先指标），而不是一条被系统催出来的打卡记录。
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '../components/Icon.vue'
import { REAPPRAISE_PROMPTS } from '../mock/fixtures'
import { session } from '../stores/session'
import { journal, journalApi } from '../stores/journal'

const router = useRouter()
const { t } = useI18n()
const isReappraisal = computed(() => session.band === 'low')
const archived = ref(false)

const entry = computed(() => (archived.value ? journal.entries[0] : null))

onMounted(() => {
  // 低强度素材不走抽离，在这里以重评引导收尾后入库（只入一次）
  if (isReappraisal.value && !archived.value) {
    journalApi.archive({
      text: session.text,
      intensity: session.intensity,
      band: session.band,
      lens: null,
      passed: false,
      critiqueHits: [],
      kind: 'reappraisal',
    })
  }
  archived.value = true
})

function done() {
  session.reset()
  router.push('/')
}
</script>

<template>
  <main class="page page--narrow">
    <div class="card">
      <span class="t-eyebrow">{{ t('archive.eyebrow') }}</span>
      <h1 class="t-h2" style="margin-top: var(--space-2)">
        {{ isReappraisal ? t('archive.titleReappraisal') : t('archive.titleRecast') }}
      </h1>

      <p v-if="isReappraisal" class="t-body t-dim" style="margin-top: var(--space-3); line-height: 1.8">
        {{ t('archive.reappraisalNote') }}
      </p>

      <div v-if="isReappraisal" class="rea">
        <div v-for="(p, i) in REAPPRAISE_PROMPTS" :key="i" class="prompt">
          <Icon name="chevron-right" :size="14" class="prompt__icon" />
          <span>{{ p }}</span>
        </div>
      </div>

      <!-- 主题标注 -->
      <template v-if="entry">
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

        <div class="note note--quiet" style="margin-top: var(--space-5)">
          {{ t('archive.notScoreNote') }}
        </div>
      </template>

      <div class="row row--end" style="margin-top: var(--space-5)">
        <RouterLink to="/narrative" class="btn btn-secondary" style="text-decoration: none">
          {{ t('archive.viewNarrative') }}
        </RouterLink>
        <button class="btn btn-primary" @click="done">{{ t('archive.finish') }}</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.rea { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-4); }
.prompt { display: flex; align-items: flex-start; gap: 6px; font-size: 14.5px; color: var(--muted-foreground); line-height: 1.7; }
.prompt__icon { color: var(--txj-primary-300); margin-top: 5px; }

.themes { display: flex; flex-wrap: wrap; gap: var(--space-5); margin-top: var(--space-4); }
.theme { display: flex; flex-direction: column; gap: var(--space-2); }
.theme__k { font-size: var(--font-size-caption); color: var(--txj-neutral-400); }
</style>