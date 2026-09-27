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
import PixelMorph from '../components/PixelMorph.vue'
import ScienceNote from '../components/ScienceNote.vue'
import { RECONSTRUE_PROMPTS, NEGATIVE_INDICATORS, LENSES, CRITIQUE_CRITERIA } from '../mock/fixtures'
import { engineMode, PASS_EVIDENCE, FAIL_EVIDENCE } from '../engine'
import { modelConfig } from '../model/config'
import { session } from '../stores/session'
import { journalApi } from '../stores/journal'

const router = useRouter()
const { t } = useI18n()

const promptIndex = ref(0)
const flags = ref([])

const result = computed(() => session.result)
const hasCritique = computed(() => Boolean(result.value?.critique))
const passed = computed(() => Boolean(result.value?.critique?.passed))
const failed = computed(() => Boolean(hasCritique.value && !result.value.critique.passed))
const exhausted = computed(() => session.exhausted)

/** 判据文案按 id 现取，不落库：切语言即刻生效（避免旧语言烘焙进结果） */
const criterionLabel = (id) => CRITIQUE_CRITERIA.value.find((c) => c.id === id)?.label || id
/**
 * 单条判据的依据：优先用质检模型针对**本次改写**给出的 why（原话引语）；
 * 没有时（演示模式 / 模型没给）才退回按 id 现取的通用措辞兜底。
 * 之前一律显示固定示例，用户会以为工具在处理别人的输入（"怎么老是评审会的例子"）。
 */
const criterionEvidence = (f) => f.why || (f.hit ? PASS_EVIDENCE.value[f.id] : FAIL_EVIDENCE.value[f.id]) || ''

/** 当前选中的重构引导语，随重试推进（Step 5：换个引导语重试，不是换个说法重试） */
const guidanceText = computed(() => RECONSTRUE_PROMPTS.value[promptIndex.value]?.text || '')

/** 结构预检拦截（人称残留 / 长度失控）：模型质检没有跑，展示单独的说明 */
const structuralIssue = computed(() =>
  result.value?.critique?.reason === 'structural' ? result.value.critique.issue : '',
)

/** 上下文胶囊装配报告（真实模型路径才有），按 改写 / 质检 两组展示 */
const contextGroups = computed(() => {
  const r = result.value?.contextReport
  if (!r) return []
  return [
    r.rewrite ? { key: 'rewrite', report: r.rewrite } : null,
    r.critique ? { key: 'critique', report: r.critique } : null,
  ].filter(Boolean)
})

const lensLabel = computed(() => LENSES.value.find((l) => l.id === session.lens)?.name || session.lens)
const stepLabel = computed(() => t('step.recast', { lens: lensLabel.value }))

const gateTitle = computed(() => {
  if (passed.value) return t('recast.gatePassed')
  if (exhausted.value) return t('recast.gateExhausted')
  if (structuralIssue.value) return t('recast.gateStructural')
  return t('recast.gateFailed')
})
const gateTag = computed(() => {
  if (passed.value) return t('recast.gateTagPass')
  if (exhausted.value) return t('recast.gateTagExhausted')
  return t('recast.gateTagRetry')
})
const flagNote = computed(() => t('recast.flagNote', { n: flags.value.length }))

async function run() {
  await session.runEngine({ guidance: guidanceText.value })
}

function retry() {
  // 换引导语重试——这是 Step 5 的明确要求
  promptIndex.value = (promptIndex.value + 1) % RECONSTRUE_PROMPTS.value.length
  session.runEngine({ guidance: guidanceText.value })
}

function toggleFlag(id) {
  flags.value = flags.value.includes(id)
    ? flags.value.filter((f) => f !== id)
    : [...flags.value, id]
}

