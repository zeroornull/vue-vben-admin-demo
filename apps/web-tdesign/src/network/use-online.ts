import { onMounted, onUnmounted, ref } from 'vue'

import { readNavigatorOnline } from './online'

export function useOnline() {
  const online = ref(readNavigatorOnline(typeof navigator === 'undefined' ? undefined : navigator))

  function sync() {
    online.value = readNavigatorOnline(navigator)
  }

  onMounted(() => {
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
  })

  onUnmounted(() => {
    window.removeEventListener('online', sync)
    window.removeEventListener('offline', sync)
  })

  return online
}
