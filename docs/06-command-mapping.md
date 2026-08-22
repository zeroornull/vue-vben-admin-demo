# 06 · 命令对照

旧命令在 `legacy/` 里才有意义（需要自己在 `legacy/` 执行，且该目录未提交）。新命令从第 2 轮起可用，入口在仓库根。

## 包管理

| 目的 | pnpm（旧） | Bun（新） |
| --- | --- | --- |
| 安装 | `pnpm install` | `bun install` |
| CI 冻结锁文件 | `pnpm install --frozen-lockfile` | `bun ci` 或 `bun install --frozen-lockfile` |
| 加依赖 | `pnpm add vue` | `bun add vue` |
| 加 dev 依赖 | `pnpm add -D vite` | `bun add -d vite` |
| 加到指定 workspace | `pnpm add pinia --filter @vben/web-antd` | `bun add pinia --filter @app/web` |
| 删依赖 | `pnpm remove vue` | `bun remove vue` |
| 为什么有这个包 | `pnpm why vue` | `bun why vue` |
| 更新依赖 | `npx taze -r -w`（旧仓脚本） | 先改 catalog，再 `bun install`；或按包 `bun update` |
| 禁止别的包管理器 | `only-allow pnpm` | 不要移植；用 `packageManager` 字段提示即可 |

## 跑脚本

| 目的 | pnpm / turbo（旧） | Bun（新） |
| --- | --- | --- |
| 交互选 app 开发 | `pnpm dev` → `turbo-run` | 默认 `bun run dev`；Element：`bun run dev:ele`；Naive：`bun run dev:naive`；TDesign：`bun run dev:tdesign`；antdv-next：`bun run dev:antdv-next`；Vapor 实验：`bun run dev:vapor` |
| 指定 app 开发 | `pnpm dev:antd` / `pnpm -F @vben/web-antd run dev` | `bun run --filter @app/web dev` |
| 全仓构建 | `pnpm build` → `turbo build` | `bun run build` → `turbo run build` |
| 类型检查 | `pnpm check:type` → `turbo typecheck` | `bun run typecheck` → `turbo run type-check` |
| lint | `pnpm lint` → eslint/oxlint 多套 | `bun run lint` → `turbo run lint`（只有 oxlint） |
| 单测 | `pnpm test:unit` → vitest | `bun run test` → `turbo run test` |
| e2e | `pnpm test:e2e` → Playwright | `bun run test:e2e`（只测 `@app/web`，不进 turbo） |
| CI 安装 | `pnpm install --frozen-lockfile` | `bun ci` |
| 清产物 | `pnpm clean` | 第 2 轮写一个 `rm -rf dist node_modules` 脚本即可 |

## 文档与演示（仅 legacy）

| 目的 | 旧命令 | 新仓 |
| --- | --- | --- |
| 开官方文档站 | `pnpm dev:docs` | 本仓学习记录：`bun run docs`。Vben 官方站仍看 https://doc.vben.pro/ 或 `legacy/docs` |
| playground | `pnpm dev:play` | 只作对照，不迁 |

## Vite 相关

无论 pnpm 还是 Bun，app 里的脚本本质都是调 Vite：

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "vite build --mode production",
    "preview": "vite preview",
    "typecheck": "vue-tsc --noEmit --skipLibCheck"
  }
}
```

旧仓写成 `pnpm vite …` 是为了用 workspace 里的二进制。新仓写成 `vite` 即可，由 Bun 解析 `node_modules/.bin`。

## 环境与文件

| 旧 | 新 |
| --- | --- |
| `pnpm-workspace.yaml` | 根 `package.json` 的 `workspaces` |
| catalog 在 yaml | catalog 在 `package.json` |
| `pnpm-lock.yaml` | `bun.lock` |
| `.npmrc`（pnpm） | 一般不需要；私有源再写 `.npmrc` |
| `turbo.json` | 第 72 轮起有；dev 仍不走 turbo |
| `lefthook.yml` | 需要 git hook 时再加 |
| `VITE_*` | 不变，仍是 Vite 环境变量 |

## 在 legacy 里临时跑旧仓

`legacy/` 被 ignore，但本机还在。若只是对照运行：

```bash
cd legacy
corepack enable
pnpm install
pnpm dev:antd
```

不要在 `legacy/` 里执行 `bun install` 覆盖锁文件，也不要把生成的 `node_modules` 拷回根目录。对照完毕可删 `legacy/node_modules`。
