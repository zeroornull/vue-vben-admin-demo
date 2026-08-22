# 93 · 第 84 轮：Vue 3.6 Vapor 实验

日期：2026-08-22。

## 做了什么

新建 `apps/web-vapor`。只挂一张无 UI 库的工作区卡片：本周访问的 CSS 柱。入口用官方的 `createVaporApp`，页面用 `<script setup lang="ts" vapor>`。Vapor 是 opt-in，没有在 Vite 插件里全局打开。

默认 `@app/web` 和另外四套皮肤仍走 catalog 的 Vue **3.5.41**。根 catalog 仍是 `^3.5.40`。3.6 只写在这一套的 `package.json`，不进 catalog。

## 装了什么

| 包 | 锁定 | 用途 |
| --- | --- | --- |
| `vue` | 3.6.0-rc.4 | 仅 `@app/web-vapor`。npm `latest` 仍是 3.5.41，`rc` 标签才是 3.6 |
| `@vue/runtime-vapor` | 3.6.0-rc.4 | 和 vue 对齐。Vitest / Bun 走 `vue` 的 node 入口时拿不到 `createVaporApp` |

没有装 ant-design-vue / Element / Naive / TDesign / antdv-next / vxe。没有 router、Pinia、mock、i18n。

根脚本 `bun run dev:vapor` → http://127.0.0.1:5176/

## 哪些 SFC / 组件不能进 Vapor

官方（3.6 RC 说明）现在不支持或不要当 VDOM 那样用：

| 不能 / 不要 | 原因 |
| --- | --- |
| Options API | Vapor 只认 `<script setup>` / template-only |
| JSX / `h()` / 手写 render | 仍是 VDOM 组件，要 `vaporInteropPlugin` |
| `app.config.globalProperties` | 不适用于 Vapor |
| `getCurrentInstance()` | 在 Vapor 组件里是 `null` |
| `@vue:xxx` 元素生命周期 | 无 |
| `v-memo` | 无 |
| 模板 ref 上的 `$el` / `$props` / `$attrs` / `$slots` / `$refs` | 不暴露 |
| 自定义指令旧接口 | Vapor 指令改成 getter + 可选 cleanup |
| 先 `slots.default()` 再决定渲染 | 会真的执行 slot，不是干跑 |
| 依赖 `stopPropagation` 的委托事件 | Vapor 默认可把事件委托到 `document` |

本仓里**先不要**标 `vapor` 的东西：

| 现有代码 | 原因 |
| --- | --- |
| `AntdPage` / `ElePage` / `NaivePage` / `TdPage` / `AntdvPage` | ConfigProvider 是 VDOM 组件库 |
| 所有 ant-design-vue / Element / Naive / TDesign / antdv-next / vxe-table 页 | 官方说和 VDOM 组件库混用还有毛边 |
| `v-access` 自定义指令 | 指令接口变了，默认皮肤不能跟着改 |
| `BasicLayout` + KeepAlive | 靠组件 `name` / 实例代理；Vapor 实例模型不同 |
| Iconify 的 Vue 组件、ECharts 包装 | 按 VDOM / 运行时实例来用 |
| 默认 app 整棵升 3.6 | 闸门未开：要等 3.6 出 `latest`，且 UI 库 / vue-router / Pinia 声明支持 |

混用的官方口子是 `createApp().use(vaporInteropPlugin)`。这一轮没用它，避免把 VDOM runtime 再拉回来。

## 刻意没做

- 不改 `apps/web` 的 vue
- 不给五套皮肤一起升 3.6
- 不在这套里引进任何 UI 库
- 不开「默认改 3.6」的新一轮（闸门见 [75](./75-phase-2-roadmap.md)）

## 怎么开

```bash
bun run dev:vapor
```

## 验收

能打开工作区卡片。本 app 解析到 Vue 3.6，`createVaporApp` 存在。默认 app 仍是 3.5.41。四项检查过。

## 下一轮从哪里开始

二期名单到第 84 轮为止。下一件事先别做「默认改 3.6」：等 Vue 3.6 成为 `latest`，并且 ant-design-vue / Element / vue-router / Pinia 声明支持，再单独开一轮。
