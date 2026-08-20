# 72 · 第 66 轮：角色 / 外链 / 日志列显隐

日期：2026-08-20。

这一轮打包三张表的列开关。用户表第 43 轮就有了，另外三张分页表跟上。部门是树，和分页那轮一样不挂。

## 本轮结论

角色、外链、操作日志查询旁边加了「列」。锁定列关不掉：角色名称、外链名称、日志时间。操作列跟权限走，不进开关。勾选写进 `table-columns` persist，各表分开。恢复默认把可选列全部打开。

这只改表格怎么画。导出 / 导入仍是完整列，避免「表上看不见就以为文件里没有」。旧版只存 `users` 数组，读的时候还认；写过一次就变成按表一张图。登录页 Form、页签右键、改密、日志导入仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 部门树也挂列开关 | **否**。没有分页，和 `table-page` / `table-sort` 同一批键 |
| 拖拽改列顺序 | **否**。只要显隐 |
| 写进全局 preferences | **否**。还是 `table-columns` |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/tables/columns.ts
apps/web/src/stores/table-columns.ts
apps/web/src/components/TableColumnPicker.vue
apps/web/src/views/RolesView.vue
apps/web/src/views/LinksView.vue
apps/web/src/views/AuditView.vue
```

用户页的列面板改成同一个组件。显隐规则收到 `tables/columns.ts`。

## 怎么验收

```bash
bun run dev
```

1. `vben` 角色页关掉编码和备注，表少两列，角色名称还在；刷新仍少
2. 外链关掉地址，导出 CSV 里仍有地址列
3. 操作日志关掉摘要，时间列还在；恢复默认五列回来
4. 用户页以前关掉的备注，刷新后仍关着

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 四张表的开关规则一样：锁定列、可选列、操作列。差别只在「锁哪一列、可选哪些」。不要再抄三份 `normalizeUserColumns`。
- persist 换形状时，旧 key 还要能读一轮。只存新对象、丢掉 `users`，老用户刷新会看见自己关过的列又回来。
- 列开关和导出不是同一份数据。屏幕上少一列，文件仍是完整行，才不会把「我不看」当成「没有」。

## 下一轮从哪里开始

核心可以停。有意义的表能力也齐了。若还要加快，把边角打包，不要再拆成单点 chrome：

1. 登录页改 antd Form / 页签右键 / 改密（收益仍小，继续不做除非点名）
2. 操作日志导入、部门树列开关 —— 不做，除非点名
3. i18n、第二套皮肤、`@core`、Turbo、Vue 3.6 —— 不做

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
