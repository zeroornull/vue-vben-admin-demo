# 02 · 旧仓架构（学习用）

这份文档只讲**读代码时要抓住的几条链**。细节以 `legacy/` 源码为准。

## 1. 启动链

应用不是 `createApp(App).use(router).mount('#app')` 一行结束。它把「偏好」和「Vue 实例」拆开，避免首屏用到尚未初始化的配置。

```text
main.ts
  ├─ 计算 namespace
  │    `${VITE_APP_NAMESPACE}-${VITE_APP_VERSION}-${prod|dev}`
  ├─ initPreferences({ namespace, overrides, extension })
  ├─ await import('./bootstrap')     ← 动态 import，保证偏好已就绪
  └─ bootstrap(namespace)
        ├─ initComponentAdapter()    ← 皮肤适配
        ├─ initSetupVbenForm()
        ├─ createApp(App)
        ├─ 指令：v-loading / v-access
        ├─ setupI18n
        ├─ initStores(app, { namespace })
        ├─ app.use(router)
        ├─ 可选插件（tippy、motion）
        └─ app.mount('#app')
```

对照文件：

- `legacy/apps/web-antd/src/main.ts`
- `legacy/apps/web-antd/src/bootstrap.ts`
- `legacy/packages/@core/preferences/src/index.ts`

`namespace` 会进 Pinia 持久化 key 和 SecureLS 的 meta key，用来隔离不同 app / 环境的本地缓存。新仓即使先不做加密存储，也建议保留「前缀」这个概念，避免以后多实例互相覆盖。

## 2. 偏好（preferences）

偏好是全局只读配置对象，覆盖：

- 应用名、默认首页、权限模式（前端角色 / 后端菜单）
- 布局：侧边、混合、顶部、内容紧凑
- 主题：色、圆角、暗色
- 过渡动画、是否显示进度条

应用通过 `preferences.ts` 覆盖默认值，运行时还可以 `updatePreferences`。布局组件大量读取这份对象，而不是自己在页面里写死。

迁移含义：第 2 轮可以先做一个扁平的 `preferences.ts`；等要做主题面板，再考虑搬 `@vben/preferences` 的完整实现。

## 3. 路由与权限

路由分两层：

1. **静态核心路由**：登录、404、403 等，见 `router/routes/core.ts`。这些名字在 `coreRouteNames` 里，守卫会放行。
2. **权限路由**：`accessRoutes`，来自本地 modules +（可选）后端菜单。

守卫在 `legacy/apps/web-antd/src/router/guard.ts`：

```text
beforeEach
  ├─ 核心路由？
  │    ├─ 已登录还去 LOGIN → 重定向 home
  │    └─ 否则放行
  ├─ 无 token？
  │    ├─ meta.ignoreAccess → 放行
  │    └─ 否则去登录，带 redirect
  ├─ 已生成过动态路由（isAccessChecked）→ 放行
  └─ 否则
       ├─ 拉 userInfo.roles
       ├─ generateAccess({ roles, routes, router })
       ├─ 写入 accessStore 的 menus / routes
       └─ replace 到目标页
```

`generateAccess`（`router/access.ts`）做三件事：

- `import.meta.glob('../views/**/*.vue')` 得到页面表
- 把 `BasicLayout` / `IFrameView` 交给布局表
- 调 `@vben/access` 的 `generateAccessible(accessMode, …)`
  - 前端模式：按角色过滤本地路由
  - 后端模式：`getAllMenusApi()` 拉菜单，再和 pageMap 对齐

学习点：权限的「数据」在 store，「计算」在 `@vben/access`，「触发」在守卫。三处不要揉成一个 `router.ts`。新仓第 3 轮按这个切分移植，而不是先抄 UI。

## 4. 状态

`@vben/stores` 在 `initStores` 里创建 Pinia，并挂 `pinia-plugin-persistedstate`：

- 开发环境：`localStorage`
- 生产环境：`secure-ls` AES（密钥来自 `VITE_APP_STORE_SECURE_KEY`）
- key = `${namespace}-${store.id}`

应用自己的 `store/auth.ts` 负责登录 / 拉用户 / 登出，内部再写 `useAccessStore`、`useUserStore`。

新仓第 2 轮：一个 `auth` store + 内存 token 就够跑通登录假数据。加密持久化往后放。

## 5. 请求

`@vben/request` 包了一层 Axios。app 里的 `api/request.ts` 设置：

- baseURL
- 请求拦截：带 token
- 响应拦截：code 判断、401 登出、错误提示

业务 API 只写函数，不直接碰 axios 实例。这条边界值得原样保留。

## 6. 适配器（多皮肤的关键）

Vben 的表单、弹窗、消息不是绑死 Ant Design。每个 app 在 `adapter/` 里注册：

- 具体 Input / Select / DatePicker 对应哪个组件
- 表单校验、消息反馈怎么调用

所以 `packages/@core/ui-kit/form-ui` 能在四个皮肤里复用。

新仓如果只做一套 UI，adapter 可以极薄，甚至先不抽包。等第二个皮肤出现再抽。不要为「理论上要多皮肤」先建四套目录。

第 71 轮只开口子：`@app/core` 有注册表和类型，antd 实现仍在 `apps/web/src/adapter/antd.ts`。见 [78](./78-round-71-core.md)。

## 7. 布局

`layouts/basic.vue` 大多是对 `@vben/layouts` 的薄封装。真正的侧边栏、顶栏、标签页、偏好抽屉在 effects/layouts 和 `@core/ui-kit`。

这是旧仓里体积最大、耦合最深的一块。第 2 轮用一个简单 `AppShell`（顶栏 + 侧栏 + `<RouterView>`）代替，第 4 轮再按需搬。

## 8. 路径别名与包边界

- 应用内部：`#/*` → `src/*`
- 跨包：`@vben/xxx`、`@vben-core/xxx`，一律 `workspace:*`
- 共享版本：`catalog:`

读 import 时先分清「同 app」还是「workspace 包」。把 `@vben/utils` 的函数复制进 app 可以，但不要在第 2 轮就重建整套包名，否则 import 改一次要改全仓。

## 9. 建议的阅读顺序（半天能走完）

1. `legacy/apps/web-antd/src/main.ts`
2. `legacy/apps/web-antd/src/bootstrap.ts`
3. `legacy/apps/web-antd/src/router/index.ts` + `guard.ts` + `access.ts`
4. `legacy/apps/web-antd/src/store/auth.ts`
5. `legacy/apps/web-antd/src/api/request.ts` + `api/core/auth.ts`
6. `legacy/packages/stores/src/setup.ts`
7. `legacy/packages/effects/access/src/index.ts`（先看导出，再按函数点进去）

读的时候在纸上画一张「启动 → 登录 → 动态路由 → 第一个 dashboard」的序列图。第 2 轮脚手架要以能走完这条序列为目标，而不是先还原设置页。
