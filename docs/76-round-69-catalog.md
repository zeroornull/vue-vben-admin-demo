# 76 · 第 69 轮：bun catalog

日期：2026-08-21。

二期第一刀。只收会重复出现的核心版本，不拆包，不加皮肤。

## 本轮结论

根 `package.json` 的 `workspaces` 从数组改成对象：`packages` 仍是 `apps/*`，旁边加 `catalog`。`apps/web` 里 `vue` / `vue-router` / `pinia` / `vite` / `typescript` / `vue-tsc` / `@vitejs/plugin-vue` 写成 `"catalog:"`。

范围沿用 app 里原来的声明（`vue` 仍是 `^3.5.40`），没有借机升级。`bun.lock` 解析结果还是 Vue **3.5.41**、Vite **8.2.1**。antd、echarts、axios 仍写在 app 里。

第 2 轮说过「先跑通再收 catalog」，这一轮才落地。第 1 轮决策表里「catalog 已具备」提前了，以本轮为准。

## 依赖清单（先列再决定）

| 项 | 决定 |
| --- | --- |
| catalog 收核心 7 个 | **是**。后面拆包、第二套皮肤共用同一条版本线 |
| 把旧仓上百行 catalog 贴过来 | **否** |
| antd / echarts / axios 进 catalog | **否**。只有一个 app 在用 |
| `packages/*` | **否**。第 70 轮 |
| 升 Vue 3.6 | **否** |

## 关键文件

```text
package.json
apps/web/package.json
bun.lock
```

## 怎么验收

```bash
bun install
```

1. `apps/web/package.json` 里 `vue` 是 `catalog:`，不是 `^3.5.40`
2. 根 catalog 有且只有那 7 个键
3. `bun.lock` 的 `workspaces["apps/web"]` 同样是 `catalog:`，顶部有 `"catalog"` 段

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

页面不该有任何变化。改版本以后只动根 catalog，再 `bun install`。

## 学习笔记

- Bun 的 workspace 数组只表示「有哪些包」。要写 catalog，必须改成对象：`packages` + `catalog`。漏掉 `packages` 会丢掉 `apps/web`。
- 子包写 `"vue": "catalog:"`，版本只出现在根上。和 pnpm 的 `catalog:` 协议同名。
- catalog 里放的是**范围**，锁文件才钉死 patch。本轮范围没改，所以 `bun install` 报 `no changes`。
- `bun add --filter @app/web vue` 仍可能对不上 workspace 包名。加核心依赖：先改根 catalog，app 里写 `catalog:`，再在根执行 `bun install`。

## 下一轮从哪里开始

第 70 轮：`packages/` 薄拆。先搬 `@app/access`、`@app/request`、`@app/tables`。views / layouts / mock 留在 app。路线见 [75](./75-phase-2-roadmap.md)。
