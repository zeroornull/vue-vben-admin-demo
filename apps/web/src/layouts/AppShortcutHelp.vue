<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useLockStore } from '@/stores/lock'

import {
  SHORTCUTS,
  isEditableTarget,
  shouldCloseHelpOnEscape,
  shouldHandleHelpHotkey,
} from './shortcut-help'

const lockStore = useLockStore()
const { locked } = storeToRefs(lockStore)
const open = ref(false)

function closeHelp() {
  open.value = false
}

function toggleHelp() {
  if (locked.value) return
  open.value = !open.value
}

function onDocumentKey(event: KeyboardEvent) {
  if (shouldCloseHelpOnEscape(event, open.value, locked.value)) {
    event.preventDefault()
    event.stopPropagation()
    closeHelp()
    return
  }
  if (
    shouldHandleHelpHotkey(event, {
      locked: locked.value,
      typing: isEditableTarget(event.target),
    })
  ) {
    event.preventDefault()
    toggleHelp()
  }
}

watch(locked, (isLocked) => {
  if (isLocked) closeHelp()
})

onMounted(() => {
  window.addEventListener('keydown', onDocumentKey, true)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onDocumentKey, true)
})
</script>

<template>
  <div class="help">
    <button type="button" class="trigger" title="快捷键 ?" @click="toggleHelp">
      快捷键
    </button>
    <Teleport to="body">
      <div v-if="open" class="overlay" @click.self="closeHelp">
        <div class="panel" role="dialog" aria-label="快捷键说明">
          <h2>快捷键</h2>
          <ul>
            <li v-for="item in SHORTCUTS" :key="item.id">
              <kbd>{{ item.combo }}</kbd>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.note }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.trigger {
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.65rem;
  font: inherit;
  cursor: pointer;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 32;
  display: grid;
  align-content: start;
  justify-items: center;
  padding: 12vh 1rem 1rem;
  background: rgb(0 0 0 / 35%);
}

.panel {
  width: min(100%, 28rem);
  border: 1px solid var(--color-border);
  border-radius: 0.55rem;
  background: var(--color-background);
  padding: 0.9rem 1rem 1rem;
  box-shadow: 0 12px 32px rgb(0 0 0 / 16%);
}

h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--color-heading);
}

ul {
  display: grid;
  gap: 0.7rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  gap: 0.75rem;
  align-items: start;
}

kbd {
  display: inline-block;
  border: 1px solid var(--color-border);
  border-radius: 0.3rem;
  background: var(--color-background-soft);
  padding: 0.15rem 0.4rem;
  font: 0.8rem/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  text-align: center;
}

strong {
  display: block;
  font-size: 0.92rem;
  color: var(--color-heading);
}

p {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  opacity: 0.65;
}
</style>
