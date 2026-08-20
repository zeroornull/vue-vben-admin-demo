# 42 · 第 36 轮：用户 CSV 导入

日期：2026-08-20。

## 本轮结论

用户页加了「导入」。只收导出时那份 UTF-8 CSV（带不带 BOM 都行）。表头必须对上。部门和角色按**显示名**反查 id，状态只认「启用 / 禁用」。创建时间列丢掉，由 mock 现写。

导入是写操作：按钮走 `user:create`，每一行再走 `validateUserForm`，再 `POST /system/user`。能进新建弹窗的才能进文件。不新开 `user:import`。不上 xlsx。

不是事务。前面成功的行会留下，后面重名或接口失败记进「跳过」。一次最多 100 条，和导出上限一致。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| xlsx / exceljs / papaparse | **否**。手写 RFC 风格解析 |
| 新操作码 `user:import` | **否**。复用 `user:create` |
| 预览弹窗 / 回滚 | **否**。摘要 toast，已成功的不撤 |

## 关键文件

```text
apps/web/src/views/users/csv.ts
apps/web/src/views/UsersView.vue
apps/web/src/api/system/user.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 先导出一份，改用户名后导入，列表出现新人
2. 把部门改成不存在的名字再导入，toast 写「没有部门…」，表不增行
3. 再导入同一文件，已有用户名走「用户名已存在」，不刷一排红条
4. `user`（访客）没有导入按钮

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 导出转义公式前缀，导入要剥掉，否则 `=1+1` 会变成 `'=1+1`。不要把普通人名里的撇号一并砍掉。
- 文件里的「设计部」不是 id。重名部门后写覆盖先写，种子数据名字不重复。角色名里如果出现顿号，会被拆开。
- 批量创建不要让进度条和错误条闪 100 次。本轮每条请求带 `skipLoadingBar` 和 `skipErrorToast`，失败收进一条 warning。
- `<input type="file">` 选过同一文件再选一次，要先把 `value` 清空，否则 `change` 不来。
- CSV 解析要认引号里的逗号。本轮按单元格状态机读，不按行 `split(',')`。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
