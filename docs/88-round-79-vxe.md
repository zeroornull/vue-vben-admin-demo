# 88 · 第 79 轮：默认用户表换 vxe-table

日期：2026-08-21。

## 做了什么

只换 `apps/web` 的用户表。筛选、弹窗、CSV、权限、mock 仍是原来的。部门 / 角色 / 外链 / 日志仍是 antd Table。`apps/web-ele` 不动。

排序值仍是共享的 `ascend` / `descend`。vxe 表头是 `asc` / `desc`，在 `apps/web/src/tables/vxe-sort.ts` 里转换，不改 `@app/tables`。

第 8 轮「不上 vxe-table」收窄为「非用户表默认不上」。

## 装了什么

| 包 | 锁定 | 用途 |
| --- | --- | --- |
| `vxe-table` | 4.20.12 | 用户表 |
| `vxe-pc-ui` | 4.17.13 | 开源配套 UI / 主题。vxe 4.7 之后拆出来的，不是商业套件 |

没有 `vxe-design`、没有甘特、没有付费插件。没有 `app.use` 全量注册。样式和组件只从用户页那条链路引进来。

## 刻意没做

- 不换另外四张表
- 不用 vxe 自带导出 / 工具栏代替现有 CSV 和列选择
- 不上 Naive / TDesign

## 验收

用户表筛选、排序、列显隐、批量删除、导入导出仍过。页签刷新不丢每页条数和排序。`bun run dev` 仍是 `@app/web`。

## 下一轮从哪里开始

第 80 轮已做，见 [89-round-80-naive.md](./89-round-80-naive.md)。下一轮是第 81 轮 TDesign。
