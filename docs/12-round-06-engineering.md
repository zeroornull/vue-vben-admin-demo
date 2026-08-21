# 12 · 第 6 轮：工程化

日期：2026-08-19。

## 本轮结论

单 app 阶段的质量门装齐了：**oxlint**（只这一套 lint）、**Vitest**（19 个用例全过）、**GitHub Actions CI**。不上 Turbo、不上 ESLint / Prettier / Stylelint。

把守卫和请求里的判断抽成纯函数，测试不挂整个 Vue 应用。

## 决策

| 议题 | 决定 | 原因 |
| --- | --- | --- |
| lint | 只上 oxlint | 路线写明不要 eslint + oxlint + stylelint 叠三套 |
| format | 先不上 | 单人小仓，编辑器保存即可；要统一再加 oxfmt |
| 测试 | Vitest + happy-dom | 和 Vite 8 同族；覆盖守卫 / 菜单 / 请求 |
| 编排 | 不上 Turbo | 只有 `@app/web`，`bun run --filter` 够用 |
| CI 安装 | `bun ci` | 冻结 `bun.lock`，对应旧仓的 `--frozen-lockfile` |

## 真实装上的版本

| 包 | 锁定 |
| --- | --- |
| vitest | 4.1.11 |
| happy-dom | 20.11.2 |
| axios-mock-adapter | 2.1.0 |
| oxlint | 1.79.0 |

## 测了什么

- `decideAccess`：未登录跳转、公开路由、已登录进登录页、redirect、拉用户、拉取失败清会话、角色 403
- `canSeeRoute`：无 title、hideInMenu、角色过滤
- `unwrapBody` + axios 拦截器：带 token、业务 code、HTTP 401 清会话

为了测 401，`@/router` 在测试里 mock 掉，避免真去 `replace`。

## 怎么跑

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

CI：第 6 轮曾关掉 push / PR 自动跑。第 83 轮已恢复：`pull_request` + `push` 到 `master` 会跑 `ci` 和 `e2e` 两个 job。见 [92-round-83-playwright.md](./92-round-83-playwright.md)。

## 学习笔记

- 拦截器和守卫里若直接 `useRouter()` / `window`，单测会变成集成测试。先抽 `decideAccess` / `unwrapBody`，页面仍走原来的 `setupAccessGuard`。
- CI 里的 `bun ci` 是「按锁文件安装」，不是 `package.json` 的 `test` 脚本。不要把脚本也起名叫 `ci`，会混。
- 旧仓用 Turbo 是因为几十个包。现在一个 app，加 Turbo 只多一个配置面。

## 路线完成到这里

第 1–6 轮的骨架已经齐：归档、脚手架、登录、壳子、工作区、工程化。第 7 轮已加分析页和 ECharts，见 [13-round-07-analytics.md](./13-round-07-analytics.md)。后面若继续，是表单/表格页前的组件库选择，而不是再铺一层工具链。
