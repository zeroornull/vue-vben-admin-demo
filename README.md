# Vue Admin（Bun + TypeScript + Vue）

本仓库正在从 **Vue Vben Admin 5.7.0**（pnpm + Turbo 单体仓）迁移到 **Bun + TypeScript + 最新 Vue 依赖**。

## 当前目录

| 路径 | 作用 |
| --- | --- |
| [`docs/`](./docs/README.md) | 迁移与学习文档；`bun run docs` 开 VitePress |
| [`apps/web`](./apps/web) | 默认 app（ant-design-vue） |
| [`apps/web-ele`](./apps/web-ele) | 第二套 app（Element Plus，第 75–77 轮） |
| [`apps/web-naive`](./apps/web-naive) | 第三套 app（Naive UI，第 80 轮） |
| [`apps/web-tdesign`](./apps/web-tdesign) | 第四套 app（TDesign Vue，第 81 轮） |
| [`apps/web-antdv-next`](./apps/web-antdv-next) | 第五套 app（antdv-next，第 82 轮） |
| [`packages/`](./packages) | `@app/access` / `@app/core` / `@app/mock` / `@app/request` / `@app/tables` |
| `legacy/` | 原 Vben 完整源码，仅作本地对照，已被 `.gitignore` 忽略 |

## 先读文档

从 [`docs/README.md`](./docs/README.md) 开始，按编号阅读。

## 开发

```bash
bun install
bun run dev
# Element 皮肤：bun run dev:ele
# Naive 皮肤：bun run dev:naive
# TDesign 皮肤：bun run dev:tdesign
# antdv-next 皮肤：bun run dev:antdv-next
# 学习文档：bun run docs
```

构建与类型检查：`bun run build`、`bun run typecheck`。质量门：`bun run lint`、`bun run test`。默认 app 的 e2e：`bun run test:e2e`。

## 已完成轮次

1. 旧仓移入 `legacy/`，并写第一轮文档
2. 用官方 `create-vue` 初始化 `apps/web`，根目录套 Bun workspace
3. 登录闭环：mock 账号、守卫、前端角色、刷新保持登录
4. 布局壳：侧栏菜单按角色过滤，顶栏 + 内容区
5. 工作区业务页：本地卡片，未引入 ECharts / 组件库
6. 工程化：oxlint、Vitest；CI 工作流保留但已停自动跑
