<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from './components/Icon.vue'
import { session } from './stores/session'
import { prefs, setTheme } from './stores/prefs'
import { LOCALES, setLocale } from './i18n'
import { modelStatus } from './model/config'

const route = useRoute()
const { t, locale } = useI18n()

// 只放路由与文案 key；标签随语言切换
const nav = [
  { to: '/', key: 'home' },
  { to: '/narrative', key: 'narrative' },
  { to: '/checkin', key: 'checkin' },
  { to: '/safety', key: 'safety' },
  { to: '/settings', key: 'settings' },
]

const THEMES = ['light', 'dark']

const langLabel = (code) => (code === 'zh' ? t('app.langZh') : t('app.langEn'))
const langOn = (code) => locale.value === code
const themeLabel = (code) => t(code === 'dark' ? 'app.themeDark' : 'app.themeLight')
const themeOn = (code) => prefs.theme === code

// 大模型配置状态：未配置（演示模式）/ 已配置 / 本次会话测通
const statusTag = computed(() => {
  const s = modelStatus.value
  if (s === 'verified') return { cls: 'tag--success', text: t('app.modelStatus.verified') }
  if (s === 'configured') return { cls: 'tag--info', text: t('app.modelStatus.configured') }
  return { cls: 'tag--neutral', text: t('app.modelStatus.unconfigured') }
})
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

      <!-- 大模型配置状态：点击前往设置；未配置即演示模式 -->
      <RouterLink
        to="/settings"
        class="tag model-status"
        :class="statusTag.cls"
        :title="t('app.modelStatus.title')"
        :aria-label="t('app.modelStatus.title')"
      >
        <span class="dot" /><span class="model-status__text">{{ statusTag.text }}</span>
      </RouterLink>

      <!-- 语言是用户显式选择：默认 en，不按浏览器语言自动检测；选择落在 localStorage -->
      <div class="pill" role="group" :aria-label="t('app.langLabel')">
        <button
          v-for="code in LOCALES"
          :key="code"
          type="button"
          class="pill__btn"
          :class="{ 'is-on': langOn(code) }"
          :aria-pressed="langOn(code)"
          @click="setLocale(code)"
        >
          {{ langLabel(code) }}
        </button>
      </div>

      <!-- 主题：浅色 / 深色，挂在 <html> 的 .dark 类上（tokens.css 已备令牌组） -->
      <div class="pill" role="group" :aria-label="t('app.themeLabel')">
        <button
          v-for="code in THEMES"
          :key="code"
          type="button"
          class="pill__btn"
          :class="{ 'is-on': themeOn(code) }"
          :aria-pressed="themeOn(code)"
          @click="setTheme(code)"
        >
          {{ themeLabel(code) }}
        </button>
      </div>

      <a
        class="gh"
        href="https://github.com/xingjiantian925/recast"
        target="_blank"
        rel="noopener"
        :aria-label="t('app.nav.github')"
        :title="t('app.nav.github')"
      >
        <Icon name="github" :size="18" />
      </a>

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
        <p class="disclaimer foot-src" style="margin-top: var(--space-3)">
          <a
            class="foot-link"
            href="https://github.com/xingjiantian925/recast"
            target="_blank"
            rel="noopener"
          >
            <Icon name="github" :size="14" />{{ t('app.nav.github') }}
          </a>
          <span>· {{ t('app.footer.source') }}</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.foot { margin-top: auto; }

/* GitHub 标志：顶栏图标按钮，颜色随主题，hover 抬亮 */
.gh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--muted-foreground);
  transition: background .15s, color .15s;
}
.gh:hover { background: var(--muted); color: var(--foreground); text-decoration: none; }

.foot-src { display: flex; align-items: center; gap: var(--space-1); flex-wrap: wrap; }
.foot-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted-foreground);
  transition: color .15s;
}
.foot-link:hover { color: var(--foreground); }

/* 通用分段 pill：语言与主题共用（顶栏右侧） */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
}
.pill__btn {
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
.pill__btn:hover { background: var(--muted); color: var(--foreground); }
.pill__btn.is-on { background: var(--primary); color: var(--primary-foreground); font-weight: 500; }

/* 大模型配置状态：复用 .tag 配色，点击直达设置；窄屏只留圆点 */
.model-status {
  text-decoration: none;
  white-space: nowrap;
  transition: filter .15s;
}
.model-status:hover { filter: brightness(.95); }
@media (max-width: 720px) {
  .model-status__text { display: none; }
}
</style>