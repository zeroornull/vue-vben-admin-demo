# 79 · 第 72 轮：Turbo

日期：2026-08-21。

二期第四刀。拆包之后缓存才有对象，现在才上编排。

## 本轮结论

根加 `turbo.json`。`lint` / `test` / `typecheck` / `build` 改成 `turbo run`。`dev` 和 `preview` 仍是 `bun run --filter @app/web …`。

`transit` 任务只走路图，不跑脚本。lint / test / type-check 都依赖它，五个包可以并行，改 `@app/tables` 仍会带上 `@app/web`。`^lint` 那种写法会把叶子包排成串，这里不用。

装了 `turbo@2.10.11`。没有 `turbo-run`。没有用 Turbo 换 Bun workspace。CI 还是手动 `workflow_dispatch`，只是里面的四条命令现在走 turbo。

第 6 轮「不上 Turbo」在这一轮作废，见 [03](./03-migration-roadmap.md) 决策表。

## 依赖清单（先列再决定）

| 项 | 决定 |
| --- | --- |
| 根 `turbo.json` | **是** |
| `dev` 走 turbo | **否**。热更新收益小，还多一个守护进程 |
| `turbo-run` 交互选 app | **否**。现在一个 app |
| 远程缓存 | **否** |
| 新 npm | `turbo` 一个 |

## 关键文件

```text
turbo.json
package.json
```

## 怎么验收

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

1. 再跑一次 `bun run test`，五行都是 cache hit（FULL TURBO）
2. 改 `packages/tables/src` 再 `bun run test`：`@app/tables` 和 `@app/web` miss，另外三个 hit
3. `bun run dev` 仍直接起 Vite，不经 turbo

本机刚验过：第二次 test 5/5 cached；摸了 tables 之后 3 cached / 2 miss。

## 学习笔记

- 根脚本才写 `turbo run`。包里的 `test` / `lint` 仍是 vitest / oxlint / tsc，避免套娃。
- `build` 只有 `@app/web` 有脚本。库包是源码直接被 Vite 吃，不必假造 `dist`。
- `.turbo/` 已经在 `.gitignore` 里。

## 下一轮从哪里开始

第 73 轮已做，见 [80-round-73-i18n.md](./80-round-73-i18n.md)。下一轮是第 74 轮 Iconify。
