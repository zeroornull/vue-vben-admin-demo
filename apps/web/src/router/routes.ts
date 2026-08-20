import type { RouteRecordRaw } from 'vue-router'

import { FORBIDDEN_PATH, LOGIN_PATH } from '@/constants/auth'

export const coreRoutes: RouteRecordRaw[] = [
  {
    path: LOGIN_PATH,
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: FORBIDDEN_PATH,
    name: 'forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { public: true },
  },
]

/** 登录即可；不参与角色勾选，始终挂在 layout 上 */
export const staticLayoutChildren: RouteRecordRaw[] = [
  {
    path: '',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { order: 0, title: '工作台' },
  },
]

/** 按 userInfo.menuCodes addRoute；目录是守卫判断 403 的依据 */
export const dynamicLayoutChildren: RouteRecordRaw[] = [
  {
    path: 'workspace',
    name: 'workspace',
    component: () => import('@/views/WorkspaceView.vue'),
    meta: { menuCode: 'workspace', order: 1, title: '工作区' },
  },
  {
    path: 'analytics',
    name: 'analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { menuCode: 'analytics', order: 2, title: '分析' },
  },
  {
    path: 'users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { group: '系统', menuCode: 'users', order: 3, title: '用户' },
  },
  {
    path: 'depts',
    name: 'depts',
    component: () => import('@/views/DeptsView.vue'),
    meta: { group: '系统', menuCode: 'depts', order: 4, title: '部门' },
  },
  {
    path: 'roles',
    name: 'roles',
    component: () => import('@/views/RolesView.vue'),
    meta: { group: '系统', menuCode: 'roles', order: 5, title: '角色' },
  },
  {
    path: 'about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { menuCode: 'about', order: 6, roles: ['admin'], title: '关于' },
  },
]

export const layoutChildren: RouteRecordRaw[] = [
  ...staticLayoutChildren,
  ...dynamicLayoutChildren,
]

export const accessRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: () => import('@/layouts/BasicLayout.vue'),
    children: staticLayoutChildren,
  },
]

export const routes: RouteRecordRaw[] = [...accessRoutes, ...coreRoutes]
