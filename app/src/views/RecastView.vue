<script setup>
/**
 * RecastView — Step 4 改写执行 / Step 5 重构质检 / Step 6 双轨输出
 *
 * 全流程最关键的一步。三件事必须在界面上可见：
 *
 *  1. **重构引导必触发。** 人称替换只是表层；只换人称不产生认知变化，
 *     反而多一层自我异化（Step 4 反模式）。
 *  2. **质检判据是"是否真的发生了重构"，不是"人称改对了没有"。**
 *     这是本产品最容易自欺的地方（Step 5 反模式）。
 *  3. **未通过时换引导语重试，不是换人称重试。** 界面上把这条说清楚。
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StepRail from '../components/StepRail.vue'
import Icon from '../components/Icon.vue'
import MetaNote from '../components/MetaNote.vue'
import { RECONSTRUE_PROMPTS, NEGATIVE_INDICATORS, LENSES } from '../mock/fixtures'
import { session } from '../stores/session'
import { journalApi } from '../stores/journal'

const router = useRouter()
const { t } = useI18n()

const promptIndex = ref(0)
const flags = ref([])

const result = computed(() => session.result)
const passed = computed(() => Boolean(result.value?.critique.passed))
const failed = computed(() => Boolean(result.value && !result.value.critique.passed))
const exhausted = computed(() => session.exhausted)

const lensLabel = computed(() => LENSES.value.find((l) => l.id === session.lens)?.name || session.lens)
const stepLabel = computed(() => t('step.recast', { lens: lensLabel.value }))

const gateTitle = computed(() => {
  if (passed.value) return t('recast.gatePassed')
  if (exhausted.value) return t('recast.gateExhausted')
  return t('recast.gateFailed')
})
const gateTag = computed(() => {
  if (passed.value) return t('recast.gateTagPass')
  if (exhausted.value) return t('recast.gateTagExhausted')
  return t('recast.gateTagRetry')
})
const flagNote = computed(() => t('recast.flagNote', { n: flags.value.length }))

async function run() {
  await session.runEngine()
}

function retry() {
  // 换引导语重试——这是 Step 5 的明确要求
  promptIndex.value = (promptIndex.value + 1) % RECONSTRUE_PROMPTS.value.length
  session.runEngine()
}

function toggleFlag(id) {
  flags.value = flags.value.includes(id)
    ? flags.value.filter((f) => f !== id)
    : [...flags.value, id]
}

function save() {
  journalApi.archive({
    text: session.text,
    intensity: session.intensity,
    band: session.band,
    lens: session.lens,
    passed: true,
    critiqueHits: result.value.critique.findings.filter((f) => f.hit).map((f) => f.id),
    kind: 'recast',
  })
  router.push('/archive')
}

function toSupport() {
  session.stabilize('critique-exhausted')
  router.push('/support')
}
</script>

<template>
  <main class="page page--writing">
    <StepRail :now="5" :total="6" :label="stepLabel" />

    <!-- ── A. 改写工作台 ── -->
    <section v-if="!result" class="stack--lg" style="display: flex; flex-direction: column; gap: var(--space-5)">
      <header>
        <h1 class="t-h2">{{ t('recast.workTitle') }}</h1>
        <p class="t-body t-dim" style="margin-top: var(--space-2); line-height: 1.8">
          {{ t('recast.workLedeLead') }}<b>{{ t('recast.workLedeBold') }}</b>{{ t('recast.workLedeTail') }}
        </p>
      </header>

      <div class="grid-2" style="align-items: start">
        <div class="card card--flat" style="background: var(--surface)">
          <p class="t-eyebrow">{{ t('recast.yourText') }}</p>
          <p class="orig">{{ session.text }}</p>
        </div>

        <div class="stack">
          <div class="card">
            <p class="t-eyebrow">{{ t('recast.guideEyebrow') }}</p>
            <div class="stack--sm" style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-3)">
              <button
                v-for="(p, i) in RECONSTRUE_PROMPTS"
                :key="p.id"
                class="guide"
                :class="{ 'is-on': promptIndex === i }"
                @click="promptIndex = i"
              >
                <span class="guide__text">{{ p.text }}</span>
                <span class="guide__note">{{ p.note }}</span>
              </button>
            </div>
          </div>

          <button class="btn btn-primary btn-lg btn-block" :disabled="session.busy" @click="run">
            <Icon name="send-horizontal" :size="18" />
            {{ session.busy ? t('recast.generating') : t('recast.generate') }}
          </button>
          <p class="t-caption" style="text-align: center">
            {{ t('recast.stubNote') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ── B. 质检门 ── -->
    <section v-else class="stack" style="display: flex; flex-direction: column; gap: var(--space-5)">
      <!-- 质检结果 -->
      <div class="card" :class="{ 'gate--fail': failed }">
        <div class="card-head">
          <div>
            <p class="t-eyebrow">{{ t('recast.gateEyebrow') }}</p>
            <h2 class="t-h4" style="margin-top: var(--space-1)">
              {{ gateTitle }}
            </h2>
          </div>
          <span class="tag" :class="passed ? 'tag--success' : exhausted ? 'tag--error' : 'tag--warning'">
            <span class="dot" />{{ gateTag }}
          </span>
        </div>

        <div class="gate" style="margin-top: var(--space-4)">
          <div v-for="f in result.critique.findings" :key="f.id" class="gate__item">
            <span class="gate__mark" :class="f.hit ? 'gate__mark--yes' : 'gate__mark--no'">
              {{ f.hit ? '✓' : '·' }}
            </span>
            <div>
              <p style="margin: 0">
                <b>{{ f.label }}</b>
                <span v-if="f.hit" class="t-caption"> — {{ f.evidence }}</span>
              </p>
              <p v-if="!f.hit" class="t-caption" style="margin-top: 2px">{{ f.evidence }}</p>
            </div>
          </div>
        </div>

        <div v-if="failed && !exhausted" class="note note--warn" style="margin-top: var(--space-4)">
          <b>{{ t('recast.failNoteBold') }}</b>
          {{ t('recast.failNoteTail') }}<b>{{ t('recast.failNoteTailBold') }}</b>{{ t('recast.failNoteTail2') }}
        </div>

        <div v-if="exhausted" class="note note--danger" style="margin-top: var(--space-4)">
          {{ t('recast.exhaustedNote') }}
        </div>
      </div>

      <!-- C. 双轨输出 -->
      <div v-if="passed" class="tracks">
        <div class="track track--cool">
          <p class="t-eyebrow">{{ t('recast.trackCool') }}</p>
          <p class="track__writing">{{ result.distanced }}</p>
        </div>
        <div class="track track--warm">
          <p class="t-eyebrow">{{ t('recast.trackWarm') }}</p>
          <p class="track__writing">{{ result.warmth }}</p>
          <p class="t-caption" style="margin-top: var(--space-3); color: var(--txj-accent-700); line-height: 1.7">
            {{ t('recast.warmthNote') }}
          </p>
        </div>
      </div>

      <!-- 负性指标自检 -->
      <div v-if="passed" class="card card--quiet">
        <p class="t-eyebrow">{{ t('recast.selfCheckEyebrow') }}</p>
        <p class="t-caption" style="margin-top: var(--space-2); line-height: 1.7">
          {{ t('recast.selfCheckNote') }}
        </p>
        <div class="flags">
          <button
            v-for="n in NEGATIVE_INDICATORS"
            :key="n.id"
            class="flag"
            :class="{ 'is-on': flags.includes(n.id) }"
            @click="toggleFlag(n.id)"
          >
            <b>{{ n.label }}</b>
            <span class="t-caption">{{ n.hint }}</span>
          </button>
        </div>
        <div v-if="flags.length" class="note note--danger" style="margin-top: var(--space-4)">
          {{ flagNote }}
        </div>
      </div>

      <!-- 动作 -->
      <div class="row row--end">
        <template v-if="!passed && !exhausted">
          <button class="btn btn-secondary" @click="retry">
            <Icon name="chevron-right" :size="16" class="btn-icon" />
            {{ t('recast.retry') }}
          </button>
        </template>
        <template v-else-if="exhausted">
          <button class="btn btn-secondary" @click="toSupport">{{ t('recast.toSupport') }}</button>
        </template>
        <template v-else>
          <button
            class="btn btn-primary"
            :disabled="flags.length > 0"
            @click="save"
          >
            <Icon name="check" :size="16" class="btn-icon" />
            {{ t('recast.save') }}
          </button>
        </template>
      </div>

      <MetaNote v-if="passed" :index="1" />
    </section>
  </main>
</template>

<style scoped>
.orig {
  margin-top: var(--space-2);
  font-size: 16px;
  line-height: 1.9;
  color: var(--muted-foreground);
  white-space: pre-wrap;
  max-height: 46vh;
  overflow: auto;
}
.guide {
  display: block; width: 100%; text-align: left; cursor: pointer;
  padding: var(--space-3); border: 1px solid var(--border-default);
  border-radius: var(--radius-md); background: var(--surface);
  transition: all .15s;
}
.guide:hover { border-color: var(--primary); }
.guide.is-on { border-color: var(--primary); background: var(--txj-primary-50); }
.guide__text { display: block; font-size: 15px; }
.guide__note { display: block; font-size: 12px; color: var(--txj-neutral-400); margin-top: 2px; }

.gate--fail { border-color: var(--txj-warning-200); }

.flags { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: var(--space-2); margin-top: var(--space-4); }
.flag {
  display: flex; flex-direction: column; gap: 2px; text-align: left; cursor: pointer;
  padding: var(--space-3); border: 1px solid var(--border-default);
  border-radius: var(--radius-md); background: var(--surface); transition: all .15s;
}
.flag:hover { border-color: var(--color-error); }
.flag.is-on { border-color: var(--color-error); background: var(--txj-error-50); }
</style>