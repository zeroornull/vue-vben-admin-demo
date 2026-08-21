# 00 · 目标与边界

## 我们在迁什么

仓库根目录原本是完整的 **Vue Vben Admin 5.7.0** 单体仓：

- 包管理：`pnpm@11.16.0` + `pnpm-workspace.yaml` catalog
- 任务编排：`turbo`
- 语言：TypeScript（catalog 里是 `typescript@^6.0.3`）
- 框架：`vue@^3.5.40`、`vue-router@^5.2.0`、`pinia@^4.0.2`
- 构建：`vite@^8.2.1`
- 多套 UI 皮肤：Ant Design Vue / Element Plus / Naive UI / TDesign，外加 playground 与 VitePress 文档

第 1 轮已把这份源码整体挪到 `legacy/`，并用 `.gitignore` 忽略。根目录从这一轮起只放**新栈文档**和后续的 Bun 工程。

## 目标栈（冻结到 2026-08-19 的调研）

| 层 | 旧仓（legacy） | 新仓目标 |
| --- | --- | --- |
| 包管理 / 运行时 | pnpm 11 + Node 22/24 | **Bun ≥ 1.3.14**（包管理 + 脚本运行；构建仍用 Vite） |
| 语言 | TypeScript 6 | TypeScript 最新稳定版（与 Vue 官方类型对齐后再锁） |
| UI 框架 | Vue 3.5.40 | **Vue 最新稳定版 3.5.41**；3.6 RC（Vapor / alien-signals）只做实验，不作为默认运行时 |
| 路由 | vue-router 5.2 | 跟随 Vue 生态最新稳定版 |
| 状态 | Pinia 4 + persistedstate | 同上，先保持 Pinia，不换别的 store |
| 构建 | Vite 8 + 自研 `@vben/vite-config` | Vite 最新稳定版，配置从自研包收成「够用即可」 |
| 单体仓 | pnpm workspace + catalog + Turbo | Bun workspaces + catalog；`dev` 用 `--filter`，第 72 轮起 lint/test/typecheck/build 走 Turbo |
| 应用形态 | 5 个皮肤 app + mock + playground | **一个 `apps/web`**。文档和代码都不复制五套 UI；对照只看 `legacy/apps/web-antd` |

「最新 Vue 依赖」在本项目里的定义：

1. **默认跟 `latest` 稳定标签**（当前是 3.5.41），不跟 `rc`。
2. 与 Vue 同发的配套包（`@vitejs/plugin-vue`、`vue-tsc`、`@vue/shared`）锁到同一小版本线。
3. 每个依赖升级轮次在文档里记一笔「为什么升 / 卡了什么」。

## 为什么不整仓原地改 pnpm → bun

旧仓不是「一个 Vite 应用」，而是：

- 30+ workspace 包（`apps/*`、`packages/*`、`packages/@core/*`、`packages/effects/*`、`internal/*`、`scripts/*`、`docs`、`playground`）
- catalog 统一版本 + `workspace:*` 互引
- `preinstall: only-allow pnpm`，强绑定 pnpm
- Turbo pipeline、lefthook、oxlint/oxfmt、自研 `vsh` / `turbo-run`
- 多皮肤 adapter（同一套 layouts/form，换 UI 实现）

原地替换包管理器，会同时踩：生命周期脚本、catalog 语法差异、Turbo 缓存、lint 工具链、文档站。这不是迁移，是一次不可回滚的大爆炸。

正确姿势：

1. **冻结旧仓**（本轮：`legacy/` + ignore）
2. **第 2 轮用官方 `create-vue` 生成 app**，再用 Bun workspace 包一层（不要手写 Vite/Vue 配置）
3. **按能力切片从 legacy 往外搬**（路由 / 请求 / 权限 / 偏好 / 布局 / 业务页）
4. 每一轮都能 `bun run dev` 看到结果，再谈下一刀

## 本轮交付

- [x] `legacy/` 存放完整旧仓
- [x] 根 `.gitignore` 忽略 `legacy/`
- [x] `docs/` 第一轮文档（盘点、架构、路线、学习、命令对照、执行记录）
- [x] 新的 `package.json` / `bun.lock` —— 第 2 轮已用 `create-vue` + Bun workspace 落地

## 非目标（先写死，避免范围膨胀）

- 不在本轮安装依赖、不启动旧仓或新仓
- 不把 5 套皮肤一次性搬过来
- 不重写 VitePress 文档站
- 不把 `backend-mock`（Nitro）当成第一优先
- 不在第 2 轮之前引入完整的 `@vben/*` 包图；先扁平，再按痛点拆包
