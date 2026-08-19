# 05 · 学习最新 Vue 与 TypeScript

旧仓已经是 Vue 3 + TS。这次「升级」不是 Vue 2 → 3，而是：

- 把工具链换成 Bun
- 把 Vue 及相关包收到**当前稳定最新**
- 在重写过程中把旧写法里过时的边角清掉

## 版本锚点（2026-08-19）

| 包 | 旧仓 catalog | 当时 npm latest | 新仓策略 |
| --- | --- | --- | --- |
| vue | 3.5.40 | **3.5.41**（2026-08-05） | 跟 3.5 最新补丁 |
| vue 3.6 | — | **3.6.0-rc.4** | 实验分支，不进默认 app |
| vue-router | 5.2.0 | 随 5.x 最新稳定 | 跟 stable |
| pinia | 4.0.2 | 跟 4.x | 跟 stable |
| vite | 8.2.1 | 跟 8.x | 跟 stable |
| typescript | 6.0.3 | 跟 6.x | 与 `vue-tsc` 一起升 |
| @vueuse/core | 14.3.0 | 跟 14.x | 用到再加 |

第 2 轮执行 `bun add` 时以 registry 当时的数为准，把**实际装上的版本**写进 `08-round-02-scaffold.md`。本页数字只是调研快照。

## Vue 3.5 你需要真会的部分

旧仓代码已经在用这些，读 `legacy/apps/web-antd` 时对上号即可。

### 应用实例

`createApp` → `use(plugin)` → `mount`。插件包括 Router、Pinia、i18n、自定义指令。见 `legacy/apps/web-antd/src/bootstrap.ts`。

### `<script setup lang="ts">` + 单文件组件

新页面一律 setup + TS。不要再写 Options API，除非在搬一段必须原样对照的旧代码。

### 响应式

优先：`ref` / `computed` / `watch` / `watchEffect`。  
对象用 `reactive` 可以，但和解构组合时容易丢代理，后台项目里 `ref` + `storeToRefs` 更不容易踩坑。

Pinia store 在组件里用 `storeToRefs` 取 state，方法直接从 store 上调。

### 路由

`vue-router` 5 的 `createRouter`、`createWebHistory` / `createWebHashHistory`、导航守卫与 Vue 3 一致。动态路由用 `router.addRoute`（旧仓封装在 `@vben/access` 里）。

环境变量切 history 模式：旧仓看 `VITE_ROUTER_HISTORY`。新仓先写死 `createWebHistory`，少一个分叉。

### 动态页面表

```ts
const pageMap = import.meta.glob('../views/**/*.vue');
```

这是 Vite 特性，和 Vue 版本无关。后端菜单的 `component` 字段必须能在这个 map 里对上路径，否则动态路由是空的。移植菜单时先对数，再抄 UI。

## Vue 3.6（只作了解）

3.6 RC 的两个大头：

1. **Vapor Mode**：编译到更轻的更新路径，不默认替换现有虚拟 DOM 应用
2. **@vue/reactivity 基于 alien-signals**：响应式更快、更省内存

官方建议：Vapor 先用在合适的新组件上，而不是把整个后台一键切过去。我们的默认 app 继续走 3.5 + 经典编译。若要试 3.6，单独开分支，文档单独记，避免和 Bun 脚手架问题缠在一起。

## TypeScript 在本项目里怎么用

- `"type": "module"`，全仓 ESM
- Vue SFC 的类型靠 `vue-tsc`，不要只用 `tsc` 检查 `.vue`
- `tsconfig` 开 `strict`；旧仓部分包用了 `skipLibCheck`，新仓先开着，第三方类型炸了再对单个包关
- 组件 props 用类型声明（`defineProps<Props>()`），不要运行时 `PropType` 除非要给 JSX 用
- 为 API 写类型：`UserInfo`、`AuthToken`、菜单节点。旧仓在 `@vben/types` 和 app 的 `api/` 里都有，搬的时候带着类型一起搬

路径别名必须同时配：

- `tsconfig.json` 的 `paths`
- `vite.config.ts` 的 `resolve.alias`（或 Vite 的 tsconfig paths 插件）

只配一边会出现「IDE 绿、构建红」或相反。

## 配套库：先学会再用

按第 2–4 轮顺序：

| 库 | 何时学 | 学什么 |
| --- | --- | --- |
| vite | 第 2 轮 | `plugin-vue`、`envDir`、`import.meta.env`、`import.meta.glob` |
| vue-router | 第 2–3 轮 | 静态路由、守卫、`addRoute`、`meta` |
| pinia | 第 3 轮 | `defineStore`、setup store、持久化插件 |
| axios | 第 3 轮 | 实例、拦截器；或先用 `ofetch`，但旧仓是 axios，对照更省事 |
| @vueuse/core | 第 4 轮 | `useTitle`、`useDark` 等，用到再加 |
| vue-i18n | 第 4 轮以后 | 旧仓 `$t` 遍布菜单 title；可以先写中文字符串 |
| UI 库 | 第 2 轮末或第 4 轮 | 与对照 app 一致的那一套（antd / 自己写简单壳） |

## 官方文档（按需打开，不要通读）

- [Vue 指南](https://vuejs.org/guide/introduction.html)
- [Vue API](https://vuejs.org/api/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vite](https://vite.dev/guide/)
- [Vue + TS](https://vuejs.org/guide/typescript/overview.html)

读官方文档时带着旧仓的一个具体文件（例如 `guard.ts`）对照，比按教程从 TodoMVC 学更快。

## 反模式（从旧仓抄代码时避开）

- 为了对齐 Vben 把整个 `form-ui` 拷进新 app，却只做一个 input
- 在组件里直接 `axios.get`，绕过统一 request 实例
- 把 token 塞进任意一个全局 `window` 变量
- 菜单 title 先上 i18n key，但还没有 i18n，页面上全是 `page.dashboard.title`
- 升级到 Vue 3.6 只为了「最新」，然后所有第三方 Vue 插件类型报错
