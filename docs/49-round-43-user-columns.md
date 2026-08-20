# 49 · 第 43 轮：用户表列显隐

日期：2026-08-20。

## 本轮结论

用户页查询旁边加了「列」。可选列：部门、业务角色、状态、备注、创建时间。用户名和操作列不能关。勾选写进 `table-columns` persist，刷新还在。恢复默认把可选列全部打开。

这只改表格怎么画。导出 / 导入 CSV 仍是完整六列，避免「表上看不见就以为文件里没有」。不新开操作码。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| vxe-table 列配置 | **否**。antd Table + 过滤 `columns` |
| 写进全局 preferences | **否**。单独 `table-columns` store，以后部门表也能挂 |
| 拖拽改列顺序 | **否**。只要显隐 |

## 关键文件

```text
apps/web/src/views/users/columns.ts
apps/web/src/stores/table-columns.ts
apps/web/src/views/UsersView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 打开用户，列里关掉备注和创建时间，表少两列，用户名还在
2. 刷新仍少这两列
3. 恢复默认，六列回来
4. 关掉备注后再导出，CSV 里仍有备注列

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- `columns` 是数据。显隐是过滤这份数据，不要去改 DOM 或 `display:none` 藏格子。
- persist 的数组要 `normalize`：丢掉未知 key，强制留下锁定列。旧版本存过的脏数据才不会把表抽空。
- 操作列跟权限走，不跟「列」开关走。没有 `user:update` / `user:delete` 时，列面板关不掉操作列，因为操作列根本没渲染。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
