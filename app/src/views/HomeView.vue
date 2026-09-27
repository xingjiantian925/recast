<script setup>
/**
 * HomeView — 事件触发入口
 *
 * 这一页是"出路 A：事件触发式"最直接的体现，也是与打卡类产品最明显的分界：
 *  - 没有"今天还没写"的提示，没有连续天数，没有日历上的空位。
 *  - 入口由**用户自己判断有没有情绪事件**来驱动，而不是被系统追问。
 *  - 无事件时的默认路径是元认知短内容 + 状态自评，**不推"你该写了"**。
 * 依据：§2.2 出路 A、§2.3 约束 3、Giovanetti 2019 的伤害条件（每日反复 2 周）。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '../components/Icon.vue'
import MetaNote from '../components/MetaNote.vue'
import { session } from '../stores/session'
import { journal, journalApi } from '../stores/journal'
import { TIER_INFO } from '../engine'
import { LENSES, HOME_TRIGGERS } from '../mock/fixtures'
import heroArt from '../assets/hero-home.svg'

const router = useRouter()
const { t, tm } = useI18n()

/**
 * Hero 里的"我 → 他 / 她"顿悟动画。
 * 代词在 en 是 he / she、zh 是 他 / 她，作为纯数组经 tm() 取；两个以上时循环切换。
 * 尊重 prefers-reduced-motion：不动时只停在第一个词。
 */
const pronouns = computed(() => {
  const list = tm('home.heroPronouns')
  return Array.isArray(list) ? list.map((w) => String(w)) : []
})
const pronounIdx = ref(0)
const pronounWord = computed(() => pronouns.value[pronounIdx.value] || '')
let pronounTimer = null

onMounted(() => {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (pronouns.value.length < 2) return
  pronounTimer = setInterval(() => {
    pronounIdx.value = (pronounIdx.value + 1) % pronouns.value.length
  }, 3400)
})

onBeforeUnmount(() => {
  if (pronounTimer) clearInterval(pronounTimer)
  pronounTimer = null
})

// TIER_INFO 是 computed（数字在 engine.js，文案在 locales），script 里必须 .value
// 一律用可选链兜底：持久化或异常状态下的未知 tier 不能让整页渲染失败
const cap = computed(() => TIER_INFO.value[session.tier]?.doseCap ?? 3)
const used = computed(() => journalApi.usedThisWeek())
const atCap = computed(() => used.value >= cap.value)

const recent = computed(() => journal.entries.slice(0, 3))
// 有"进行中的会话"= 用户已确认走完 Step 1（writtenAt），或旧草稿里已有正文。
// 不再以字数 ≥ 20 作为判定：Step 1 已允许空稿继续。
const hasOpenSession = computed(() => Boolean(session.writtenAt) || session.wordCount >= 20)

const tierLabel = computed(() => TIER_INFO.value[session.tier]?.label || '')
const doseUnitLabel = computed(() => t('home.doseUnit', { cap: cap.value }))

const ctaLabel = computed(() => {
  if (session.tier === 'crisis') return null
  if (hasOpenSession.value) return t('home.ctaContinue')
  if (!session.tier) return t('home.ctaStart')
  return t('home.ctaRecord')
})

function start() {
  if (session.tier === 'crisis') return
  if (hasOpenSession.value) return router.push(session.entryRoute())
  if (!session.tier) return router.push('/intake')
  router.push('/write')
}

const checkinInfo = computed(() => (session.tier ? journalApi.checkinDue(session.tier) : null))
const checkinDueLabel = computed(() =>
  checkinInfo.value?.due ? t('home.checkinDue', { week: checkinInfo.value.week }) : ''
)
const checkinWeeksLabel = computed(() =>
  (TIER_INFO.value[session.tier]?.checkinWeeks ?? []).join(t('common.listSep'))
)
const checkinMustWeek2 = computed(() => Boolean(TIER_INFO.value[session.tier]?.mustCheckWeek2))

/** 归档条目里存的是视角 id，展示时要按当前语言取名字 */
const lensName = (id) => LENSES.value.find((l) => l.id === id)?.name || id
</script>

