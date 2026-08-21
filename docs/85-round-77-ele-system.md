# 85 · 第 77 轮：ele 其余系统页

日期：2026-08-21。

## 做了什么

`apps/web-ele` 用 Element Plus 重写了部门树、角色、外链、操作日志及其弹窗。筛选、树展开、分页、排序、列显隐、CSV、权限和 mock 与 antd 同一套 query。

角色弹窗的菜单 / 操作勾选仍走 `@app/access` 的 `grantParentMenus` / `dropActionsForMenu`。改完角色后刷新当前会话路由，和 antd 一样。

## 刻意没做

- 不抽万能表单 / Table，不为第 80–82 轮提前抽象。
- 不改 CSV、权限码、mock 种子。
- 不上 vxe、Naive、TDesign。

## 验收

`vben` 能改部门树和角色勾选。`user` 在 ele 里仍只有工作区 / 分析 / 内嵌。`apps/web` 不回退。

## 下一轮从哪里开始

第 78 轮已做，见 [87-round-78-vitepress.md](./87-round-78-vitepress.md)。下一轮是第 79 轮 vxe-table。
