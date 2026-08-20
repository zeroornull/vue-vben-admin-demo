# 22 · 第 16 轮：面包屑

日期：2026-08-20。

## 本轮结论

页签下面加了一条面包屑。规则写在纯函数里，不读路由实例：

- 第一段永远是「工作台」，能跳回 `/`
- 当前页有 `meta.group` 时，中间插一段分组名（「系统」）。分组没有对应路由，点不了
- 最后一段是当前页标题，不是链接
- 停在工作台时整条藏起来，避免和顶栏 `h1` 重复

403 / 404 / 登录在壳外，没有面包屑。

零新依赖。没有用 antd `Breadcrumb`。没有按 `route.matched` 拼——现在全是一级子路由，`matched` 只有 layout + 自己。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben/layouts` 面包屑 | 自写 `AppBreadcrumb` + `breadcrumb.ts` |
| antd `Breadcrumb` | **否**。壳还是 CSS；antd 只在 `AntdPage` 里 |
| `hideInBreadcrumb` / 图标 | **否** |
| 新 npm 包 | **零** |

## 和页签、侧栏的差别

| | 侧栏 | 页签 | 面包屑 |
| --- | --- | --- | --- |
| 数据从哪来 | 有权限的 `layoutChildren` | 打开过的路由 | **当前**路由的 title / group |
| 分组「系统」 | 连续同组收成一块 | 不管 | 中间一段，不能跳 |
| 工作台 | 始终有 | 钉住 | 第一段；自己身上不显示条 |

不要把三套合成一份 state。页签 persist，面包屑不 persist。

## 以后有嵌套路由再改

现在路径是平的：`/users`、`/depts`。分组只是 `meta.group` 字符串，不是父路由。

真有 `/system/users` 这种嵌套时，再改成扫 `route.matched`，用父级 `title` 当中间段。不要提前加空的父路由只为了面包屑。

## 关键文件

```text
apps/web/src/layouts/breadcrumb.ts
apps/web/src/layouts/AppBreadcrumb.vue
apps/web/src/layouts/BasicLayout.vue
apps/web/src/layouts/__tests__/breadcrumb.spec.ts
```

## 怎么验收

```bash
bun run dev
```

1. 登录后停在工作台：页签下面没有面包屑
2. 打开工作区：`工作台 / 工作区`；点「工作台」回到 `/`
3. 打开用户：`工作台 / 系统 / 用户`；「系统」不是链接
4. 打开关于：`工作台 / 关于`（没有分组）
5. 换 `user` 登录，打开分析：同样有条；没有权限的页进不去，也就看不到那条

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 面包屑是「我现在在哪」，不是「我打开过什么」。后者是页签。
- 分组标题能出现在侧栏和面包屑，并不等于它是一个可导航节点。没有 `name` 就不要硬造 `RouterLink`。
- `aria-current="page"` 标当前段，给读屏用。分隔符用 CSS `::after` 的 `/`，不要再塞一个 `<li>`。

## 下一轮从哪里开始

第 17 轮做了 `v-access`，见 [23-round-17-v-access.md](./23-round-17-v-access.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
