import { createI18n } from 'vue-i18n'

import { enUS } from './messages/en-US'
import { zhCN } from './messages/zh-CN'

export const i18n = createI18n({
  fallbackLocale: 'zh-CN',
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
  },
})
