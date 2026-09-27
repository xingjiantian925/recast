<script setup>
/**
 * IntensityView — Step 2 强度估计与路由
 *
 * 这是全流程的核心分叉，也是最容易被偷懒毁掉的一步。
 * 反模式是"一刀切地抽离"：低强度时抽离会抽掉意义（Lau & Tov 2023）。
 * 因此低强度分支在界面上**明确不走 Step 3/4**，而是转向重评与直接归档。
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StepRail from '../components/StepRail.vue'
import Icon from '../components/Icon.vue'
import { BAND_INFO } from '../engine'
import { session } from '../stores/session'

const router = useRouter()
const { t } = useI18n()
const picked = ref(session.intensity)

// BAND_INFO 是 computed（文案随语言切换）
const info = computed(() => (session.band ? BAND_INFO.value[session.band] : null))

function pick(v) {
  picked.value = v
  session.setIntensity(v)
}

function goNext() {
  router.push(session.band === 'low' ? '/archive' : '/lens')
}
</script>

<template>
  <main class="page page--narrow">
    <StepRail :now="3" :total="6" :label="t('step.intensity')" />

    <header style="margin-bottom: var(--space-5)">
      <h1 class="t-h2">{{ t('intensity.title') }}</h1>
      <p class="t-body t-dim" style="margin-top: var(--space-2); line-height: 1.8">
        {{ t('intensity.lede') }}
        <br />
        <span class="t-caption">{{ t('intensity.hint') }}</span>
      </p>
    </header>

    <div class="card">
      <div class="scale">
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
        <div v-if="info" class="route">
          <hr class="hr" />
          <div class="row row--between" style="align-items: flex-start">
            <div>
              <p class="t-eyebrow">{{ t('intensity.routeEyebrow') }}</p>
              <h2 class="t-h4" style="margin-top: var(--space-1)">{{ info.method }}</h2>
            </div>
            <span class="tag" :class="{
              'tag--info': session.band === 'low',
              'tag--primary': session.band === 'mid',
              'tag--error': session.band === 'high',
            }">{{ info.label }}</span>
          </div>
          <p class="t-body t-dim" style="margin-top: var(--space-3); line-height: 1.8">{{ info.why }}</p>

          <div v-if="session.band === 'low'" class="note note--quiet" style="margin-top: var(--space-4)">
            <b>{{ t('intensity.lowTitle') }}</b>
            {{ t('intensity.lowBody') }}
          </div>
        </div>
      </Transition>
    </div>

    <div class="row row--end" style="margin-top: var(--space-5)">
      <button class="btn btn-primary" :disabled="picked === null" @click="goNext">
        {{ session.band === 'low' ? t('intensity.goArchive') : t('intensity.goLens') }}
        <Icon name="arrow-right" :size="16" class="btn-icon" />
      </button>
    </div>
  </main>
</template>

<style scoped>
.route { margin-top: var(--space-4); }
</style>