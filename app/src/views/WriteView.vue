<script setup>
/**
 * WriteView — Step 1 第一人称原貌书写
 *
 * 三条设计要点：
 *  1. 单次引导 ≥ 15 分钟（Frattaroli 2006 的剂量调节变量），但**不强制**——
 *     未到时长只提示"低于证据剂量"，不锁死按钮。工具不做规训。
 *  2. 鼓励写情绪与躯体感受，**不做提前收束**。
 *  3. 这一步**禁止改写人称**。第一人称原貌是必需对照组，也是 Step 5 质检的基线。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StepRail from '../components/StepRail.vue'
import Icon from '../components/Icon.vue'
import { WRITING_PROMPTS, SAMPLE_WRITING } from '../mock/fixtures'
import { session } from '../stores/session'

const router = useRouter()
const { t } = useI18n()
const timer = ref(null)
const now = ref(0)

const elapsed = computed(() => {
  if (!session.startedAt) return 0
  return now.value - session.startedAt
})
const mmss = computed(() => {
  const s = Math.max(0, Math.floor(elapsed.value / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})
const underDose = computed(() => elapsed.value < 15 * 60 * 1000)

onMounted(() => {
  timer.value = setInterval(() => {
    now.value = Date.now()
    session.setElapsed(elapsed.value)
  }, 500)
  if (session.text) session.startWriting()
})
onBeforeUnmount(() => clearInterval(timer.value))

function onInput() {
  session.startWriting()
}

function fillSample() {
  session.text = SAMPLE_WRITING.value
  session.startWriting()
  // 演示用：把计时器垫到证据剂量以上，方便走通后续步骤
  session.startedAt = Date.now() - 16.5 * 60 * 1000
  session.setElapsed(elapsed.value)
}

function goNext() {
  session.setElapsed(elapsed.value)
  router.push('/intensity')
}
</script>

<template>
  <main class="page page--writing">
    <StepRail :now="2" :total="6" :label="t('step.write')" />

    <header class="row row--between" style="align-items: flex-end; margin-bottom: var(--space-4)">
      <div>
        <h1 class="t-h2">{{ t('write.title') }}</h1>
        <p class="t-body t-dim" style="margin-top: var(--space-2)">
          {{ t('write.lede') }}
        </p>
      </div>
      <div class="timerbox">
        <span class="timer" :class="{ 'is-under': underDose }">{{ mmss }}</span>
        <span class="t-caption">{{ t('write.timerLabel') }}</span>
      </div>
    </header>

    <div class="writing-paper">
      <textarea
        v-model="session.text"
        class="writing"
        :placeholder="t('write.placeholder')"
        spellcheck="false"
        @input="onInput"
      />
    </div>

    <div class="row row--between" style="margin-top: var(--space-3)">
      <span class="counter" :class="{ 'counter--warn': session.wordCount < 100 }">
        {{ t('write.counter', { n: session.wordCount }) }}
      </span>
      <button class="btn btn-tertiary btn-sm" @click="fillSample">{{ t('write.fillSample') }}</button>
    </div>

    <div class="prompts">
      <div v-for="(p, i) in WRITING_PROMPTS" :key="i" class="prompt">
        <Icon name="chevron-right" :size="14" class="prompt__icon" />
        <span>{{ p }}</span>
      </div>
    </div>

    <div v-if="session.startedAt" class="note note--quiet" style="margin-top: var(--space-4)">
      {{ t('write.underDose') }}
    </div>

    <div class="row row--end" style="margin-top: var(--space-5)">
      <RouterLink to="/" class="btn btn-tertiary" style="text-decoration: none">{{ t('write.later') }}</RouterLink>
      <button class="btn btn-primary" :disabled="session.wordCount < 20" @click="goNext">
        {{ t('write.next') }}
        <Icon name="arrow-right" :size="16" class="btn-icon" />
      </button>
    </div>
  </main>
</template>

<style scoped>
.timerbox { display: flex; flex-direction: column; align-items: flex-end; }
.timer { font-size: 22px; color: var(--txj-neutral-400); transition: color .3s; }
.timer.is-under { color: var(--color-warning); }

.prompts {
  display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-5);
  margin-top: var(--space-5); padding-top: var(--space-4);
  border-top: 1px dashed var(--border-subtle);
}
.prompt { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; color: var(--txj-neutral-500); }
.prompt__icon { color: var(--txj-primary-300); }
</style>