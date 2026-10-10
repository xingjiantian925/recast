<script setup>
/**
 * QuickView — 快捷模式：把 Step 1 / 2 / 3 压缩到一屏
 *
 * 存在的理由是"完整流程太长、太慢"：老用户知道自己要做什么时，
 * 不应该被六个页面逐一拦截。但**压缩的是页面数，不是安全规则**：
 *  - 仍需已分诊（meta.need = triaged；危机分层由守卫转 /support）
 *  - 强度路由照旧：低强度（≤3）不走抽离，转重评归档（Lau & Tov 2023）
 *  - 视角仍是一次只用一种，默认「未来的自己」
 *  - 剂量上限照常计数（journal.countDose 在归档时触发，与此页无关）
 *
 * 与完整流程共享同一个 session 状态机：从快捷模式进去，
 * 后续 Step 4–9 与完整流程完全一致，随时可以切回 /write 补时长。
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '../components/Icon.vue'
import { BAND_INFO, TIER_INFO } from '../engine'
import { LENSES } from '../mock/fixtures'
import { session } from '../stores/session'
import { journalApi } from '../stores/journal'

const router = useRouter()
const { t } = useI18n()

const picked = ref(session.intensity)
const info = computed(() => (session.band ? BAND_INFO.value[session.band] : null))
const isLow = computed(() => session.band === 'low')
const showLens = computed(() => session.band === 'mid' || session.band === 'high')

const cap = computed(() => TIER_INFO.value[session.tier]?.doseCap ?? 3)
const atCap = computed(() => journalApi.usedThisWeek() >= cap.value)

function pick(v) {
  picked.value = v
  session.setIntensity(v)
}

function onInput() {
  session.startWriting()
}

function submit() {
  if (picked.value === null) return
  if (session.startedAt) session.setElapsed(Date.now() - session.startedAt)
  session.finishWriting()
  router.push(isLow.value ? '/archive' : '/recast')
}

/* 键盘党捷径：Cmd/Ctrl + Enter 等价于点提交按钮（未选强度时同样不触发） */
function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    submit()
  }
}
</script>

