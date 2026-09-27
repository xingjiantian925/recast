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
  // 以"用户确认写完"作为 Step 1 的完成标记（不设字数门槛，空稿也能继续）
  session.finishWriting()
  router.push('/intensity')
}

/**
 * 输入质量预检（Step 1）——**只提示，从不拦你**。
 * 缺哪一项都不影响继续：缺失的要素留给后续步骤用选项 + 输入补齐。
 * 判据是"后续抽离改写需要什么"，不是"写得好不好"。
 */
const showPrecheck = ref(false)

const FIRST_PERSON_RE = /(我|自己)|\b(i|me|my|myself|mine)\b/i
const BODY_RE =
  /(心跳|发抖|颤抖|胸口|胃|喉咙|肩膀|呼吸|出汗|恶心|脸红)|(heartbeat|shak|trembl|chest|stomach|throat|breath|sweat|nausea|blush)/i
const EMOTION_RE =
  /(难过|愤怒|生气|害怕|恐惧|焦虑|紧张|羞耻|委屈|无力|绝望|孤独|伤心|痛苦|沮丧|烦躁)|(sad|angry|afraid|fear|anxious|nervous|ashamed|shame|helpless|lost|lonely|hurt|upset|pain|grief|frustrat)/i

const precheckItems = computed(() => {
  const text = session.text || ''
  const body = BODY_RE.test(text) || EMOTION_RE.test(text)
  return [
    { id: 'len', ok: session.wordCount >= 100 },
    { id: 'dose', ok: !underDose.value },
    { id: 'first', ok: FIRST_PERSON_RE.test(text) },
    { id: 'body', ok: body },
  ]
})
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
      <div class="row" style="gap: var(--space-2)">
        <button class="btn btn-secondary btn-sm" @click="showPrecheck = !showPrecheck">
          <Icon name="circle-question-mark" :size="14" class="btn-icon" />
          {{ t('write.precheckBtn') }}
        </button>
        <button class="btn btn-tertiary btn-sm" @click="fillSample">{{ t('write.fillSample') }}</button>
      </div>
    </div>

    <div v-if="showPrecheck" class="precheck">
      <p class="precheck__title">{{ t('write.precheckTitle') }}</p>
      <ul class="precheck__list">
        <li v-for="item in precheckItems" :key="item.id" class="precheck__item" :class="{ 'is-ok': item.ok }">
          <Icon :name="item.ok ? 'circle-check' : 'circle-minus'" :size="14" class="precheck__icon" />
          <span class="precheck__label">{{ t('write.precheck.' + item.id) }}</span>
          <span class="precheck__state">{{ item.ok ? t('write.precheckOk') : t('write.precheckMiss') }}</span>
        </li>
      </ul>
      <p class="precheck__note">{{ t('write.precheckNote') }}</p>
    </div>

    <div class="prompts">
      <div v-for="(p, i) in WRITING_PROMPTS" :key="i" class="prompt">
        <Icon name="chevron-right" :size="14" class="prompt__icon" />
        <span>{{ p }}</span>
      </div>
    </div>

    <div v-if="underDose" class="note note--quiet" style="margin-top: var(--space-4)">
      {{ t('write.underDose') }}
    </div>

    <div class="row row--end" style="margin-top: var(--space-5)">
      <RouterLink to="/" class="btn btn-tertiary" style="text-decoration: none">{{ t('write.later') }}</RouterLink>
      <button class="btn btn-primary" @click="goNext">
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

.precheck {
  margin-top: var(--space-3); padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  background: var(--surface-2, rgba(0, 0, 0, 0.015));
}
.precheck__title { font-size: 13px; font-weight: 600; color: var(--txj-neutral-600); margin-bottom: var(--space-2); }
.precheck__list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.precheck__item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--txj-neutral-500); }
.precheck__item.is-ok { color: var(--txj-neutral-700); }
.precheck__icon { color: var(--color-warning); }
.precheck__item.is-ok .precheck__icon { color: var(--txj-primary-500, var(--primary)); }
.precheck__label { flex: 1; }
.precheck__state { font-size: 12px; color: var(--txj-neutral-400); }
.precheck__note { margin-top: var(--space-2); font-size: 12px; color: var(--txj-neutral-400); line-height: 1.55; }
</style>