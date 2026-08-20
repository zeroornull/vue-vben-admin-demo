# 46 · 第 40 轮：记住上次页面

日期：2026-08-20。

## 本轮结论

守卫里的 `?redirect=` 只管「这一次被踢去登录」。本轮另记每个账号上次打开的**目录页**。主动退出再登录、地址栏没有 redirect 时，回到那一页。

`redirect` 仍优先。候选页必须在 `layoutChildren` 里，并且当前账号 `canAccessRoute` 过得去，否则看上一次，再不行回工作台。不记登录 / 403 / 404，不记查询串，不收 `//evil.com`。按用户名分槽，不是全局一个路径。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 和 token 写在同一个 persist | **否**。退出要清 token，但要留下路径 |
| 记 `fullPath`（含 query） | **否**。只要 path，避免把筛选条件当成「上次在哪」 |
| 开放重定向白名单库 | **否**。只认目录里的 path |

## 关键文件

```text
apps/web/src/router/last-route.ts
apps/web/src/stores/last-route.ts
apps/web/src/router/guard.ts
apps/web/src/views/LoginView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 打开用户页，退出，再登录（不要带 redirect），应回到 `/users`
2. 再换成 `user` 登录，不能进 `/users`，应回工作台或该账号自己上次能去的页
3. 未登录直接打开 `/workspace`，登录页带 `redirect=/workspace`，登录后仍去工作区（redirect 优先）
4. 手工把地址改成 `/login?redirect=//example.com`，登录后回工作台

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 会话打断（401、没 token）用 redirect。自愿离开用 last-route。混在一个字段里，退出后刷新登录页会丢掉「我想回去」或误用过期 redirect。
- `router.replace(query.redirect)` 不能信。`//evil.com` 在浏览器里是协议相对 URL。先收成目录 path，再查权限。
- 403 本身不要写入。否则下次登录直接进无权限页。`afterEach` 见到不在目录里的 path 就保持原值。
- persist 按 username 做 map。三个假账号共用一个浏览器时，不会把 vben 的 `/users` 塞给 user。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
