# 39 · 第 33 轮：浏览器标签标题

日期：2026-08-20。

## 本轮结论

浏览器标签跟着当前路由走：`用户 · Vue Admin`。没有 `meta.title` 时只显示应用名。登录 / 403 / 404 补了标题，它们不在 `layoutChildren` 里，不会进侧栏或菜单搜索。

不要上 `@vueuse/core` 的 `useTitle`，也不要上 unhead。标题是路由的副作用，挂在 `App.vue` 里和主题、滤镜一起 watch。

登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| VueUse `useTitle` / unhead | **否**。`document.title = …` |
| 每页自己设标题 | **否**。漏一页就会停在上一页的字 |
| 新 npm 包 | **零** |

`index.html` 里仍是 `Vue Admin`，Vue 起来之前用它。

## 关键文件

```text
apps/web/src/router/document-title.ts
apps/web/src/App.vue
apps/web/src/router/routes.ts          # 登录 / 403 / 404 补 title
apps/web/src/types/router.d.ts
```

## 怎么验收

```bash
bun run dev
```

1. 登录页标签是「登录 · Vue Admin」
2. 进用户页变成「用户 · Vue Admin」
3. 工作台是「工作台 · Vue Admin」
4. 用 `user` 打开 /about，标签是「无权限 · Vue Admin」
5. 乱打一个地址，标签是「未找到 · Vue Admin」

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 顶栏 `h1` 给已经在页面里的人看。`document.title` 给标签、历史记录、读屏和切换窗口用。两处都读 `meta.title`，不要各写各的。
- 标题必须集中写。放进每个 view 的 `onMounted`，KeepAlive 回来时不一定再跑，标签会停在上一页。
- 给壳外路由加 `title` 不会自动进侧栏。侧栏只扫 `layoutChildren`，并且还要 `hideInMenu` / 权限。

## 下一轮从哪里开始

第 34 轮做了外观菜单，见 [40-round-34-appearance-menu.md](./40-round-34-appearance-menu.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
