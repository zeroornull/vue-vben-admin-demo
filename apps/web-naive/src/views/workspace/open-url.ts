import type { Router } from 'vue-router'

export function openWorkbenchUrl(router: Router, url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  if (url.startsWith('/')) {
    void router.push(url)
  }
}
