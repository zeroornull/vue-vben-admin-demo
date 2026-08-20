# 29 · 第 23 轮：个人中心

日期：2026-08-20。

## 本轮结论

`/profile` 是静态 layout 子路由：登录即可，不进侧栏，不进角色勾选。入口只在用户菜单。

看的是**当前会话**（`userInfo`），不是系统用户表里的 Alice / Bob。不能改显示名，不能改密码。mock 账号共用 `123456`。

页签白名单从写死 `home` 改成 `staticLayoutNames()`。否则打开个人中心会被 `prune` 掉。

登录页 Form、页签右键仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 个人中心改密 / 头像上传 | **否** |
| 把 profile 做成 menuCode | **否**。自己看自己的会话，不要业务角色批准 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/views/ProfileView.vue
apps/web/src/views/profile/query.ts
apps/web/src/router/routes.ts
apps/web/src/layouts/UserMenu.vue
apps/web/src/layouts/BasicLayout.vue
apps/web/src/icons/menu-icons.ts
```

面包屑是 `工作台 / 个人中心`。页签用 `profile` 图标。

## 怎么验收

```bash
bun run dev
```

1. `vben` 点用户菜单「个人中心」：账号、两层角色、菜单、操作都在
2. 侧栏没有「个人中心」
3. 换 `user` 登录也能进 `/profile`，直接打开 `/users` 仍是 403
4. 页签能关掉；关掉再从菜单进，页签回来
5. 角色表单的菜单勾选里没有「个人中心」

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- `hideInMenu` 只藏侧栏，不藏路由。守卫仍按 catalog 认这条路径。
- 静态页要进页签白名单。白名单若只抄侧栏，藏起来的页一打开就被 prune。
- 登录账号和系统用户是两张表。个人中心写错数据源，会以为能改 Alice 的密码。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 个人中心改显示名（要先分清会话字段和系统用户表）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
