<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from './components/Icon.vue'
import { session } from './stores/session'
import { LOCALES, setLocale } from './i18n'

const route = useRoute()
const { t, locale } = useI18n()

// 只放路由与文案 key；标签随语言切换
const nav = [
  { to: '/', key: 'home' },
  { to: '/narrative', key: 'narrative' },
  { to: '/checkin', key: 'checkin' },
  { to: '/safety', key: 'safety' },
]

const langLabel = (code) => (code === 'zh' ? t('app.langZh') : t('app.langEn'))
const langOn = (code) => locale.value === code
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <RouterLink to="/" class="logo" style="text-decoration: none">
        RECAST <em>{{ t('app.brandSuffix') }}</em>
      </RouterLink>
      <nav class="nav-items">
        <RouterLink
          v-for="n in nav"
          :key="n.to"
          :to="n.to"
          class="nav-item"
          :class="{ active: route.path === n.to }"
        >
          {{ t('app.nav.' + n.key) }}
        </RouterLink>
      </nav>
      <span class="spacer" />

      <!-- 语言是用户显式选择：默认 en，不按浏览器语言自动检测；选择落在 localStorage -->
      <div class="lang" role="group" :aria-label="t('app.langLabel')">
        <button
          v-for="code in LOCALES"
          :key="code"
          type="button"
          class="lang__btn"
          :class="{ 'is-on': langOn(code) }"
          :aria-pressed="langOn(code)"
          @click="setLocale(code)"
        >
          {{ langLabel(code) }}
        </button>
      </div>

      <RouterLink
        v-if="session.tier && session.tier !== 'crisis'"
        to="/support"
        class="nav-item"
        style="height: 36px; color: var(--color-warning)"
        :title="t('app.nav.support')"
      >
        <Icon name="circle-alert" :size="16" />
      </RouterLink>
    </header>

    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <footer class="foot">
      <div class="page" style="padding-top: 0; padding-bottom: var(--space-5); flex: none">
        <hr class="hr" style="margin-bottom: var(--space-4)" />
        <p class="disclaimer">{{ t('app.footer.disclaimer') }}</p>
        <p class="disclaimer" style="margin-top: var(--space-2)">{{ t('app.footer.crisis') }}</p>
        <p class="disclaimer" style="margin-top: var(--space-2)">{{ t('app.footer.localFirst') }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.foot { margin-top: auto; }

.lang {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
}
.lang__btn {
  border: 0;
  background: transparent;
  color: var(--muted-foreground);
  font-size: var(--font-size-caption);
  line-height: 1;
  padding: 5px var(--space-2);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background .15s, color .15s;
}
.lang__btn:hover { background: var(--muted); color: var(--foreground); }
.lang__btn.is-on { background: var(--primary); color: var(--primary-foreground); font-weight: 500; }
</style>