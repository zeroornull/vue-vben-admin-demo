# 86 · 二期 / adapter

日期：2026-08-21。

这是给第二套皮肤之后的专章，不是再写一份 Element 教程。页面怎么筛、怎么校验，仍看各轮记录。

## 核和皮肤怎么分

`@app/core` 只有 token 和注册表：主题、密度、色弱、语言，以及 `registerSkin` / `getSkin` / `requireSkin`。核包不依赖 `vue`，也不依赖任何 UI 库。组件位的类型是 `object`。

每套 app 自己注册：

| app | 入口 | 实现 | 页面外壳 |
| --- | --- | --- | --- |
| `@app/web` | `initAntdSkin()` | `apps/web/src/adapter/antd.ts` | `AntdPage` |
| `@app/web-ele` | `initElementSkin()` | `apps/web-ele/src/adapter/element.ts` | `ElePage` |

Adapter 现在只保证：Form / Input / Modal、`message`、`confirm`、`controlSize(density)`。Table、TreeSelect、上传不在核里。

页面仍直接 `import` 自己的 UI 库。不要为了共用把 antd 的 `UsersView` 改成 `requireSkin()`。

## 第二套皮肤实际踩过的路

第 75–77 轮按这个顺序，Naive / TDesign / antdv-next 可以各用一轮抄：

1. **空壳 + 登录**：新 Vite app，注册 adapter，抽或共用 mock，不要从 `@app/web` 引 `.vue`。
2. **用户表 + 改密**：同一套 query / CSV / 权限 / mock，只换表格和弹窗。
3. **其余系统页**：部门树、角色勾选、外链、日志。

不要一周开四个 app。不要为演示做「五种皮肤切换器」。

## 排序和树

`@app/tables` 的排序值是 antd 的 `ascend` / `descend`。Element 表头是 `ascending` / `descending`，在 `apps/web-ele/src/tables/element-sort.ts` 里转换，不改共享包。部门树给 `ElTreeSelect` 时把 `title` 改成 `label`。

## 文档约定

本站就是这份 `docs/`。不按皮肤复制五本教程。不搬 `legacy/docs`（那是 Vben 官方站）。新皮肤只在本页和该轮短记录里交代差异。

## 相关记录

- 薄核：[78-round-71-core.md](./78-round-71-core.md)
- 二期路线：[75-phase-2-roadmap.md](./75-phase-2-roadmap.md)
- Element 拆轮：[82-ele-split.md](./82-ele-split.md)
- ele 三轮：[83](./83-round-75-ele-shell.md) / [84](./84-round-76-ele-users.md) / [85](./85-round-77-ele-system.md)
