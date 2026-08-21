import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { nextPending } from '@app/request'

export const useRequestStore = defineStore('request', () => {
  const pending = ref(0)
  const notice = ref('')
  const active = computed(() => pending.value > 0)

  function begin() {
    pending.value = nextPending(pending.value, 1)
  }

  function end() {
    pending.value = nextPending(pending.value, -1)
  }

  function fail(message: string) {
    notice.value = message
  }

  function dismiss() {
    notice.value = ''
  }

  function reset() {
    pending.value = 0
    notice.value = ''
  }

  return { active, begin, dismiss, end, fail, notice, pending, reset }
})