<template>
  <main class="page">
    <!-- 危机路径：不做主 CTA，不推流程 -->
    <section v-if="session.tier === 'crisis'" class="stack">
      <div class="note note--danger">
        <b>{{ t('home.crisisTitle') }}</b>
        {{ t('home.crisisBody') }}
        <RouterLink to="/support" style="margin-left: 6px">{{ t('home.crisisLink') }}</RouterLink>
      </div>
    </section>

    <template v-else>
      <!-- 主入口 -->
      <section class="hero">
        <div class="hero__grid">
          <div class="hero__text">
            <!-- "我 → 他 / 她"：把自我抽离的核心动作做成一句可读的顿悟 -->
            <div class="swap" aria-hidden="true">
              <span class="said">{{ t('home.heroSwapFrom') }}</span>
              <span class="arrow" />
              <span class="swap__say">
                <Transition name="pronoun" mode="out-in">
                  <span :key="pronounWord" class="say">{{ pronounWord }}</span>
                </Transition>
              </span>
            </div>

            <p class="t-eyebrow">{{ t('home.eyebrow') }}</p>
            <h1 class="t-h1 hero__title">
              {{ t('home.titleLine1') }}<br />
              {{ t('home.titleLine2') }}
            </h1>
            <p class="t-lead hero__lede">{{ t('home.lede') }}</p>
            <div class="row row--wrap hero__cta">
              <button class="btn btn-primary btn-lg" @click="start">
                <Icon name="pen-line" :size="18" />
                {{ ctaLabel }}
              </button>
              <RouterLink to="/narrative" class="btn btn-secondary btn-lg" style="text-decoration: none">
                {{ t('home.viewNarrative') }}
              </RouterLink>
            </div>
          </div>

          <div class="hero__art">
            <img :src="heroArt" width="560" height="640" :alt="t('home.heroArtAlt')" />
          </div>
        </div>

        <!-- 事件触发的判据：暴露给用户，由用户自己判断（禁止后台静默触发） -->
        <div class="triggers">
          <p class="t-caption" style="margin-bottom: var(--space-2)">
            {{ t('home.triggersLead') }}
          </p>
          <ul class="triggers__list">
            <li v-for="(tr, i) in HOME_TRIGGERS" :key="i">{{ tr }}</li>
          </ul>
          <p class="t-caption" style="margin-top: var(--space-2)">
            {{ t('home.triggersTail') }}
          </p>
        </div>
      </section>

      <!-- 剂量状态 -->
      <section class="stack--lg" style="margin-top: var(--space-6)">
        <div class="grid-2">
          <div class="card">
            <div class="card-head">
              <h2 class="card-title">{{ t('home.doseTitle') }}</h2>
              <span v-if="session.tier" class="tag tag--neutral">{{ tierLabel }}</span>
              <RouterLink v-else to="/intake" class="tag tag--warning" style="text-decoration: none">
                {{ t('home.doseUntriaged') }}
              </RouterLink>
            </div>

            <div style="margin-top: var(--space-4)">
              <div class="dose">
                <span class="dose__n">{{ used }}</span>
                <span class="dose__max">{{ doseUnitLabel }}</span>
              </div>
              <div class="dose__ticks">
                <span
                  v-for="i in cap"
                  :key="i"
                  class="dose__tick"
                  :class="{ 'is-used': i <= used, 'is-over': used > cap && i <= used - cap }"
                />
              </div>
            </div>

            <p class="t-caption" style="margin-top: var(--space-3); line-height: 1.7">
              {{ t('home.doseNote') }}
            </p>
            <p v-if="atCap" class="t-caption" style="margin-top: var(--space-2); color: var(--color-warning)">
              {{ t('home.doseAtCap') }}
            </p>
          </div>

          <div class="card">
            <div class="card-head">
              <h2 class="card-title">{{ t('home.checkinTitle') }}</h2>
              <span v-if="checkinInfo?.due" class="tag tag--warning">
                <span class="dot" />{{ checkinDueLabel }}
              </span>
              <span v-else class="tag tag--success">{{ t('home.checkinNone') }}</span>
            </div>
            <p class="t-caption" style="margin-top: var(--space-3); line-height: 1.75">
              {{ t('home.checkinNoteLead') }}<b>{{ t('home.checkinNoteBold') }}</b>{{ t('home.checkinNoteTail') }}
            </p>
            <ul v-if="session.tier" class="t-caption" style="margin: var(--space-3) 0 0; padding-left: 18px; line-height: 1.9">
              <li>{{ t('home.checkinWeeks', { weeks: checkinWeeksLabel }) }}</li>
              <li v-if="checkinMustWeek2">{{ t('home.checkinMustWeek2') }}</li>
              <li>{{ t('home.checkinScaleNote') }}</li>
            </ul>
            <RouterLink
              to="/checkin"
              class="btn btn-secondary btn-sm"
              style="margin-top: var(--space-4); text-decoration: none"
            >
              {{ t('home.checkinEnter') }}
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- 叙事线预览 -->
      <section style="margin-top: var(--space-6)">
        <div class="row row--between" style="margin-bottom: var(--space-3)">
          <h2 class="t-h3">{{ t('home.recentTitle') }}</h2>
          <RouterLink to="/narrative" class="t-caption">{{ t('home.recentAll') }}</RouterLink>
        </div>

        <div v-if="recent.length === 0" class="card card--quiet">
          <p class="t-body t-dim" style="margin: 0">
            {{ t('home.recentEmpty') }}
          </p>
        </div>

        <div v-else class="stack--sm" style="display: flex; flex-direction: column; gap: var(--space-3)">
          <RouterLink
            v-for="e in recent"
            :key="e.id"
            to="/narrative"
            class="entry"
          >
            <div class="row row--between">
              <span class="t-mono t-dim" style="font-size: 12px">{{ e.at.slice(0, 10) }}</span>
              <div class="row" style="gap: var(--space-1)">
                <span class="tag tag--primary">{{ lensName(e.lens) }}</span>
                <span v-if="e.themes.agency === 'rising'" class="tag tag--success">
                  {{ t('themes.agency.rising') }}
                </span>
              </div>
            </div>
            <p class="entry__excerpt">{{ e.excerpt }}…</p>
          </RouterLink>
        </div>
      </section>

      <!-- 无事件时的路径：不推"你该写了" -->
      <section style="margin-top: var(--space-7)">
        <p class="t-eyebrow" style="margin-bottom: var(--space-3)">{{ t('home.noEventEyebrow') }}</p>
        <MetaNote :index="0" :dismissible="false" />
        <p class="t-caption" style="margin-top: var(--space-3); line-height: 1.75">
          {{ t('home.noEventNote') }}
        </p>
      </section>
    </template>
  </main>
