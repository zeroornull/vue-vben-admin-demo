# 83 · 第 75 轮：ele 空壳 + 登录

日期：2026-08-21。

## 做了什么

新建 `apps/web-ele`。`element-plus` + `ElePage` + `adapter/element.ts` 注册进 `@app/core`。登录页用 Element 的 Form / Input。根脚本 `dev:ele`。默认仍是 `bun run dev` → `@app/web`。

Vite mock 抽到 `@app/mock`。两家 app 的 `vite.config` 都从包名引入。校验和种子仍读 `apps/web/src` 里那批纯函数，本轮不把它们再搬一次。

系统表（用户 / 部门 / 角色 / 外链 / 日志）在 ele 里先挂 `SoonView`，侧栏和守卫还在，表格第 76 / 77 轮再写。个人中心只展示会话，不改密。

第 1 轮「先一套皮肤」在 [03](./03-migration-roadmap.md) 决策表改成：默认仍是 antd，第二套 app 从这一轮开始。

## 刻意没做

- 不从 `@app/web` 引 `.vue`。
- 不把 antd 的 UsersView 改成 `requireSkin()`。
- 不抽 `packages/app-shell`。
- 不开 Naive / TDesign。
- 不把 mock 依赖的 query 文件搬出 `apps/web`。

## 怎么开

```bash
bun run dev:ele
```

账号还是 `vben` / `admin` / `user`，密码 `123456`。

## 验收

能登录，能看到工作台和侧栏。`apps/web` 四项检查不回退。

## 下一轮从哪里开始

第 76 轮已做，见 [84-round-76-ele-users.md](./84-round-76-ele-users.md)。下一轮是第 77 轮其余系统页。
