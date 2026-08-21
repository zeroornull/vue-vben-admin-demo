# 84 · 第 76 轮：ele 用户表 + 改密

日期：2026-08-21。

## 做了什么

`apps/web-ele` 用 Element Plus 重写了用户表、用户弹窗、个人中心改密。筛选、分页、排序、列显隐、CSV 导入导出、批量删除、未保存离开，行为和 antd 同一套 query / mock / 权限。

Element 的表头排序是 `ascending` / `descending`，在 `src/tables/element-sort.ts` 里换成共用的 `ascend` / `descend`，不改 `@app/tables`。部门树给 `ElTreeSelect` 用时把 `title` 改成 `label`。

## 刻意没做

- 部门 / 角色 / 外链 / 日志仍是 `SoonView`。
- 不上 vxe。
- 不把 antd 的 UsersView 改成 `requireSkin()`。
- 不改 CSV、权限码、mock 种子。

## 验收

`vben` 能开用户表、能改自己的显示名和密码。`user` 没有用户菜单。`apps/web` 不回退。

## 下一轮从哪里开始

第 77 轮已做，见 [85-round-77-ele-system.md](./85-round-77-ele-system.md)。下一轮是第 78 轮 VitePress。
