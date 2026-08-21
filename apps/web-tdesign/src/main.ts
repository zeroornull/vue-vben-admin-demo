import './assets/main.css'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'

import { initTdesignSkin } from '@/adapter/tdesign'
import { vAccess } from '@/access/directive'
import { i18n } from '@/i18n'

import App from './App.vue'
import router from './router'

initTdesignSkin()

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(i18n)
app.use(router)
app.directive('access', vAccess)

app.mount('#app')
