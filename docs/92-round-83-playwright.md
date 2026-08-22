# 92 · 第 83 轮：Playwright + 自动 CI

日期：2026-08-22。

## 做了什么

给默认 `@app/web` 加了 Playwright 烟测，四条：

1. `vben` 登录成功
2. 连错 3 次出现锁定文案
3. `vben` 新建用户
4. `user` 打开 `/users` 落到 403

e2e 起的是 `vite dev`，不是 `vite preview`。mock 仍是现有 Vite 插件，没有第二套后端。antd 两字按钮无障碍名中间会插空格（「登 录」），选择器用 `/登\s*录/`。

`.github/workflows/ci.yml` 恢复自动跑：`pull_request` 和 `push` 到 `master` 会走 `ci` + `e2e` 两个 job。`workflow_dispatch` 还在。`e2e` 单独装 Chromium，缓存 `~/.cache/ms-playwright`。

## 装了什么

| 包 | 锁定 | 用途 |
| --- | --- | --- |
| `@playwright/test` | 1.62.1 | 只测 `@app/web` |

没有进 catalog。没有进 Turbo 的 `test` 任务。`bun run test` 仍是 Vitest。

## 刻意没做

- 不测 ele / naive / tdesign / antdv-next
- 不跑 Firefox / WebKit
- 不在每个实验分支 push 时跑浏览器（只保护 `master` 和 PR）
- 不写第二套 mock
- 不把 Vue 默认改成 3.6（第 84 轮）

## 怎么开

```bash
bun run test:e2e
```

本机第一次要先装浏览器：`bunx playwright install chromium`。

## 验收

本地 `bun run test:e2e` 四条绿。PR 上能看到 `ci` 和 `e2e` 两个 job。前面四套皮肤不回退。

## 下一轮从哪里开始

第 84 轮已做，见 [93-round-84-vue36-vapor.md](./93-round-84-vue36-vapor.md)。默认仍锁 3.5。
