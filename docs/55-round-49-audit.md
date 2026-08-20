# 55 · 第 49 轮：操作日志

日期：2026-08-20。

## 本轮结论

系统里多了只读页「操作日志」。用户 / 部门 / 角色的新建、修改、删除，以及改显示名，成功后记一笔：谁、何时、对什么、摘要。不能改、不能删。最多 100 条，超出丢掉最旧的。

默认只有 `biz-admin`（`vben` / `admin`）有这个菜单。编辑和访客没有。GET 列表仍是登录就能调，和用户列表一样，进页靠 `menuCode`。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 完整审计中心 / 导出 / 回放 | **否**。一张表 |
| 记每次登录和失败锁定 | **否**。只记业务写操作 |
| 写进 localStorage | **否**。跟其他 mock 一样在 Vite 进程里 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/views/audit/query.ts
apps/web/src/views/AuditView.vue
apps/web/src/access/catalog.ts
apps/web/vite/audit-store.ts
apps/web/vite/mock-api.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 打开操作日志，能看到两条种子
2. 用户页新建一个人，回到日志，最上面是「新建用户「…」」，操作者是 `vben`
3. `user` 侧栏没有这项；直接打开 `/audit` 到 403
4. 角色里能给编辑勾上「操作日志」

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 日志是旁路记录。CRUD 函数自己不写日志，mock 在写成功之后再记。失败的请求不该留下半条。
- 删除要先读出名字再删。删完再找，名字没了。
- 没有 `audit:*` 操作码。只读页用菜单码就够。不要为了「能看」再造一套按钮权限。
- 这和第 47 轮通知不同：通知是系统推给你的消息；日志是事后账本。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
