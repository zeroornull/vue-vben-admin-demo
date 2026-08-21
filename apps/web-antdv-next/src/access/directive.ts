import type { Directive } from 'vue'
import { watch } from 'vue'

import { useAuthStore } from '@/stores/auth'

import { matchAccess } from '@app/access/match'

export type AccessValue = string | string[]

type AccessState = {
  arg: string | null
  comment: Comment
  hidden: boolean
  stop: () => void
  value: unknown
}

const states = new WeakMap<HTMLElement, AccessState>()

function hide(el: HTMLElement, state: AccessState) {
  if (state.hidden) return
  const parent = el.parentNode
  if (!parent) return
  parent.replaceChild(state.comment, el)
  state.hidden = true
}

function show(el: HTMLElement, state: AccessState) {
  if (!state.hidden) return
  const parent = state.comment.parentNode
  if (!parent) return
  parent.replaceChild(el, state.comment)
  state.hidden = false
}

function apply(el: HTMLElement, state: AccessState) {
  const ok = matchAccess({ arg: state.arg, value: state.value }, useAuthStore().userInfo)
  if (ok) show(el, state)
  else hide(el, state)
}

export const vAccess: Directive<HTMLElement, AccessValue> = {
  mounted(el, binding) {
    const store = useAuthStore()
    const state: AccessState = {
      arg: binding.arg ?? null,
      comment: document.createComment('v-access'),
      hidden: false,
      stop: () => {},
      value: binding.value,
    }
    state.stop = watch(
      () => [store.userInfo?.actionCodes, store.userInfo?.menuCodes, store.userInfo?.roles] as const,
      () => apply(el, state),
      { immediate: true },
    )
    states.set(el, state)
  },
  updated(el, binding) {
    const state = states.get(el)
    if (!state) return
    state.arg = binding.arg ?? null
    state.value = binding.value
    apply(el, state)
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state) return
    state.stop()
    if (state.hidden) {
      state.comment.parentNode?.removeChild(state.comment)
    }
    states.delete(el)
  },
}
