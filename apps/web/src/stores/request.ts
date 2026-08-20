import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { nextPending } from '@/api/pending'

export const useRequestStore = defineStore('request', () => {
  const pending = ref(0)
  const active = computed(() => pending.value > 0)

  function begin() {
    pending.value = nextPending(pending.value, 1)
  }

  function end() {
    pending.value = nextPending(pending.value, -1)
  }

  function reset() {
    pending.value = 0
  }

  return { active, begin, end, pending, reset }
})
