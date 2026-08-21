import { createRouter, createWebHistory } from 'vue-router'

import { setupAccessGuard } from './guard'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return to.hash ? { el: to.hash, behavior: 'smooth' } : { left: 0, top: 0 }
  },
})

setupAccessGuard(router)

export default router
