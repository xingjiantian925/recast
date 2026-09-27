<script setup>
/**
 * MetaNote.vue — Step 8 元认知旁注
 *
 * 设计上刻意**低频**：仅在流程收尾与"长期无事件触发"时出现，不是每步都弹。
 * 依据：Wells 的 MCT —— 持有正性元认知信念（"反复分析才想得明白"）的用户，
 * 会把改写后的文本重新用作反刍燃料，形式变了功能没变。所以这层必须被碰一次。
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { META_NOTES } from '../mock/fixtures'
import { journalApi } from '../stores/journal'
import Icon from './Icon.vue'

const props = defineProps({
  index: { type: Number, default: 0 },
  dismissible: { type: Boolean, default: true },
})

const { t } = useI18n()

// META_NOTES 是 computed（随语言切换重算），这里也必须是 computed 才能跟着换语言
const note = computed(() => META_NOTES.value[props.index % META_NOTES.value.length])
const open = ref(true)

function dismiss() {
  journalApi.noteMetaSeen(note.value.id)
  open.value = false
}
</script>

<template>
  <div v-if="open" class="card card--quiet meta">
    <div class="row" style="align-items: flex-start">
      <Icon name="circle-question-mark" :size="18" class="meta__icon" />
      <div style="flex: 1">
        <p class="meta__eyebrow t-eyebrow">{{ t('common.notePrefix') + note.source }}</p>
        <h3 class="t-h4" style="margin-top: var(--space-1)">{{ note.title }}</h3>
        <p class="meta__body">{{ note.body }}</p>
      </div>
      <button v-if="dismissible" class="btn btn-tertiary btn-sm" @click="dismiss">
        {{ t('common.collapse') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.meta { padding: var(--space-4); }
.meta__icon { color: var(--txj-info-500); margin-top: 2px; }
.meta__eyebrow { margin: 0; }
.meta__body {
  margin-top: var(--space-2);
  color: var(--muted-foreground);
  font-size: 14.5px;
  line-height: 1.8;
}
</style>