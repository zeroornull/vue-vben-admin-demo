import { defineConfig } from 'vitepress'

import { sidebar } from './sidebar'

export default defineConfig({
  cleanUrls: true,
  description: '从 Vue Vben Admin 迁到 Bun + TypeScript + Vue 的学习记录。一份文档，不按皮肤分叉。',
  ignoreDeadLinks: true,
  lang: 'zh-CN',
  outDir: 'dist',
  srcDir: '../../docs',
  themeConfig: {
    nav: [
      { link: '/00-overview', text: '总览' },
      { link: '/README', text: '阅读顺序' },
      { link: '/75-phase-2-roadmap', text: '二期' },
      { link: '/86-adapter', text: 'adapter' },
    ],
    outline: [2, 3],
    search: {
      provider: 'local',
    },
    sidebar,
    socialLinks: [],
  },
  title: 'Vue Admin',
})
