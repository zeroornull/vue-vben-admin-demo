import { ref } from 'vue'
import { defineStore } from 'pinia'

import { lastPathFor, rememberInMap, type LastRouteMap } from '@/router/last-route'

export const useLastRouteStore = defineStore(
  'last-route',
  () => {
    const paths = ref<LastRouteMap>({})

    function remember(path: string, username: string) {
      paths.value = rememberInMap(paths.value, path, username)
    }

    function pathFor(username: string) {
      return lastPathFor(paths.value, username)
    }

    return {
      pathFor,
      paths,
      remember,
    }
  },
  {
    persist: {
      pick: ['paths'],
    },
  },
)
