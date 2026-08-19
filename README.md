# Vue Admin（Bun + TypeScript + Vue）

本仓库正在从 **Vue Vben Admin 5.7.0**（pnpm + Turbo 单体仓）迁移到 **Bun + TypeScript + 最新 Vue 依赖**。

## 当前目录

| 路径 | 作用 |
| --- | --- |
| [`docs/`](./docs/README.md) | 迁移与学习文档（按轮次推进） |
| [`apps/web`](./apps/web) | Vue + TS 应用（登录 + 布局壳 + 工作区） |
| `legacy/` | 原 Vben 完整源码，仅作本地对照，已被 `.gitignore` 忽略 |

## 先读文档

从 [`docs/README.md`](./docs/README.md) 开始，按编号阅读。

## 开发

```bash
bun install
bun run dev
```

构建与类型检查：`bun run build`、`bun run typecheck`。

## 已完成轮次

1. 旧仓移入 `legacy/`，并写第一轮文档
2. 用官方 `create-vue` 初始化 `apps/web`，根目录套 Bun workspace
3. 登录闭环：mock 账号、守卫、前端角色、刷新保持登录
4. 布局壳：侧栏菜单按角色过滤，顶栏 + 内容区
5. 工作区业务页：本地卡片，未引入 ECharts / 组件库
