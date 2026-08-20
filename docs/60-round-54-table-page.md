# 60 · 第 54 轮：表格每页条数

日期：2026-08-20。

## 本轮结论

用户、角色、外链、操作日志四张表的「每页条数」写进 `table-page` persist。只允许 10 / 20 / 50 / 100。各表分开：用户改成 50，角色还是 10。页码不记——数据一变，第 5 页可能是空的。改条数时回到第 1 页。

没有写进全局 `preferences`，也没有并进 `table-columns`。列显隐和分页密度是两件事。部门是树表，没有分页，不挂。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 记当前页码 | **否**。只记 pageSize |
| 四张表共用一个数 | **否**。按表键 |
| 任意整数 | **否**。四档 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/tables/page-size.ts
apps/web/src/stores/table-page.ts
apps/web/src/views/UsersView.vue
apps/web/src/views/RolesView.vue
apps/web/src/views/LinksView.vue
apps/web/src/views/AuditView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 用户表改成每页 20，刷新仍是 20，页码是 1
2. 角色表仍是每页 10
3. 用户表翻到第 2 页再改成 50，回到第 1 页
4. 部门树没有每页条数

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 页码依赖「现在有多少行」。persist 页码会在筛选、删除之后落到空页。
- pageSize 是离散档，不是任意数字。persist 里出现 15 就回 10。
- 改 pageSize 时把 page 置 1。antd 有时也会这么发，自己算更稳。
- 列显隐（第 43 轮）管「画哪些列」，这条管「一次取几行」。不要塞进同一个 store 名字里让人误会。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
