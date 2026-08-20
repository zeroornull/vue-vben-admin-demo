<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import ColorFilterToggle from '@/components/ColorFilterToggle.vue'
import DensityToggle from '@/components/DensityToggle.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import WatermarkToggle from '@/components/WatermarkToggle.vue'
import { shouldClosePopover } from '@/layouts/popover'

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function onDocumentPointer(event: PointerEvent) {
  if (shouldClosePopover(event, root.value, open.value)) close()
}

function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  event.preventDefault()
  close()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointer)
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointer)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="appearance">
    <button
      type="button"
      class="trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      title="水印、色弱、深浅、疏密"
      @click="toggle"
    >
      外观
    </button>
    <div v-if="open" class="panel" role="menu">
      <WatermarkToggle />
      <ColorFilterToggle />
      <ThemeToggle />
      <DensityToggle />
    </div>
  </div>
</template>

<style scoped>
.appearance {
  position: relative;
}

.trigger,
.panel :deep(button) {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}

.panel {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 8;
  display: grid;
  gap: 0.4rem;
  min-width: 7.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.45rem;
  background: var(--color-background);
  padding: 0.55rem;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}
</style>
