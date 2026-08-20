import type { RouteRecordRaw } from 'vue-router'

import { FORBIDDEN_PATH, LOGIN_PATH } from '@/constants/auth'

export const coreRoutes: RouteRecordRaw[] = [
  {
    path: LOGIN_PATH,
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: FORBIDDEN_PATH,
    name: 'forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: { title: '无权限' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { public: true, title: '未找到' },
  },
]

/** 登录即可；不参与角色勾选，始终挂在 layout 上 */
export const staticLayoutChildren: RouteRecordRaw[] = [
  {
    path: '',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { affixTab: true, icon: 'home', order: 0, title: '工作台', viewName: 'HomeView' },
  },
  {
    path: 'profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      hideInMenu: true,
      icon: 'profile',
      order: 99,
      title: '个人中心',
      viewName: 'ProfileView',
    },
  },
]

export function staticLayoutNames(routes = staticLayoutChildren): string[] {
  return routes
    .map((route) => (typeof route.name === 'string' ? route.name : ''))
    .filter(Boolean)
}

/** 按 userInfo.menuCodes addRoute；目录是守卫判断 403 的依据 */
export const dynamicLayoutChildren: RouteRecordRaw[] = [
  {
    path: 'workspace',
    name: 'workspace',
    component: () => import('@/views/WorkspaceView.vue'),
    meta: { icon: 'workspace', menuCode: 'workspace', order: 1, title: '工作区', viewName: 'WorkspaceView' },
  },
  {
    path: 'analytics',
    name: 'analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { icon: 'analytics', menuCode: 'analytics', order: 2, title: '分析', viewName: 'AnalyticsView' },
  },
  {
    path: 'users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { group: '系统', icon: 'users', menuCode: 'users', order: 3, title: '用户', viewName: 'UsersView' },
  },
  {
    path: 'depts',
    name: 'depts',
    component: () => import('@/views/DeptsView.vue'),
    meta: { group: '系统', icon: 'depts', menuCode: 'depts', order: 4, title: '部门', viewName: 'DeptsView' },
  },
  {
    path: 'roles',
    name: 'roles',
    component: () => import('@/views/RolesView.vue'),
    meta: { group: '系统', icon: 'roles', menuCode: 'roles', order: 5, title: '角色', viewName: 'RolesView' },
  },
  {
    path: 'about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { icon: 'about', menuCode: 'about', order: 6, roles: ['admin'], title: '关于', viewName: 'AboutView' },
  },
  {
    path: 'embed',
    name: 'embed',
    component: () => import('@/views/IframeView.vue'),
    meta: {
      icon: 'embed',
      iframeSrc: '/embed-demo.html',
      menuCode: 'embed',
      order: 7,
      title: '内嵌页',
      viewName: 'IframeView',
    },
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
