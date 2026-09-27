<script setup>
/**
 * IntakeView — Step 0 准入分诊（仅首次 + 每 2 周）
 *
 * 两处合规约束直接体现在实现里：
 *  1. 结果页**不展示分数**，只给分层。§7 要求"不对外展示 RRS-brooding / PHQ-9 轨迹"，
 *     量表仅用于自评与是否转介。
 *  2. PHQ-9 第 9 题的任一非零作答走**独立危机通道**，不进入改写流程（Step 10 第 1 条）。
 */
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StepRail from '../components/StepRail.vue'
import Icon from '../components/Icon.vue'
import { PHQ9, GAD7, RRS_BROODING, SCALES, CRISIS_RESOURCES, CRISIS_COPY } from '../mock/fixtures'
import { triage, TIER_INFO } from '../mock/engine'
import { session } from '../stores/session'
import { journalApi } from '../stores/journal'

const router = useRouter()
const { t } = useI18n()
const at = ref(0)
const done = ref(false)

// SCALES 是 computed 数组（随语言切换），元素本身是普通对象
const answers = reactive({
  phq9: Array(PHQ9.value.items.length).fill(null),
  gad7: Array(GAD7.value.items.length).fill(null),
  rrs: Array(RRS_BROODING.value.items.length).fill(null),
})

const current = computed(() => SCALES.value[at.value])
const currentAnswers = computed(() => answers[current.value.id])
const complete = computed(() => currentAnswers.value.every((v) => v !== null))
const totalItems = computed(() => SCALES.value.reduce((n, s) => n + s.items.length, 0))
const progress = computed(() => {
  const filled = [...answers.phq9, ...answers.gad7, ...answers.rrs].filter((v) => v !== null).length
  return Math.round((filled / totalItems.value) * 100)
})
const scaleIndex = computed(() => SCALES.value.findIndex((s) => s.id === current.value.id) + 1)

const tier = ref(null)
const tierInfo = computed(() => (tier.value ? TIER_INFO.value[tier.value] : null))
const doseCapLabel = computed(() => t('intake.doseCapValue', { n: tierInfo.value?.doseCap ?? 0 }))
const checkinPointsLabel = computed(() =>
  t('intake.checkinPointsValue', {
    weeks: tierInfo.value ? tierInfo.value.checkinWeeks.join(t('common.listSep')) : '',
  })
)
const introBodyLabel = computed(() => t('intake.introBody', { count: totalItems.value }))

function pick(i, v) {
  currentAnswers.value[i] = v
}

function next() {
  if (at.value < SCALES.value.length - 1) {
    at.value += 1
    return
  }
  finish()
}

function finish() {
  const sum = (arr) => arr.reduce((a, b) => a + (b ?? 0), 0)
  const scores = { phq9: sum(answers.phq9), gad7: sum(answers.gad7), rrs: sum(answers.rrs) }
  tier.value = triage({ ...scores, selfHarmFlag: answers.phq9[8] ?? 0 })
  session.setTier(tier.value)
  // 基线只用于将来复核时比较是否恶化，不渲染、不形成轨迹
  journalApi.setBaseline(scores)
  done.value = true
}

/** 演示用：不必手填 21 题也能看到分层结果 */
function quickDemo() {
  answers.phq9.fill(0)
  answers.gad7.fill(0)
  answers.rrs.fill(1)
  finish()
}

function proceed() {
  router.push(tier.value === 'crisis' ? '/support' : '/write')
}
</script>

