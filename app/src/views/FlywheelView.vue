<script setup>
/**
 * FlywheelView — 本地数据飞轮的可见面板（不是"后台遥测"）
 *
 * 只做四件事：开关、看统计、导出、删除。数据始终在本机 localStorage，
 * 不发起任何网络请求；导出是用户主动点的一次性下载。
 *
 * 训练数据口径见 stores/flywheel.js：
 *  - SFT    = 真实模型 + 通过质检 + 用户归档
 *  - 偏好对 = 同一原文下相邻的「后一次通过 vs 前一次被拦」
 * demo 模式的稿件会被记录（便于观察流程），但永远不会进入 SFT / 偏好对导出。
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../components/Icon.vue'
import { LENSES } from '../mock/fixtures'
import {
  flywheel,
  flywheelStats,
  setEnabled,
  setRedact,
  clearAll,
  exportSft,
  exportPreferences,
  exportRaw,
} from '../stores/flywheel'

const { t, tm } = useI18n()

const stats = computed(() => flywheelStats.value)
const criteria = computed(() => tm('criteria'))
const privacyPoints = computed(() => tm('flywheel.privacy'))
const lensName = (id) => LENSES.value.find((l) => l.id === id)?.name || id
const lastAtLabel = computed(() =>
  stats.value.lastAt ? new Date(stats.value.lastAt).toLocaleString() : '—',
)

const exported = ref('')
const confirming = ref(false)
const cleared = ref(false)

function runExport(kind) {
  const ok =
    kind === 'sft' ? exportSft() : kind === 'pairs' ? exportPreferences() : exportRaw()
  if (!ok) return
  exported.value = kind
  setTimeout(() => (exported.value = ''), 2600)
}

function wipe() {
  clearAll()
  confirming.value = false
  cleared.value = true
  setTimeout(() => (cleared.value = false), 2600)
}
</script>

<template>
  <main class="page page--narrow">
    <header style="margin-bottom: var(--space-5)">
      <span class="t-eyebrow">{{ t('flywheel.eyebrow') }}</span>
      <h1 class="t-h2" style="margin-top: var(--space-2)">{{ t('flywheel.title') }}</h1>
      <p class="t-body t-dim" style="margin-top: var(--space-2); line-height: 1.8">
        {{ t('flywheel.lede') }}
      </p>
    </header>

    <!-- 开关 -->
    <section class="card">
      <div class="card-head">
        <div>
          <h2 class="t-h4">{{ t('flywheel.toggleTitle') }}</h2>
          <p class="t-caption" style="margin-top: var(--space-2); line-height: 1.75">
            {{ t('flywheel.toggleNote') }}
          </p>
        </div>
        <span class="tag" :class="flywheel.enabled ? 'tag--success' : 'tag--neutral'">
          <span class="dot" />{{ flywheel.enabled ? t('flywheel.stateOn') : t('flywheel.stateOff') }}
        </span>
      </div>
      <label class="row" style="margin-top: var(--space-4); cursor: pointer; gap: var(--space-2)">
        <input
          type="checkbox"
          :checked="flywheel.enabled"
          @change="setEnabled($event.target.checked)"
        />
        <span>{{ t('flywheel.toggleLabel') }}</span>
      </label>
    </section>

    <!-- 统计 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('flywheel.statsEyebrow') }}</span>
      <div class="stats" style="margin-top: var(--space-3)">
        <div class="stat">
          <span class="stat__num t-mono">{{ stats.total }}</span>
          <span class="t-caption">{{ t('flywheel.statTotal') }}</span>
        </div>
        <div class="stat">
          <span class="stat__num t-mono">{{ stats.sftCount }}</span>
          <span class="t-caption">{{ t('flywheel.statSft') }}</span>
        </div>
        <div class="stat">
          <span class="stat__num t-mono">{{ stats.pairCount }}</span>
          <span class="t-caption">{{ t('flywheel.statPairs') }}</span>
        </div>
        <div class="stat">
          <span class="stat__num t-mono">{{ stats.passed }}</span>
          <span class="t-caption">{{ t('flywheel.statPassed') }}</span>
        </div>
      </div>

      <div v-if="stats.total" class="meta-grid" style="margin-top: var(--space-4)">
        <div>
          <p class="t-caption">{{ t('flywheel.byLang') }}</p>
          <p class="t-body">
            <b>中文</b> {{ stats.byLang.zh }} · <b>English</b> {{ stats.byLang.en }}
          </p>
        </div>
        <div>
          <p class="t-caption">{{ t('flywheel.byLens') }}</p>
          <p class="t-body">
            <span v-for="(n, id) in stats.byLens" :key="id" class="lens-count">
              {{ lensName(id) }} {{ n }}
            </span>
          </p>
        </div>
        <div>
          <p class="t-caption">{{ t('flywheel.byCriterion') }}</p>
          <p class="t-body">
            <span v-for="c in criteria" :key="c.id" class="lens-count">
              {{ c.label }} {{ stats.criteria[c.id] || 0 }}
            </span>
          </p>
        </div>
        <div>
          <p class="t-caption">{{ t('flywheel.lastAt') }}</p>
          <p class="t-body">{{ lastAtLabel }}</p>
        </div>
      </div>

      <p v-else class="note note--quiet" style="margin-top: var(--space-4); line-height: 1.7">
        {{ t('flywheel.empty') }}
      </p>

      <p v-if="stats.total" class="t-caption" style="margin-top: var(--space-3); line-height: 1.7">
        {{ t('flywheel.pendingNote', { n: stats.pending }) }}
      </p>
      <p class="t-caption" style="margin-top: var(--space-2); line-height: 1.7">
        {{ t('flywheel.demoNote') }}
      </p>
    </section>

    <!-- 导出 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('flywheel.exportEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('flywheel.exportTitle') }}</h2>
      <p class="t-caption" style="margin-top: var(--space-3); line-height: 1.75">
        {{ t('flywheel.exportNote') }}
      </p>

      <label class="row" style="margin-top: var(--space-3); cursor: pointer; gap: var(--space-2)">
        <input
          type="checkbox"
          :checked="flywheel.redactOnExport"
          @change="setRedact($event.target.checked)"
        />
        <span>{{ t('flywheel.redact') }}</span>
      </label>

      <div class="row row--wrap" style="margin-top: var(--space-4)">
        <button class="btn btn-secondary btn-sm" :disabled="!stats.sftCount" @click="runExport('sft')">
          <Icon name="folder" :size="14" class="btn-icon" />
          {{ t('flywheel.exportSft') }}
        </button>
        <button class="btn btn-secondary btn-sm" :disabled="!stats.pairCount" @click="runExport('pairs')">
          <Icon name="box" :size="14" class="btn-icon" />
          {{ t('flywheel.exportPairs') }}
        </button>
        <button class="btn btn-tertiary btn-sm" :disabled="!stats.total" @click="runExport('raw')">
          <Icon name="file" :size="14" class="btn-icon" />
          {{ t('flywheel.exportRaw') }}
        </button>
        <span v-if="exported" class="tag tag--success">
          <span class="dot" />{{ t('flywheel.exported', { kind: t('flywheel.kind.' + exported) }) }}
        </span>
      </div>
      <p v-if="!stats.total" class="t-caption" style="margin-top: var(--space-2)">
        {{ t('flywheel.noData') }}
      </p>
    </section>

    <!-- 边界 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('flywheel.privacyEyebrow') }}</span>
      <ul class="privacy" style="margin-top: var(--space-3)">
        <li v-for="p in privacyPoints" :key="p.title" class="privacy__item">
          <Icon name="circle-check" :size="16" class="privacy__icon" />
          <div>
            <p class="privacy__title">{{ p.title }}</p>
            <p class="t-caption privacy__body">{{ p.body }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- 删除 -->
    <section class="card" style="margin-top: var(--space-4)">
      <div class="row row--wrap">
        <template v-if="!confirming">
          <button class="btn btn-danger btn-sm" :disabled="!stats.total" @click="confirming = true">
            <Icon name="trash-2" :size="14" class="btn-icon" />
            {{ t('flywheel.clear') }}
          </button>
          <span v-if="cleared" class="tag tag--success">
            <span class="dot" />{{ t('flywheel.cleared') }}
          </span>
        </template>
        <template v-else>
          <span class="t-caption">{{ t('flywheel.clearConfirm') }}</span>
          <button class="btn btn-danger btn-sm" @click="wipe">{{ t('flywheel.clearYes') }}</button>
          <button class="btn btn-tertiary btn-sm" @click="confirming = false">
            {{ t('flywheel.clearNo') }}
          </button>
        </template>
      </div>
    </section>
  </main>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-3); }
.stat {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface);
}
.stat__num { display: block; font-size: 22px; color: var(--foreground); }
.meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-3); }
.lens-count { display: inline-block; margin-right: var(--space-3); white-space: nowrap; font-size: 13px; color: var(--muted-foreground); }
.privacy { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-3); }
.privacy__item { display: flex; gap: var(--space-3); align-items: flex-start; }
.privacy__icon { color: var(--color-success, var(--primary)); margin-top: 2px; }
.privacy__title { margin: 0; font-weight: 600; font-size: 14px; color: var(--foreground); }
.privacy__body { margin: 4px 0 0; line-height: 1.75; }
</style>
