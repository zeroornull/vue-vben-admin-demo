import { nextTick, ref } from 'vue'

import { isDirtyForm, shouldBlockLeave, snapshotForm, UNSAVED_LEAVE_MESSAGE } from './unsaved'

export type UnsavedFormHandle = {
  confirmDiscard: (ask?: (message: string) => boolean) => boolean
  isDirty: () => boolean
}

export function useUnsavedForm(getValues: () => unknown, isActive: () => boolean = () => true) {
  const baseline = ref('')

  async function capture() {
    await nextTick()
    baseline.value = snapshotForm(getValues())
  }

  function isDirty() {
    if (!isActive() || !baseline.value) return false
    return isDirtyForm(baseline.value, getValues())
  }

  function confirmDiscard(ask: (message: string) => boolean = (message) => window.confirm(message)) {
    if (!shouldBlockLeave(isDirty())) return true
    return ask(UNSAVED_LEAVE_MESSAGE)
  }

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (!shouldBlockLeave(isDirty())) return
    event.preventDefault()
  }

  return { capture, confirmDiscard, isDirty, onBeforeUnload }
}
