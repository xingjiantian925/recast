<script setup>
/**
 * SettingsView — 模型接入 · 记忆透明 · 称呼偏好
 *
 * 安全约束（改动前先读 src/model/config.js 的文件头）：
 *  1. **默认只在内存**：输入即用；除非用户开启「在本机加密保存」，否则不落盘、刷新即失效。
 *  2. 开启后为**混淆级**加密（AES-GCM + 本机随机密钥，见 model/keystore.js）：
 *     能挡住存储里的明文外露，挡不住能执行本页脚本的人。文案如实说明，不做假承诺。
 *  3. Key 不进任何整体序列化 / 日志 / 导出。
 *  4. 请求直连用户配置的服务商，不经过我们的服务器。
 *
 * 记忆区遵循「可见、可控」：展示当前进入请求的样例（与 memory.js 同一数据源），
 * 开关关闭后引擎侧立即不再携带（styleAnchors 读取同一 prefs）。
 */
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../components/Icon.vue'
import { pingModel } from '../model/client'
import {
  getApiKey,
  hasApiKey,
  keyPersisted,
  modelConfig,
  persistenceAvailable,
  setApiKey,
  setPersistEnabled,
  setVerifyResult,
  forgetApiKey,
} from '../model/config'
import { candidateAnchors } from '../context/memory'
import { prefs, pronounPair } from '../stores/prefs'

const { t, tm } = useI18n()

/* ── 模型 ── */
const keyInput = ref(null)
const testing = ref(false)
const testResult = ref(null) // { ok: true, ms } | { ok: false, code }

onMounted(() => {
  // 本机保存的 Key 已在启动时恢复进内存；回填输入框（password 类型，仍是遮罩显示）
  const key = getApiKey()
  if (keyInput.value && key) keyInput.value.value = key
})

function onKeyInput(e) {
  // 立即进内存容器；是否落盘由 config 里的开关决定
  setApiKey(e.target.value)
}

function onPersistToggle(e) {
  setPersistEnabled(e.target.checked)
}

// 卡片右上角状态：未设置 / 仅内存 / 本机加密保存
const keyTag = computed(() =>
  !hasApiKey.value
    ? t('settings.keyUnset')
    : keyPersisted.value
      ? t('settings.keySetSaved')
      : t('settings.keySet'),
)

function forgetKey() {
  forgetApiKey()
  if (keyInput.value) keyInput.value.value = ''
  testResult.value = null
}

async function test() {
  // 关键：按钮只在"正在测试"期间禁用，不因 hasApiKey 永久变灰。
  // 没填 Key 就给出明确指引，而不是让按钮一直点不动。
  if (!getApiKey()) {
    testResult.value = { ok: false, code: 'nokey' }
    return
  }
  testing.value = true
  testResult.value = null
  try {
    const { ms } = await pingModel({
      baseUrl: modelConfig.baseUrl,
      apiKey: getApiKey(),
      model: modelConfig.model,
    })
    testResult.value = { ok: true, ms }
    setVerifyResult(true, ms)
  } catch (err) {
    // 错误收敛为 code，界面按码取文案；不展示服务商原始报文
    testResult.value = { ok: false, code: err?.code || 'server' }
    setVerifyResult(false)
  } finally {
    testing.value = false
  }
}

/* ── 记忆 ── */
const samples = computed(() => candidateAnchors())

/* ── 称呼 ── */
const pronounOptions = computed(() => Object.entries(tm('settings.pronounWords')))
</script>

