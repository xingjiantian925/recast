/**
 * fixtures.js — 桩数据（语言感知层）
 *
 * 本文件所有内容均为**演示用桩数据**，不含任何真实用户数据，也不含任何模型调用。
 * 文案本体在 `../i18n/locales/{en,zh}.js`，本文件只负责"按当前语言取出来"。
 *
 * 约定（很重要，视图都依赖它）：
 *  - 导出的都是 **computed ref**。模板里直接当普通值用（<script setup> 自动解包），
 *    script 里要 `PHQ9.value`。
 *  - 因为依赖 i18n 的当前 locale，**切换语言时全部自动重算**，视图无须重建。
 *
 * 为什么这里一律用 tm() 而不是 t()：这些是数组 / 对象等**原始数据**，不经过
 * vue-i18n 的 message compiler，因此不受 `@`、`|`、`{}` 这类特殊字符影响
 * （量表条目、桩文本里就有引号与括号）。插值需求应写进视图而不是本文件。
 */
import { computed } from 'vue'
import { i18n } from '../i18n'

const tm = (key) => i18n.global.tm(key)

/* ══ Step 0 分诊量表 ══ */

export const PHQ9 = computed(() => tm('scales.phq9'))
export const GAD7 = computed(() => tm('scales.gad7'))
export const RRS_BROODING = computed(() => tm('scales.rrs'))
export const SCALES = computed(() => [PHQ9.value, GAD7.value, RRS_BROODING.value])

/* ══ Step 1 书写引导 ══ */

export const WRITING_PROMPTS = computed(() => tm('prompts.writing'))
export const WRITING_BLOCKED = computed(() => tm('prompts.writingBlocked'))

/* ══ 首页 · 事件触发判据（由用户自己判断，禁止后台静默触发） ══ */

export const HOME_TRIGGERS = computed(() => tm('home.triggers'))

/* ══ Step 2 低强度重评引导（低强度不走抽离，见 Step 2 路由表） ══ */

export const REAPPRAISE_PROMPTS = computed(() => tm('prompts.reappraise'))

/* ══ Step 4 重构引导语（必须触发，否则整步失败） ══ */

export const RECONSTRUE_PROMPTS = computed(() => tm('prompts.reconsture'))

/* ══ Step 5 质检判据 ══ */

export const CRITIQUE_CRITERIA = computed(() => tm('criteria'))

/* ══ Step 3 四种视角（中文侧已做文化校准：不用"墙上苍蝇"这一称呼） ══ */

export const LENSES = computed(() => tm('lenses'))

/* ══ Step 8 元认知短内容（低频推送，用于长期无事件触发时） ══ */

export const META_NOTES = computed(() => tm('metaNotes'))

/* ══ Step 10 负性指标 ══ */

export const NEGATIVE_INDICATORS = computed(() => tm('indicators'))

/* ══ 安全层 · 危机资源（两种语言各自核实，见 locales 里的 [REVIEW]） ══ */

export const CRISIS_RESOURCES = computed(() => tm('crisis.resources'))
export const CRISIS_COPY = computed(() => tm('crisis.copy'))

/* ══ Step 10 剂量契约表（SafetyView） ══ */

export const DOSE_TABLE = computed(() => tm('safety.doseTable'))

/* ══ 安全层 · 定位声明五条（SafetyView） ══ */

export const SAFETY_RULES = computed(() => tm('safety.rules'))

/* ══ 演示素材：一次日常情绪事件（虚构） ══ */

export const SAMPLE_WRITING = computed(() => tm('stub.sample'))

/** 桩改写 · 第 1 次：第三人称，但仍是复述 + 自我批判 → 质检应拦截 */
export const STUB_FAIL_OUTPUT = computed(() => tm('stub.fail'))

/** 桩改写 · 第 2 次（换引导语后）：发生重构 → 质检通过 */
export const STUB_PASS_OUTPUT = computed(() => tm('stub.pass'))

/** 桩改写 · 温度层（Neff 三要素：自我友善 / 共同人性 / 正念） */
export const STUB_WARMTH_OUTPUT = computed(() => tm('stub.warmth'))