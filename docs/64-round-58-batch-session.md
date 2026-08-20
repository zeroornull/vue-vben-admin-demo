# 64 · 第 58 轮：批量删除 + 多标签补全

日期：2026-08-20。

这一轮打包两件。前面单轮已经太碎：登录、布局、权限、CRUD、壳上的偏好，该搬的都在了。剩下不是第二座山。

## 本轮结论

用户表可以勾选，一次删最多 20 人。走 `user:delete`，每人记一条操作日志。没有删除权的人看不到勾选。

多标签在清会话之外补了两件事：一个标签锁屏 / 解锁，另一个跟上；一个标签换账号登录，另一个读 persist 里的新 token，拉 userInfo，重挂路由。已经是同一 token 的不折腾。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 每张表都做批量 | **否**。先用户 |
| 跨标签同步页签 / 偏好 | **否**。只会话和锁 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/views/users/query.ts
apps/web/src/views/UsersView.vue
apps/web/vite/mock-api.ts
apps/web/src/auth/session-broadcast.ts
apps/web/src/auth/use-session-sync.ts
apps/web/src/stores/lock.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 用户表勾两人，删除选中，表少两行，操作日志最上两笔删除
2. `user` 没有勾选列
3. 两个窗口都登录 `vben`，A 锁屏，B 也锁；B 解锁，A 也开
4. A 退出再登 `admin`，B 应变成 admin 会话（侧栏仍是全菜单）

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 批量删除仍是多次单条写成功后再记日志。不要先记再删。
- persist 改 localStorage，别的标签内存不会自己变。BroadcastChannel 只喊一声「去读盘」。
- 锁屏 broadcast，清会话不要再发一条 unlock。对端走 `clear-session` 就够。
- 接会话后要 `syncAccessRoutes`。只改 token、不重挂路由，会指着上一账号的菜单。

## 下一轮从哪里开始

核心可以停。若还要加快，把边角打包，不要再拆成「一条离线条 / 一次 abort」：

1. 登录页改 antd Form / 页签右键 / 改密（收益仍小，继续不做除非点名）
2. 表格排序 persist、部门/角色批量，仍是边角
3. i18n、第二套皮肤、`@core`、Turbo、Vue 3.6 —— 不做

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
