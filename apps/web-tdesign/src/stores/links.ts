import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getLinkList } from '@/api/system/link'
import { linkSrcFor, linkTitleFor, type EmbedLink } from '@/views/links/query'

export const useLinksStore = defineStore('links', () => {
  const items = ref<EmbedLink[]>([])

  const enabled = computed(() => items.value.filter((item) => item.status === 1))

  function titleFor(code: string) {
    return linkTitleFor(items.value, code)
  }

  function srcFor(code: string) {
    return linkSrcFor(items.value, code)
  }

  async function pull() {
    try {
      const result = await getLinkList({
        code: '',
        name: '',
        page: 1,
        pageSize: 100,
        status: '',
      })
      items.value = result.items
    } catch {
      items.value = []
    }
  }

  function reset() {
    items.value = []
  }

  return { enabled, items, pull, reset, srcFor, titleFor }
})