function save() {
  journalApi.archive({
    text: session.text,
    rewrite: result.value.distanced, // 记忆层的风格样例来源（只存通过质检的）
    intensity: session.intensity,
    band: session.band,
    lens: session.lens,
    passed: true,
    critiqueHits: (result.value.critique.findings || []).filter((f) => f.hit).map((f) => f.id),
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
    <section v-if="!hasCritique" class="stack--lg" style="display: flex; flex-direction: column; gap: var(--space-5)">
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
          <p class="t-caption" style="text-align: center; line-height: 1.7">
            {{ engineMode === 'model'
              ? t('engine.modelNote', { model: modelConfig.model })
              : t('engine.demoNote') }}
            <router-link v-if="engineMode === 'demo'" to="/settings">{{ t('engine.openSettings') }} →</router-link>
          </p>

          <div v-if="session.error" class="note note--danger" style="line-height: 1.8">
            {{ t('engine.errors.' + session.error) }}
            <router-link to="/settings" style="margin-left: 4px">{{ t('engine.openSettings') }} →</router-link>
          </div>
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
          <div v-for="f in result.critique.findings || []" :key="f.id" class="gate__item">
            <span class="gate__mark" :class="f.hit ? 'gate__mark--yes' : 'gate__mark--no'">
              {{ f.hit ? '✓' : '·' }}
            </span>
            <div>
              <p style="margin: 0">
                <b>{{ criterionLabel(f.id) }}</b>
                <span v-if="f.hit" class="t-caption"> — {{ criterionEvidence(f) }}</span>
              </p>
              <p v-if="!f.hit" class="t-caption" style="margin-top: 2px">{{ criterionEvidence(f) }}</p>
            </div>
          </div>
        </div>

        <p v-if="result.critique.note" class="t-caption" style="margin-top: var(--space-3); line-height: 1.7">
          {{ t('common.notePrefix') }}{{ result.critique.note }}
        </p>

        <div v-if="structuralIssue" class="note note--warn" style="margin-top: var(--space-4)">
          {{ t('recast.structural.' + structuralIssue) }}
        </div>

        <div v-if="failed && !exhausted && !structuralIssue" class="note note--warn" style="margin-top: var(--space-4)">
          <b>{{ t('recast.failNoteBold') }}</b>
          {{ t('recast.failNoteTail') }}<b>{{ t('recast.failNoteTailBold') }}</b>{{ t('recast.failNoteTail2') }}
        </div>

        <div v-if="exhausted" class="note note--danger" style="margin-top: var(--space-4)">
          {{ t('recast.exhaustedNote') }}
        </div>
      </div>

      <!-- 上下文装配报告（真实模型路径）：与调试读同一份数据，可见即可核对 -->
      <details v-if="contextGroups.length" class="ctx card card--flat">
        <summary class="t-caption">{{ t('recast.contextTitle') }}</summary>
        <div v-for="g in contextGroups" :key="g.key" class="ctx__group">
          <p class="t-caption">
            <b>{{ t('recast.context.' + g.key) }}</b>
            · {{ t('recast.contextBudget', { used: g.report.used, budget: g.report.budget }) }}
          </p>
          <ul class="ctx__list">
            <li v-for="c in g.report.included" :key="c.id">
              <span class="t-mono">{{ c.id }}</span>
              · {{ t('recast.contextKind.' + c.kind) }}
              · {{ c.chars }}
            </li>
          </ul>
          <p v-if="g.report.dropped.length" class="t-caption">
            {{ t('recast.contextDropped', { n: g.report.dropped.length }) }}
          </p>
        </div>
        <p class="t-caption" style="margin-top: var(--space-2); line-height: 1.7">
          {{ t('recast.contextNote') }}
        </p>
      </details>

      <!-- C. 双轨输出 -->
      <div v-if="passed" class="recast-passed">
        <!-- 改写通过瞬间的像素动画：心→脑，只播一次 -->
        <PixelMorph />
      </div>

      <!-- 未通过质检时也展示当前改写：调试与对照都需要看到"这次到底改成了什么"，
           不再只在 passed 时可见（旧版本未通过时这里整块隐藏，只剩评审会示例的错觉）。 -->
      <div v-if="!passed && (result.distanced || result.warmth)" class="note note--quiet" style="line-height: 1.7">
        {{ t('recast.draftNote') }}
      </div>

      <div v-if="result.distanced || result.warmth" class="tracks">
        <div v-if="result.distanced" class="track track--cool">
          <p class="t-eyebrow">{{ t('recast.trackCool') }}</p>
          <p class="track__writing">{{ result.distanced }}</p>
        </div>
        <div v-if="result.warmth" class="track track--warm">
          <p class="t-eyebrow">{{ t('recast.trackWarm') }}</p>
          <p class="track__writing">{{ result.warmth }}</p>
          <p class="t-caption" style="margin-top: var(--space-3); color: var(--txj-accent-700); line-height: 1.7">
            {{ t('recast.warmthNote') }}
          </p>
        </div>
      </div>

      <p
        v-if="result.engine === 'demo' && (result.distanced || result.warmth)"
        class="t-caption"
        style="line-height: 1.7"
      >
        {{ t('recast.demoOutputNote') }}
      </p>

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
          <button class="btn btn-secondary" :disabled="session.busy" @click="retry">
            <Icon name="chevron-right" :size="16" class="btn-icon" />
            {{ session.busy ? t('recast.generating') : t('recast.retry') }}
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
      <ScienceNote v-if="passed" />
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

.ctx { margin-top: calc(var(--space-5) * -1 + var(--space-1)); }
.ctx summary { cursor: pointer; color: var(--muted-foreground); }
.ctx__group { margin-top: var(--space-3); }
.ctx__list {
  margin: var(--space-2) 0 0; padding-left: 18px;
  color: var(--muted-foreground); font-size: 12.5px; line-height: 1.9;
}

.recast-passed { margin: var(--space-2) 0 var(--space-1); }

.flags { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: var(--space-2); margin-top: var(--space-4); }
.flag {
  display: flex; flex-direction: column; gap: 2px; text-align: left; cursor: pointer;
  padding: var(--space-3); border: 1px solid var(--border-default);
  border-radius: var(--radius-md); background: var(--surface); transition: all .15s;
}
.flag:hover { border-color: var(--color-error); }
.flag.is-on { border-color: var(--color-error); background: var(--txj-error-50); }
</style>