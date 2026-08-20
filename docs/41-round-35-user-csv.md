# 41 · 第 35 轮：用户 CSV 导出

日期：2026-08-20。

## 本轮结论

用户页加了「导出」。按**当前筛选**拉列表，最多 100 条（和列表接口 pageSize 上限一致）。超过会 warning，不会假装导出了全表。

文件是 UTF-8 CSV，带 BOM，Excel 才能认中文。单元格若以 `= + - @` 开头会加撇号，避免表格软件当成公式。不上 xlsx / exceljs。

谁能进用户页谁就能导出，不再单开 `user:export`。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| xlsx / exceljs / file-saver | **否**。`Blob` + `<a download>` |
| 导出当前页还是筛选结果 | **筛选结果**，上限 100 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/views/users/csv.ts
apps/web/src/views/UsersView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 打开用户，点导出，得到 `users-YYYYMMDD.csv`，能用 Excel / 记事本打开，中文不乱码
2. 筛部门后再导出，文件里只有该部门（含下级）的人
3. 表里只有 12 条种子时，提示「已导出 12 条」，没有「只导出了前 100 条」

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 列表分页和导出不是同一份数据。导出当前页会让人以为文件就是全部。要么导出筛选全集，要么把上限写在按钮旁边。
- CSV 看起来无害。`=cmd|' /C calc'!A0` 这类单元格能在 Excel 里跑命令。导出用户输入前要处理公式前缀。
- BOM 不是「更标准的 UTF-8」，是迁就 Excel。记事本 / 程序读文件时会看到 `\uFEFF`。
- `<a download>` 只对同源 blob 可靠。跨域 URL 常常被忽略文件名。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
