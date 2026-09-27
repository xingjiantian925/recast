<script setup>
/**
 * CheckinView — Step 10 · 强制复核点
 *
 * 复核窗口来自 Giovanetti 2019：那项研究的伤害发生在"每日反复 + 2 周"这个窗口，
 * 所以第 2 周是必查点（警戒档尤其）。
 *
 * 合规实现（§7）：界面上**不出现任何量表分数或轨迹**。
 * 分数只用于内部比较是否恶化，比较结果也不落库为分数序列，只留一个结论。
 */
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PHQ9, RRS_BROODING, CRISIS_RESOURCES } from '../mock/fixtures'
import { TIER_INFO } from '../engine'
import { session } from '../stores/session'
import { journal, journalApi } from '../stores/journal'

const { t } = useI18n()
const mode = ref('idle') // idle | form | verdict
const verdict = ref(null)

const phq = reactive(Array(PHQ9.value.items.length).fill(null))
const rrs = reactive(Array(RRS_BROODING.value.items.length).fill(null))

const schedule = computed(() => TIER_INFO.value[session.tier]?.checkinWeeks ?? [2, 4, 8])
const due = computed(() => (session.tier ? journalApi.checkinDue(session.tier) : { due: false }))
const isWatch = computed(() => session.tier === 'watch')
const tierLabel = computed(() => TIER_INFO.value[session.tier]?.label || '')

const complete = computed(() => phq.every((v) => v !== null) && rrs.every((v) => v !== null))

const VERDICT_KEY = { stable: 'Stable', improved: 'Improved', worsened: 'Worsened' }
const verdictView = computed(() => {
  const v = verdict.value
  if (!v) return null
  const k = VERDICT_KEY[v]
  return {
    tag: v === 'worsened' ? 'tag--error' : 'tag--success',
    title: t(`checkin.result${k}Title`),
    body:
      v === 'worsened'
        ? t(isWatch.value ? 'checkin.resultWorsenedBodyWatch' : 'checkin.resultWorsenedBodyRoutine')
        : t(`checkin.result${k}Body`),
    actionTag: v === 'worsened' ? t('checkin.needsAction') : t('checkin.noAction'),
    disposeTitle:
      v === 'worsened'
        ? t(isWatch.value ? 'checkin.disposeTitleWatch' : 'checkin.disposeTitleRoutine')
        : '',
    disposeBody:
      v === 'worsened'
        ? t(isWatch.value ? 'checkin.disposeBodyWatch' : 'checkin.disposeBodyRoutine')
        : '',
  }
})

const lastCheckinLabel = computed(() => {
  const last = journal.checkins[0]
  if (!last) return ''
  return t('checkin.lastCheckin', {
    date: last.at.slice(0, 10),
    verdict: t(`checkin.verdict${VERDICT_KEY[last.verdict]}`),
  })
})

function submit() {
  const sum = (a) => a.reduce((x, y) => x + (y ?? 0), 0)
  // 分数只在这一行里存在，之后既不落库也不上屏
  verdict.value = journalApi.compare({ phq9: sum(phq), rrs: sum(rrs) })
  journalApi.recordCheckin({ verdict: verdict.value, tier: session.tier })
  mode.value = 'verdict'
}

/** 演示用：不必真的填 14 道题也能看到两条分支 */
function demo(v) {
  verdict.value = v
  journalApi.recordCheckin({ verdict: v, tier: session.tier })
  mode.value = 'verdict'
}
</script>