<template>
  <main class="page page--narrow">
    <header style="margin-bottom: var(--space-5)">
      <h1 class="t-h2">{{ t('settings.title') }}</h1>
      <p class="t-body t-dim" style="margin-top: var(--space-2); line-height: 1.8">
        {{ t('settings.lede') }}
      </p>
    </header>

    <!-- 模型 -->
    <section class="card">
      <div class="card-head">
        <div>
          <span class="t-eyebrow">{{ t('settings.modelEyebrow') }}</span>
          <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('settings.modelTitle') }}</h2>
        </div>
        <span class="tag" :class="hasApiKey ? 'tag--success' : 'tag--neutral'">
          <span class="dot" />{{ keyTag }}
        </span>
      </div>
      <p class="t-caption" style="margin-top: var(--space-3); line-height: 1.75">
        {{ t('settings.modelNote') }}
      </p>

      <div class="fields">
        <div class="field">
          <label class="t-caption" for="model-base-url">{{ t('settings.baseUrlLabel') }}</label>
          <div class="input" style="width: 100%">
            <input
              id="model-base-url"
              v-model="modelConfig.baseUrl"
              class="input__field"
              type="url"
              spellcheck="false"
              autocomplete="off"
              placeholder="https://api.deepseek.com"
            />
          </div>
        </div>

        <div class="field">
          <label class="t-caption" for="model-name">{{ t('settings.modelNameLabel') }}</label>
          <div class="input" style="width: 100%">
            <input
              id="model-name"
              v-model="modelConfig.model"
              class="input__field"
              type="text"
              spellcheck="false"
              autocomplete="off"
              placeholder="deepseek-flash"
            />
          </div>
        </div>

        <div class="field">
          <label class="t-caption" for="model-api-key">{{ t('settings.apiKeyLabel') }}</label>
          <div class="input" style="width: 100%">
            <input
              id="model-api-key"
              ref="keyInput"
              class="input__field"
              type="password"
              spellcheck="false"
              autocomplete="new-password"
              :placeholder="t('settings.apiKeyPlaceholder')"
              @input="onKeyInput"
            />
          </div>
          <label
            v-if="persistenceAvailable"
            class="row"
            style="margin-top: var(--space-1); cursor: pointer"
          >
            <input
              type="checkbox"
              :checked="modelConfig.persistKey"
              @change="onPersistToggle"
            />
            <span>{{ t('settings.persistKey') }}</span>
          </label>
          <p class="t-caption" style="line-height: 1.7">
            {{ persistenceAvailable ? t('settings.apiKeyNote') : t('settings.persistUnavailable') }}
          </p>
        </div>
      </div>

      <div class="row row--wrap" style="margin-top: var(--space-4)">
        <button class="btn btn-secondary" :disabled="testing" @click="test">
          <Icon name="circle-check" :size="16" class="btn-icon" />
          {{ testing ? t('settings.testing') : t('settings.test') }}
        </button>
        <button v-if="hasApiKey" class="btn btn-tertiary" @click="forgetKey">
          {{ t('settings.forgetKey') }}
        </button>
        <span v-if="testResult" class="tag" :class="testResult.ok ? 'tag--success' : 'tag--error'">
          <span class="dot" />
          {{ testResult.ok
            ? t('settings.testOk', { ms: testResult.ms })
            : t('settings.testFail', { msg: t('engine.errors.' + testResult.code) }) }}
        </span>
      </div>
    </section>

    <!-- 记忆 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('settings.memoryEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('settings.memoryTitle') }}</h2>
      <p class="t-caption" style="margin-top: var(--space-3); line-height: 1.75">
        {{ t('settings.memoryNote') }}
      </p>

      <label class="row" style="margin-top: var(--space-4); cursor: pointer">
        <input
          type="checkbox"
          :checked="prefs.useMemory"
          @change="prefs.useMemory = $event.target.checked"
        />
        <span>{{ t('settings.useMemory') }}</span>
      </label>

      <p class="t-eyebrow" style="margin-top: var(--space-4)">{{ t('settings.sampleTitle') }}</p>
      <ul v-if="samples.length" class="samples">
        <li v-for="s in samples" :key="s.id" class="samples__item">
          <span class="t-caption">{{ s.at.slice(0, 10) }}</span>
          <p class="samples__text">{{ s.sample.slice(0, 140) }}…</p>
        </li>
      </ul>
      <p v-else class="t-caption" style="margin-top: var(--space-2)">
        {{ t('settings.sampleEmpty') }}
      </p>
    </section>

    <!-- 称呼 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('settings.pronounEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('settings.pronounTitle') }}</h2>
      <p class="t-caption" style="margin-top: var(--space-3)">
        {{ t('settings.pronounNote') }}
      </p>
      <div class="row row--wrap" style="margin-top: var(--space-3)">
        <button
          v-for="[key, word] in pronounOptions"
          :key="key"
          class="chip"
          :class="{ 'is-on': prefs.pronoun === key }"
          @click="prefs.pronoun = key"
        >
          {{ word }}
        </button>
        <span class="t-caption">→ {{ pronounPair.zh }} / {{ pronounPair.en }}</span>
      </div>
    </section>

    <!-- 隐私 -->
    <section class="card" style="margin-top: var(--space-4)">
      <span class="t-eyebrow">{{ t('settings.privacyEyebrow') }}</span>
      <h2 class="t-h4" style="margin-top: var(--space-2)">{{ t('settings.privacyTitle') }}</h2>
      <p class="t-body t-dim" style="margin-top: var(--space-3); line-height: 1.8">
        {{ t('settings.privacyBody') }}
      </p>
    </section>
  </main>
</template>

<style scoped>
.fields { display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-4); }
.field { display: flex; flex-direction: column; gap: var(--space-2); }

.samples { list-style: none; margin: var(--space-3) 0 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
.samples__item {
  padding: var(--space-3); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md); background: var(--surface);
}
.samples__text { margin: 4px 0 0; font-size: 13px; line-height: 1.7; color: var(--muted-foreground); }

.chip {
  padding: 6px var(--space-4); cursor: pointer;
  border: 1px solid var(--border-default); border-radius: var(--radius-pill);
  background: var(--surface); color: var(--foreground);
  font-size: 14px; transition: all .15s;
}
.chip:hover { border-color: var(--primary); }
.chip.is-on { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }
</style>