<template>
  <main class="page page--narrow">
    <header class="row row--between" style="align-items: flex-end; margin-bottom: var(--space-4)">
      <div>
        <span class="t-eyebrow quick__eyebrow">
          <Icon name="zap" :size="13" />{{ t('quick.eyebrow') }}
        </span>
        <h1 class="t-h2" style="margin-top: var(--space-2)">{{ t('quick.title') }}</h1>
      </div>
      <RouterLink to="/write" class="t-caption" style="white-space: nowrap">
        {{ t('quick.fullFlow') }} →
      </RouterLink>
    </header>

    <p class="t-body t-dim" style="line-height: 1.8; margin-bottom: var(--space-4)">
      {{ t('quick.lede') }}
    </p>

    <!-- ① 书写 -->
    <section class="card">
      <div class="row row--between" style="align-items: baseline">
        <p class="t-eyebrow"><span class="num">1</span>{{ t('quick.textLabel') }}</p>
        <span class="counter" :class="{ 'counter--warn': session.wordCount < 100 }">
          {{ t('quick.counter', { n: session.wordCount }) }}
        </span>
      </div>
      <div class="writing-paper writing-paper--quick" style="margin-top: var(--space-3)">
        <textarea
          v-model="session.text"
          class="writing"
          :placeholder="t('quick.textPlaceholder')"
          spellcheck="false"
          @input="onInput"
          @keydown="onKeydown"
        />
      </div>
    </section>

    <!-- ② 强度 -->
    <section class="card" style="margin-top: var(--space-4)">
      <p class="t-eyebrow"><span class="num">2</span>{{ t('quick.intensityLabel') }}</p>
      <div class="scale" style="margin-top: var(--space-3)">
        <button
          v-for="v in 11"
          :key="v"
          class="scale__dot"
          :class="{
            'is-on': picked === v - 1,
            'is-low': v - 1 <= 3,
            'is-mid': v - 1 >= 4 && v - 1 <= 6,
            'is-high': v - 1 >= 7,
          }"
          :aria-label="String(v - 1)"
          :aria-pressed="picked === v - 1"
          @click="pick(v - 1)"
        >
          {{ v - 1 }}
        </button>
      </div>
      <div class="scale__legend" style="margin-top: var(--space-2)">
        <span>{{ t('intensity.legendLow') }}</span>
        <span>{{ t('intensity.legendMid') }}</span>
        <span>{{ t('intensity.legendHigh') }}</span>
      </div>

      <Transition name="fade">
        <div v-if="info" class="row row--between quick__route" style="align-items: center">
          <span class="t-caption">{{ info.why }}</span>
          <span
            class="tag"
            :class="{
              'tag--info': session.band === 'low',
              'tag--primary': session.band === 'mid',
              'tag--error': session.band === 'high',
            }"
            >{{ info.label }}</span
          >
        </div>
      </Transition>

      <div v-if="isLow" class="note note--quiet" style="margin-top: var(--space-3)">
        <b>{{ t('intensity.lowTitle') }}</b>
        {{ t('intensity.lowBody') }}
      </div>
    </section>

    <!-- ③ 视角（低强度不走抽离，不出现） -->
    <Transition name="fade">
      <section v-if="showLens" class="card" style="margin-top: var(--space-4)">
        <p class="t-eyebrow"><span class="num">3</span>{{ t('quick.lensLabel') }}</p>
        <div class="chips" style="margin-top: var(--space-3)">
          <button
            v-for="l in LENSES"
            :key="l.id"
            type="button"
            class="chip"
            :class="{ 'is-on': session.lens === l.id }"
            :aria-pressed="session.lens === l.id"
            @click="session.chooseLens(l.id)"
          >
            <Icon v-if="session.lens === l.id" name="check" :size="13" />
            {{ l.name }}
          </button>
        </div>
        <p class="t-caption quick__lens-hint">{{ t('quick.lensRule') }}</p>
      </section>
    </Transition>

    <!-- 剂量提醒：只提示，不拦截（与首页口径一致） -->
    <div v-if="atCap" class="note note--warn" style="margin-top: var(--space-4)">
      {{ t('quick.atCap') }}
    </div>

    <button
      class="btn btn-primary btn-lg btn-block"
      style="margin-top: var(--space-5)"
      :disabled="picked === null"
      @click="submit"
    >
      <Icon name="send-horizontal" :size="18" />
      {{ picked === null ? t('quick.submitNeedIntensity') : isLow ? t('quick.submitLow') : t('quick.submit') }}
    </button>

    <p class="t-caption quick__dose-note">
      <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> {{ t('quick.kbdHint') }}
    </p>

    <p class="t-caption quick__dose-note">
      {{ t('quick.doseNote') }}
    </p>
  </main>
</template>

<style scoped>
.quick__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--txj-primary-500, var(--primary));
}

/* 步骤序号：与 eyebrow 文案组成 "① 发生了什么" 的轻量编号 */
.num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  margin-right: 7px;
  border-radius: 50%;
  background: var(--txj-primary-50, var(--muted));
  color: var(--txj-primary-500, var(--primary));
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1;
  vertical-align: 1px;
}

.writing-paper--quick .writing {
  min-height: 180px;
}

.counter { font-size: 12px; color: var(--txj-neutral-400); }
.counter--warn { color: var(--color-warning); }

.quick__route {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px dashed var(--border-subtle);
  gap: var(--space-3);
}
.quick__route .t-caption { line-height: 1.6; }

.chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px var(--space-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: 13.5px;
  color: var(--muted-foreground);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.chip:hover { border-color: var(--primary); color: var(--foreground); }
.chip.is-on {
  border-color: var(--primary);
  background: var(--txj-primary-50, var(--muted));
  color: var(--foreground);
  font-weight: 500;
}
.quick__lens-hint { margin-top: var(--space-3); line-height: 1.7; }

.quick__dose-note {
  margin-top: var(--space-3);
  text-align: center;
  line-height: 1.7;
  opacity: 0.8;
}
</style>
