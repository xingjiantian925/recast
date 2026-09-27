<script setup>
/**
 * LensView — Step 3 视角选择（四种全部上线，用户自选）
 *
 * 设计约束（Step 3）：
 *  1. **一次只用一种视角。** 四种同时出现在同一篇输出里会直接导致人称混乱与解离风险。
 *  2. 端内不做随机分配——用户自选属自选择偏倚，归因整体移交内嵌实验（§9.1）。
 *     这里只把选择行为按可分析结构记为观察性变量（见 journal.archive 的 provenance 字段）。
 *  3. 首次引导给默认值「未来的自己」：时间距离机制独立于社会距离，
 *     不依赖文化上是否可用的"旁观者智慧"。
 *  4. **文化校准**：所罗门悖论在中国样本中不成立（汪凤炎团队 2024：面对陌生人冲突反而最明智），
 *     因此"墙上苍蝇"这一称呼（中文带贬义）已改为"观察者视角"，且效果不作预设。
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StepRail from '../components/StepRail.vue'
import Icon from '../components/Icon.vue'
import { session } from '../stores/session'
import { journal } from '../stores/journal'
import { LENSES } from '../mock/fixtures'

const router = useRouter()
const { t } = useI18n()

const chosen = computed(() => session.lens)
const repeated = computed(() =>
  journal.entries.filter((e) => e.lens === chosen.value && e.kind === 'recast').length
)
const repeatedLabel = computed(() => t('lens.repeated', { n: repeated.value }))

function pick(id) {
  session.chooseLens(id)
}

function goNext() {
  router.push('/recast')
}
</script>

<template>
  <main class="page page--narrow">
    <StepRail :now="4" :total="6" :label="t('step.lens')" />

    <header style="margin-bottom: var(--space-5)">
      <h1 class="t-h2">{{ t('lens.title') }}</h1>
      <p class="t-body t-dim" style="margin-top: var(--space-2); line-height: 1.8">
        {{ t('lens.ledeLead') }}<b>{{ t('lens.ledeBold') }}</b>{{ t('lens.ledeTail') }}
      </p>
    </header>

    <div class="stack">
      <button
        v-for="l in LENSES"
        :key="l.id"
        class="lens"
        :class="{ 'is-on': chosen === l.id }"
        @click="pick(l.id)"
      >
        <div class="row row--between" style="align-items: flex-start">
          <div>
            <div class="row" style="gap: var(--space-2)">
              <span class="lens__name">{{ l.name }}</span>
              <span v-if="l.isDefault && !session.lensTouched" class="tag tag--accent">
                {{ t('lens.defaultTag') }}
              </span>
            </div>
            <p class="lens__meta">{{ l.meta }}</p>
          </div>
          <span v-if="chosen === l.id" class="tick">
            <Icon name="check" :size="14" />
          </span>
        </div>

        <p class="lens__desc">{{ l.desc }}</p>
        <p class="lens__sample">{{ l.sample }}</p>
        <p v-if="l.risk" class="lens__risk">{{ t('lens.riskPrefix') }}{{ l.risk }}</p>
      </button>
    </div>

    <div v-if="session.lensTouched && repeated > 0" class="note note--quiet" style="margin-top: var(--space-4)">
      {{ repeatedLabel }}
    </div>

    <p class="t-caption" style="margin-top: var(--space-4); line-height: 1.8">
      {{ t('lens.disclaimer') }}
    </p>

    <div class="row row--end" style="margin-top: var(--space-5)">
      <button class="btn btn-primary" @click="goNext">
        {{ t('lens.cta') }}
        <Icon name="arrow-right" :size="16" class="btn-icon" />
      </button>
    </div>
  </main>
</template>

<style scoped>
.tick {
  width: 22px; height: 22px; border-radius: 50%; background: var(--primary); color: var(--primary-foreground);
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.lens__sample { font-style: normal; }
</style>