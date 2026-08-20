<script setup lang="ts">
defineOptions({ name: 'IframeView' })

import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { IFRAME_SANDBOX, safeIframeSrc } from './iframe/src'

const route = useRoute()
const src = computed(() => safeIframeSrc(route.meta.iframeSrc))
</script>

<template>
  <div class="page">
    <p>这是壳里的 iframe，不是新标签。地址来自 <code>meta.iframeSrc</code>，先过安全过滤。</p>
    <iframe
      v-if="src"
      :src="src"
      :sandbox="IFRAME_SANDBOX"
      title="内嵌页"
    />
    <p v-else>这个地址不能嵌。</p>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 0.75rem;
  min-height: 0;
}

iframe {
  width: 100%;
  min-height: calc(100vh - 14rem);
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
}
</style>