</template>

<style scoped>
.hero { padding: var(--space-6) 0 var(--space-4); }
.hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(24px, 4vw, 56px);
  align-items: center;
}
.hero__title { margin-top: var(--space-3); }
.hero__lede { margin-top: var(--space-4); max-width: 560px; }
.hero__cta { margin-top: var(--space-5); }
.hero__art { min-width: 0; }
.hero__art img { display: block; width: 100%; height: auto; }

/* "我 / I → 他 / 她"：划掉旧自称 + 代词循环，把自我抽离做成可读的顿悟 */
.swap {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  font-family: var(--font-heading);
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 600;
  margin-bottom: var(--space-5);
}
.said { position: relative; color: var(--txj-neutral-400); }
.said::after {
  content: "";
  position: absolute;
  left: -14%;
  top: 52%;
  width: 128%;
  height: 2px;
  background: currentColor;
  opacity: 0.75;
  transform: rotate(-16deg) scaleX(0);
  transform-origin: left center;
  animation: strike 1s cubic-bezier(0.7, 0, 0.2, 1) 0.5s forwards;
}
@keyframes strike { to { transform: rotate(-16deg) scaleX(1); } }

.arrow {
  width: 46px;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--color-accent));
  position: relative;
  opacity: 0;
  animation: fade 0.7s ease 1.25s both;
}
.arrow::after {
  content: "";
  position: absolute;
  right: -1px;
  top: -4px;
  width: 9px;
  height: 9px;
  border-top: 2px solid var(--color-accent);
  border-right: 2px solid var(--color-accent);
  transform: rotate(45deg);
}
@keyframes fade { to { opacity: 1; } }

.swap__say {
  display: inline-flex;
  opacity: 0;
  animation: fade 0.7s ease 1.4s both;
}
.say {
  background: linear-gradient(90deg, var(--primary), var(--color-accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.pronoun-enter-active,
.pronoun-leave-active { transition: opacity 0.32s ease; }
.pronoun-enter-from,
.pronoun-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .said::after { animation: none; transform: rotate(-16deg) scaleX(1); }
  .arrow { animation: none; opacity: 1; }
  .swap__say { animation: none; opacity: 1; }
  .pronoun-enter-active,
  .pronoun-leave-active { transition: none; }
}

@media (max-width: 860px) {
  .hero__grid { grid-template-columns: 1fr; gap: var(--space-6); }
  .hero__art { width: 100%; max-width: 430px; margin: 0 auto; }
}

.triggers {
  margin-top: var(--space-6);
  padding: var(--space-4);
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--card);
}
.triggers__list {
  margin: 0;
  padding-left: 18px;
  color: var(--muted-foreground);
  font-size: 14.5px;
  line-height: 2;
}

.entry {
  display: block;
  padding: var(--space-4);
  background: var(--card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
  text-decoration: none;
  transition: border-color .15s, box-shadow .15s;
}
.entry:hover { border-color: var(--txj-primary-300); box-shadow: var(--shadow-2); text-decoration: none; }
.entry__excerpt {
  margin-top: var(--space-2);
  color: var(--muted-foreground);
  font-size: 14.5px;
  line-height: 1.75;
}
</style>