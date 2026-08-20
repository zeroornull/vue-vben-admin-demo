# 65 · 第 59 轮：表格排序 + 日志日期

日期：2026-08-20。

这一轮打包两件边角。核心迁移上一轮已经齐了。

## 本轮结论

用户、角色、外链、操作日志四张表可以点列头排序，写进 `table-sort` persist。各表分开：用户按创建时间降序，角色还是默认顺序。只允许登记过的列。取消排序就清掉。改排序时回到第 1 页。页码仍不记。

排序发生在筛选之后、分页之前，所以翻页看到的是整份结果的顺序，不是当前页再排一次。

操作日志多了「从 / 到」两个原生日期框。按 `at` 的日历天筛。起止反了会自动对调。日期不 persist，刷新就没了，和操作者筛选一样。不上 dayjs。部门树仍没有分页和排序。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 记当前页码 | **否**。只记排序 |
| 记日期范围 | **否**。查询条件，和操作者一样 |
| 四张表共用一套排序 | **否**。按表键 |
| 任意列都能排 | **否**。每张表白名单 |
| antd DatePicker / dayjs | **否**。原生 `input type=date` |
| 新 npm 包 | **零** |

## 允许排序的列

| 表 | 列 |
| --- | --- |
| 用户 | `name` / `createTime` / `status` |
| 角色 | `name` / `code` / `createTime` / `status` |
| 外链 | `title` / `code` / `createTime` / `status` |
| 日志 | `at` / `actor` |

## 关键文件

```text
apps/web/src/tables/sort.ts
apps/web/src/stores/table-sort.ts
apps/web/src/views/users/query.ts
apps/web/src/views/roles/query.ts
apps/web/src/views/links/query.ts
apps/web/src/views/audit/query.ts
apps/web/src/views/UsersView.vue
apps/web/src/views/RolesView.vue
apps/web/src/views/LinksView.vue
apps/web/src/views/AuditView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 用户表点「创建时间」降序，刷新后箭头还在，第一页是最新的
2. 角色表没有跟着变成同一列
3. 用户表翻到第 2 页再改排序，回到第 1 页
4. 操作日志把「到」设成种子里较早那天，只剩那天的行
5. 部门树没有排序箭头

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- persist 排序，不要 persist 页码。数据一变，第 5 页可能是空的；排序只是「这一列怎么排」。
- 先筛再排再切页。只排当前页，翻页会跳。
- antd Table 的 `@change` 会同时带分页和 sorter。排序变了自己把 page 置 1，不要信当时的 `pagination.current`。
- sorter 可能是数组。只取第一项。第三次点击通常是取消：有 field、没有 order，persist 写成 `null`。翻页时如果没带 field，保住当前排序，不要当成取消。
- `sortOrder` 写回列配置，刷新后箭头才在。只 persist 不回填，看起来像没记住。
- 日期框用浏览器日历。`YYYY-MM-DD` 对就行，不必为两个框拉 dayjs。
- `at` 是 `2026-08-20 09:10:00`，取前 10 个字符当天。不要把时分秒拿去和日期比。
- 起止反了就对调。用户填错日期不该得到空表。
- 列显隐、每页条数、排序是三件事。不要塞进同一个 store 名字里让人误会。

## 下一轮从哪里开始

核心可以停。若还要加快，把边角打包，不要再拆成单点 chrome：

1. 登录页改 antd Form / 页签右键 / 改密（收益仍小，继续不做除非点名）
2. 角色 / 部门 / 外链批量删除、搜索最近项，仍是边角
3. i18n、第二套皮肤、`@core`、Turbo、Vue 3.6 —— 不做

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
