import { createRouter, createWebHashHistory } from 'vue-router'
import { session } from './stores/session'

/**
 * 路由即流程：每一段 URL 对应产品设计纲要 §3 的一个 Step。
 * 用 hash 模式，方便日后直接以 file:// 塞进 Tauri webview。
 *
 * 守卫规则（不是 UI 装饰，是流程正确性）：
 *  - 未分诊 → 只能进 /intake
 *  - 低强度（≤3）→ 不走 Step 4 抽离改写，直接去归档走重评路径
 *  - 需稳定化 / 危机 → 只能进 /support
 */
const routes = [
  { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
  { path: '/intake', name: 'intake', component: () => import('./views/IntakeView.vue'), meta: { step: 'Step 0' } },
  { path: '/write', name: 'write', component: () => import('./views/WriteView.vue'), meta: { step: 'Step 1', need: 'triaged' } },
  { path: '/intensity', name: 'intensity', component: () => import('./views/IntensityView.vue'), meta: { step: 'Step 2', need: 'written' } },
  { path: '/lens', name: 'lens', component: () => import('./views/LensView.vue'), meta: { step: 'Step 3', need: 'routed' } },
  { path: '/recast', name: 'recast', component: () => import('./views/RecastView.vue'), meta: { step: 'Step 4–6', need: 'lensed' } },
  { path: '/archive', name: 'archive', component: () => import('./views/ArchiveView.vue'), meta: { step: 'Step 9', need: 'routed' } },
  { path: '/support', name: 'support', component: () => import('./views/SupportView.vue'), meta: { step: 'Step 7 · 10' } },
  { path: '/narrative', name: 'narrative', component: () => import('./views/NarrativeView.vue') },
  { path: '/checkin', name: 'checkin', component: () => import('./views/CheckinView.vue'), meta: { step: 'Step 10' } },
  { path: '/safety', name: 'safety', component: () => import('./views/SafetyView.vue'), meta: { step: 'Step 10' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const need = to.meta?.need
  if (!need) return true
  if (session.canEnter(need)) return true
  return { name: session.entryRoute() }
})