<template>
  <main class="page page--narrow">
    <StepRail :now="1" :total="6" :label="t('step.intake')" />

    <!-- 结果 -->
    <template v-if="done">
      <div v-if="tier === 'crisis'" class="stack">
        <div class="note note--danger">
          <b>{{ CRISIS_COPY.title }}</b>
          <p style="margin-top: var(--space-2)">{{ CRISIS_COPY.body }}</p>
          <p style="margin-top: var(--space-2)">{{ CRISIS_COPY.action }}</p>
        </div>

        <div class="card">
          <h2 class="card-title">{{ t('intake.crisisNumbersTitle') }}</h2>
          <ul class="res">
            <li v-for="r in CRISIS_RESOURCES" :key="r.value" class="res__item">
              <div>
                <p class="res__name">{{ r.name }}</p>
                <p class="t-caption">{{ r.note }}</p>
              </div>
              <span class="res__num t-mono">{{ r.value }}</span>
            </li>
          </ul>
          <p class="t-caption" style="margin-top: var(--space-4)">
            {{ t('intake.crisisChannelNote') }}
          </p>
        </div>
        <RouterLink to="/support" class="btn btn-secondary" style="text-decoration: none">
          {{ t('intake.crisisSupportLink') }}
        </RouterLink>
      </div>

      <div v-else class="stack">
        <div class="card">
          <span class="t-eyebrow">{{ t('intake.resultEyebrow') }}</span>
          <h1 class="t-h2" style="margin-top: var(--space-2)">{{ tierInfo?.label }}</h1>
          <p class="t-body t-dim" style="margin-top: var(--space-3); line-height: 1.8">
            {{ tierInfo?.desc }}
          </p>

          <hr class="hr" />

          <div class="grid-2">
            <div>
              <p class="t-eyebrow">{{ t('intake.doseCapLabel') }}</p>
              <p class="t-h3 t-mono" style="margin-top: var(--space-1)">{{ doseCapLabel }}</p>
            </div>
            <div>
              <p class="t-eyebrow">{{ t('intake.checkinPointsLabel') }}</p>
              <p class="t-h3 t-mono" style="margin-top: var(--space-1)">{{ checkinPointsLabel }}</p>
            </div>
          </div>

          <div class="note note--quiet" style="margin-top: var(--space-5)">
            {{ t('intake.scoreNote') }}
          </div>
        </div>

        <div class="row row--end">
          <RouterLink to="/safety" class="btn btn-tertiary" style="text-decoration: none">
            {{ t('intake.seeSafety') }}
          </RouterLink>
          <button class="btn btn-primary" @click="proceed">
            {{ t('intake.proceed') }}
            <Icon name="arrow-right" :size="16" class="btn-icon" />
          </button>
        </div>
      </div>
    </template>

    <!-- 答题 -->
    <template v-else>
      <header class="stack--sm" style="margin-bottom: var(--space-5)">
        <h1 class="t-h2">{{ t('intake.introTitle') }}</h1>
        <p class="t-body t-dim" style="line-height: 1.8">{{ introBodyLabel }}</p>
      </header>

      <div class="card">
        <div class="row row--between" style="margin-bottom: var(--space-3)">
          <div class="row" style="gap: var(--space-2)">
            <span class="tag tag--primary">{{ current.name }}</span>
            <span class="t-caption">{{ scaleIndex }} / {{ SCALES.length }}</span>
          </div>
          <span class="t-mono t-dim" style="font-size: 12px">{{ progress }}%</span>
        </div>

        <p class="t-body t-dim">{{ current.intro }}</p>
        <p v-if="current.note" class="t-caption" style="margin-top: var(--space-1); color: var(--color-warning)">
          {{ current.note }}
        </p>

        <ol class="qlist">
          <li v-for="(item, i) in current.items" :key="i" class="q">
            <p class="q__text">
              <span class="q__n t-mono">{{ i + 1 }}</span>{{ item }}
            </p>
            <div class="q__opts">
              <button
                v-for="o in current.options"
                :key="o.v"
                class="opt"
                :class="{ 'is-on': currentAnswers[i] === o.v }"
                @click="pick(i, o.v)"
              >
                {{ o.label }}
              </button>
            </div>
          </li>
        </ol>

        <div class="row row--between" style="margin-top: var(--space-5)">
          <button v-if="at > 0" class="btn btn-tertiary" @click="at -= 1">
            {{ t('intake.prevSection') }}
          </button>
          <span v-else class="spacer" />
          <div class="row">
            <button class="btn btn-tertiary btn-sm" @click="quickDemo">
              {{ t('intake.quickDemo') }}
            </button>
            <button class="btn btn-primary" :disabled="!complete" @click="next">
              {{ at < SCALES.length - 1 ? t('intake.nextSection') : t('intake.seeResult') }}
              <Icon name="arrow-right" :size="16" class="btn-icon" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.qlist { list-style: none; margin: var(--space-5) 0 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-5); }
.q__text { margin: 0 0 var(--space-2); font-size: 15.5px; line-height: 1.7; }
.q__n { color: var(--txj-neutral-400); margin-right: var(--space-2); }
.q__opts { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.opt {
  padding: 6px 14px; border: 1px solid var(--border-default); border-radius: var(--radius-pill);
  background: var(--surface); color: var(--muted-foreground); font-size: 13px; cursor: pointer;
  transition: all .15s;
}
.opt:hover { border-color: var(--primary); color: var(--primary); }
.opt.is-on { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }

.res { list-style: none; margin: var(--space-4) 0 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
.res__item {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
  padding: var(--space-3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  background: var(--surface);
}
.res__name { margin: 0; font-weight: 500; }
.res__num { font-size: 20px; color: var(--color-error); }
</style>