<script setup lang="ts">
defineOptions({ name: 'IframeView' })

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useLinksStore } from '@/stores/links'

import {
  IFRAME_SANDBOX,
  canOpenIframeExternally,
  iframeReloadKey,
  safeIframeSrc,
} from './iframe/src'

const route = useRoute()
const links = useLinksStore()
const epoch = ref(0)

const code = computed(() => (typeof route.params.code === 'string' ? route.params.code : ''))
const src = computed(() => {
  if (code.value) return links.srcFor(code.value)
  return safeIframeSrc(route.meta.iframeSrc)
})
const heading = computed(() => {
  if (!code.value) return '这是壳里的 iframe，不是新标签。地址来自 meta.iframeSrc，先过安全过滤。'
  const title = links.titleFor(code.value)
  if (title) return `外链「${title}」。还是 IframeView，不是新组件。`
  return '没有这条外链，或已经停用。'
})
const canOpen = computed(() => canOpenIframeExternally(src.value))
const frameKey = computed(() => (src.value ? iframeReloadKey(src.value, epoch.value) : ''))

function reload() {
  epoch.value += 1
}

function openExternal() {
  if (!src.value || !canOpen.value) return
  window.open(src.value, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="page">
    <p>{{ heading }}</p>
    <div v-if="src" class="toolbar">
      <button type="button" @click="reload">重新加载</button>
      <button v-if="canOpen" type="button" @click="openExternal">新窗口打开</button>
    </div>
    <iframe
      v-if="src"
      :key="frameKey"
      :src="src"
      :sandbox="IFRAME_SANDBOX"
      :title="code ? links.titleFor(code) || '外链' : '内嵌页'"
    />
    <p v-else-if="code">编码 <code>{{ code }}</code> 对不上启用中的外链。</p>
    <p v-else>这个地址不能嵌。</p>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 0.75rem;
  min-height: 0;
}

.toolbar {
  display: flex;
  gap: 0.75rem;
}

.toolbar button {
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  color: hsla(160, 100%, 37%, 1);
  cursor: pointer;
}

iframe {
  width: 100%;
  min-height: calc(100vh - 14rem);
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
}
</style>
