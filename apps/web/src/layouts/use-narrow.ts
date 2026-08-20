import { onMounted, onUnmounted, ref } from 'vue'

import { NARROW_MEDIA_QUERY } from './sidebar-chrome'

export function useNarrowViewport(query = NARROW_MEDIA_QUERY) {
  const narrow = ref(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  let media: MediaQueryList | null = null

  function onChange(event: MediaQueryListEvent) {
    narrow.value = event.matches
  }

  onMounted(() => {
    media = window.matchMedia(query)
    narrow.value = media.matches
    media.addEventListener('change', onChange)
  })

  onUnmounted(() => {
    media?.removeEventListener('change', onChange)
  })

  return narrow
}
