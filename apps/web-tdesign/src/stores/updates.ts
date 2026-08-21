import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { bumpVersion, getVersion } from '@/api/version'
import { hasNewBuild } from '@/updates/version'

export const useUpdatesStore = defineStore('updates', () => {
  const loaded = ref('')
  const latest = ref('')
  const dismissed = ref(false)

  const outdated = computed(() => hasNewBuild(loaded.value, latest.value) && !dismissed.value)

  async function pull() {
    const data = await getVersion()
    if (!loaded.value) loaded.value = data.buildId
    if (latest.value && latest.value !== data.buildId) dismissed.value = false
    latest.value = data.buildId
    return data.buildId
  }

  async function simulateRelease() {
    await bumpVersion()
    return pull()
  }

  function dismiss() {
    dismissed.value = true
  }

  function reload() {
    window.location.reload()
  }

  return {
    dismiss,
    latest,
    loaded,
    outdated,
    pull,
    reload,
    simulateRelease,
  }
})
