import type {
  VisitSourceItem,
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from './types'

export const projectItems: WorkbenchProjectItem[] = [
  {
    color: '#181818',
    content: '不要等待机会，而要创造机会。',
    date: '2021-04-01',
    group: '开源组',
    mark: 'GH',
    title: 'Github',
    url: 'https://github.com',
  },
  {
    color: '#3fb27f',
    content: '现在的你决定将来的你。',
    date: '2021-04-01',
    group: '算法组',
    mark: 'V',
    title: 'Vue',
    url: 'https://vuejs.org',
  },
  {
    color: '#e18525',
    content: '没有什么才能比努力更重要。',
    date: '2021-04-01',
    group: '上班摸鱼',
    mark: 'H5',
    title: 'Html5',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML',
  },
  {
    color: '#bf0c2c',
    content: '热情和欲望可以突破一切难关。',
    date: '2021-04-01',
    group: 'UI',
    mark: 'Ng',
    title: 'Angular',
    url: 'https://angular.io',
  },
  {
    color: '#00d8ff',
    content: '健康的身体是实现目标的基石。',
    date: '2021-04-01',
    group: '技术牛',
    mark: 'R',
    title: 'React',
    url: 'https://reactjs.org',
  },
  {
    color: '#c4a000',
    content: '路是走出来的，而不是空想出来的。',
    date: '2021-04-01',
    group: '架构组',
    mark: 'JS',
    title: 'Js',
    url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',
  },
]

export const quickNavItems: WorkbenchQuickNavItem[] = [
  { color: '#1fdaca', mark: '台', title: '工作台', url: '/' },
  { color: '#3fb27f', mark: '区', title: '工作区', url: '/workspace' },
  {
    color: '#bf0c2c',
    mark: '关',
    roles: ['admin'],
    title: '关于',
    url: '/about',
  },
]

export const todoItems: WorkbenchTodoItem[] = [
  {
    completed: false,
    content: '审查最近提交的前端代码，确保代码质量和规范。',
    date: '2024-07-30 11:00:00',
    title: '审查前端代码提交',
  },
  {
    completed: true,
    content: '检查并优化系统性能，降低 CPU 使用率。',
    date: '2024-07-30 11:00:00',
    title: '系统性能优化',
  },
  {
    completed: false,
    content: '进行系统安全检查，确保没有未授权访问。',
    date: '2024-07-30 11:00:00',
    title: '安全检查',
  },
  {
    completed: false,
    content: '更新项目依赖，确认与 Vue 3.5 稳定线兼容。',
    date: '2024-07-30 11:00:00',
    title: '更新项目依赖',
  },
]

export const trendItems: WorkbenchTrendItem[] = [
  { content: '在开源组创建了项目 Vue', date: '刚刚', title: '威廉' },
  { content: '关注了威廉', date: '1个小时前', title: '艾文' },
  { content: '发布了个人动态', date: '1天前', title: '克里斯' },
  { content: '发表文章：如何编写一个 Vite 插件', date: '2天前', title: 'Vben' },
  { content: '关闭了问题：如何运行项目', date: '1周前', title: '杰克' },
]

export const visitSourceItems: VisitSourceItem[] = [
  { name: '搜索引擎', value: 1048 },
  { name: '直接访问', value: 735 },
  { name: '邮件营销', value: 580 },
  { name: '联盟广告', value: 484 },
]
