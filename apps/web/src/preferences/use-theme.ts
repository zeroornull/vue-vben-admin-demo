import { computed, onMounted, onUnmounted, ref } from 'vue'

import { usePreferencesStore } from '@/stores/preferences'

import {
  applyThemeDataset,
  nextThemeMode,
  normalizeThemeMode,
  resolveTheme,
  themeModeLabels,
} from './theme'

const systemDark = ref(false)
let media: MediaQueryList | null = null
let listeners = 0

function onSystemChange(event: MediaQueryListEvent) {
  systemDark.value = event.matches
}

function startSystemListener() {
  if (typeof window === 'undefined') return
  if (!media) {
    media = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = media.matches
  }
  if (listeners === 0) {
    media.addEventListener('change', onSystemChange)
  }
  listeners += 1
}

function stopSystemListener() {
  if (!media) return
  listeners = Math.max(0, listeners - 1)
  if (listeners === 0) {
    media.removeEventListener('change', onSystemChange)
  }
}

export function useTheme() {
  const preferences = usePreferencesStore()
  const themeMode = computed(() => normalizeThemeMode(preferences.themeMode))
  const resolved = computed(() => resolveTheme(themeMode.value, systemDark.value))
  const themeLabel = computed(() => themeModeLabels[themeMode.value])

  function apply() {
    if (typeof document === 'undefined') return
    applyThemeDataset(document.documentElement, themeMode.value)
  }

  function cycleTheme() {
    preferences.setThemeMode(nextThemeMode(themeMode.value))
  }

  onMounted(() => {
    startSystemListener()
    apply()
  })
  onUnmounted(() => {
    stopSystemListener()
  })

  return {
    cycleTheme,
    resolved,
    themeLabel,
    themeMode,
  }
}
