# 87 · 第 78 轮：VitePress

日期：2026-08-21。

## 做了什么

用现有 `docs/*.md` 做站点。配置在 `apps/docs/.vitepress/`，`srcDir` 指回 `docs/`。workspace 包是 `@app/docs`。根脚本 `bun run docs`，构建 `bun run docs:build` 或跟着 `bun run build`。产物在 `apps/docs/dist`（`outDir` 显式指定，方便 Turbo 缓存）。

侧栏按入门 / 第一期分组 / 二期编好。加了 [86-adapter.md](./86-adapter.md)。没有搬 `legacy/docs`，没有按皮肤复制教程。

VitePress 用 1.6 最新稳定，自带 Vite 5，不跟 catalog 里的 Vite 8 绑在一起。根 `package.json` 也写了 `vue: catalog:`，因为 markdown 在 `docs/`，SSR 要从仓库根解析 `vue/server-renderer`。

## 怎么开

```bash
bun run docs
```

默认 http://localhost:5175/ 。

## 验收

首页能点到总览和本页。`apps/docs/dist` 能构建出来。`apps/web` / `web-ele` 四项检查不回退。

## 下一轮从哪里开始

第 79 轮：默认 app 的用户表换成 vxe-table。见 [75-phase-2-roadmap.md](./75-phase-2-roadmap.md)。