<template>
  <main class="page page--narrow">
    <header style="margin-bottom: var(--space-5)">
      <h1 class="t-h2">{{ t('checkin.title') }}</h1>
      <p class="t-body t-dim" style="margin-top: var(--space-2); line-height: 1.8">
        {{ t('checkin.ledeLead') }}<b>{{ t('checkin.ledeBold') }}</b>{{ t('checkin.ledeTail') }}
      </p>
    </header>

    <div v-if="!session.tier" class="card card--quiet">
      <p class="t-body t-dim" style="margin: 0">{{ t('checkin.noTier') }}</p>
      <RouterLink to="/intake" class="btn btn-secondary btn-sm" style="margin-top: var(--space-4); text-decoration: none">
        {{ t('checkin.goTriage') }}
      </RouterLink>
    </div>

    <template v-else>
      <!-- 日程 -->
      <div class="card">
        <div class="card-head">
          <h2 class="card-title">{{ t('checkin.scheduleTitle') }}</h2>
          <span class="tag" :class="isWatch ? 'tag--warning' : 'tag--neutral'">
            {{ tierLabel }}
          </span>
        </div>
        <div class="weeks" style="margin-top: var(--space-4)">
          <div v-for="w in schedule" :key="w" class="week" :class="{ 'is-due': due.week === w }">
            <span class="week__n t-mono">{{ w }}</span>
            <span class="t-caption">{{ t('checkin.weekUnit') }}</span>
            <span v-if="w === 2 && isWatch" class="tag tag--error" style="margin-top: 6px">
              {{ t('checkin.mustTag') }}
            </span>
          </div>
        </div>
        <p class="t-caption" style="margin-top: var(--space-4); line-height: 1.75">
          {{ t('checkin.scheduleNote') }}
        </p>
        <p v-if="journal.checkins.length" class="t-caption" style="margin-top: var(--space-2)">
          {{ lastCheckinLabel }}
        </p>
      </div>

      <!-- 开始复核 -->
      <div v-if="mode === 'idle'" class="row" style="margin-top: var(--space-5); gap: var(--space-2)">
        <button class="btn btn-primary" @click="mode = 'form'">{{ t('checkin.start') }}</button>
        <button class="btn btn-tertiary btn-sm" @click="demo('stable')">{{ t('checkin.demoStable') }}</button>
        <button class="btn btn-tertiary btn-sm" @click="demo('worsened')">{{ t('checkin.demoWorsened') }}</button>
      </div>

      <!-- 量表 -->
      <div v-else-if="mode === 'form'" class="card" style="margin-top: var(--space-5)">
        <p class="t-eyebrow">{{ t('checkin.phq9Label') }}</p>
        <ol class="qlist">
          <li v-for="(item, i) in PHQ9.items" :key="'p' + i" class="q">
            <p class="q__text"><span class="q__n t-mono">{{ i + 1 }}</span>{{ item }}</p>
            <div class="q__opts">
              <button
                v-for="o in PHQ9.options"
                :key="o.v"
                class="opt"
                :class="{ 'is-on': phq[i] === o.v }"
                @click="phq[i] = o.v"
              >
                {{ o.label }}
              </button>
            </div>
          </li>
        </ol>

        <hr class="hr" />

        <p class="t-eyebrow">{{ RRS_BROODING.name }} · {{ t('checkin.rrsSuffix') }}</p>
        <ol class="qlist">
          <li v-for="(item, i) in RRS_BROODING.items" :key="'r' + i" class="q">
            <p class="q__text"><span class="q__n t-mono">{{ i + 1 }}</span>{{ item }}</p>
            <div class="q__opts">
              <button
                v-for="o in RRS_BROODING.options"
                :key="o.v"
                class="opt"
                :class="{ 'is-on': rrs[i] === o.v }"
                @click="rrs[i] = o.v"
              >
                {{ o.label }}
              </button>
            </div>
          </li>
        </ol>

        <div class="row row--end" style="margin-top: var(--space-5)">
          <button class="btn btn-primary" :disabled="!complete" @click="submit">{{ t('checkin.seeVerdict') }}</button>
        </div>
      </div>

      <!-- 结论 -->
      <div v-else class="card" style="margin-top: var(--space-5)">
        <span class="t-eyebrow">{{ t('checkin.verdictEyebrow') }}</span>
        <div class="row row--between" style="margin-top: var(--space-3); align-items: center">
          <h2 class="t-h3">{{ verdictView?.title }}</h2>
          <span class="tag" :class="verdictView?.tag">
            <span class="dot" />{{ verdictView?.actionTag }}
          </span>
        </div>
        <p class="t-body t-dim" style="margin-top: var(--space-3); line-height: 1.8">{{ verdictView?.body }}</p>

        <div v-if="verdict === 'worsened'" class="stack" style="margin-top: var(--space-4)">
          <div class="note note--danger">
            <b>{{ verdictView?.disposeTitle }}</b>
            <p style="margin-top: var(--space-2)">
              {{ verdictView?.disposeBody }}
            </p>
          </div>
          <ul class="res">
            <li v-for="r in CRISIS_RESOURCES" :key="r.value" class="res__item">
              <div>
                <p class="res__name">{{ r.name }}</p>
                <p class="t-caption">{{ r.note }}</p>
              </div>
              <span class="res__num t-mono">{{ r.value }}</span>
            </li>
          </ul>
          <RouterLink to="/safety" class="btn btn-secondary btn-sm" style="text-decoration: none">
            {{ t('checkin.toSafety') }}
          </RouterLink>
        </div>

        <div class="note note--quiet" style="margin-top: var(--space-4)">
          {{ t('checkin.noScoreNote') }}
        </div>

        <div class="row row--end" style="margin-top: var(--space-5)">
          <button class="btn btn-tertiary" @click="mode = 'idle'; verdict = null">{{ t('checkin.done') }}</button>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.weeks { display: flex; gap: var(--space-3); }
.week {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: var(--space-3); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md); background: var(--surface);
}
.week.is-due { border-color: var(--color-warning); background: var(--txj-warning-50); }
.week__n { font-size: 22px; }

.qlist { list-style: none; margin: var(--space-4) 0 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-4); }
.q__text { margin: 0 0 var(--space-2); font-size: 15px; line-height: 1.7; }
.q__n { color: var(--txj-neutral-400); margin-right: var(--space-2); }
.q__opts { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.opt {
  padding: 5px 12px; border: 1px solid var(--border-default); border-radius: var(--radius-pill);
  background: var(--surface); color: var(--muted-foreground); font-size: 12.5px; cursor: pointer;
  transition: all .15s;
}
.opt:hover { border-color: var(--primary); color: var(--primary); }
.opt.is-on { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }

.res { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
.res__item {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
  padding: var(--space-3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  background: var(--surface);
}
.res__name { margin: 0; font-weight: 500; }
.res__num { font-size: 20px; color: var(--color-error); }
</style>