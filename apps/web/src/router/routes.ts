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

/** 铺在 BasicLayout 下；菜单从这里按角色过滤 */
export const layoutChildren: RouteRecordRaw[] = [
  {
    path: '',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { order: 0, title: '工作台' },
  },
  {
    path: 'workspace',
    name: 'workspace',
    component: () => import('@/views/WorkspaceView.vue'),
    meta: { order: 1, title: '工作区' },
  },
  {
    path: 'about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { order: 2, roles: ['admin'], title: '关于' },
  },
]

export const accessRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: () => import('@/layouts/BasicLayout.vue'),
    children: layoutChildren,
  },
]

export const routes: RouteRecordRaw[] = [...accessRoutes, ...coreRoutes]
