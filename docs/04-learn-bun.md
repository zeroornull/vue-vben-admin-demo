# 04 · 学习 Bun

官方文档：[bun.com/docs](https://bun.com/docs)。本页只写**和这次迁移有关**的部分，对照物是旧仓的 pnpm。

## Bun 是什么

Bun 同时是：

1. **包管理器**：`bun install` / `bun add` / `bun remove`，锁文件默认是文本 `bun.lock`
2. **运行时**：能直接跑 TypeScript，不必先 `tsc`
3. **脚本运行器**：`bun run dev` 会找 `package.json` 的 `scripts`
4. **测试 / 打包** 也有内置能力；本项目构建仍用 Vite，测试倾向 Vitest，避免一次换太多

第 2 轮我们主要用 1 和 3。用 Vite 开发时，底层仍是 Vite 自己的 Node 工具链；`bun run vite` 只是更快地拉起进程。

当前跟踪版本：**Bun 1.3.14**（2026-05）。本机用 `bun --version` 核对，低于 1.3 先 `bun upgrade`。

## 安装

```bash
curl -fsSL https://bun.sh/install | bash
# Windows（在 PowerShell，不在 WSL 里）
# powershell -c "irm bun.sh/install.ps1 | iex"
bun --version
```

WSL 里装 Linux 版 Bun。不要和 Windows 版混用同一份 `node_modules`。

## 和 pnpm 最像的三件事

### 1. Workspaces

pnpm 写在 `pnpm-workspace.yaml`：

```yaml
packages:
  - apps/*
  - packages/*
```

Bun 写在根 `package.json`：

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

本地互引用继续用 `"@scope/pkg": "workspace:*"`。`bun install` 一次装全仓。

只跑某个包的脚本：

```bash
bun run --filter @app/web dev
```

对应旧仓的 `pnpm -F @vben/web-antd run dev`。

### 2. Catalogs

旧仓把上百个版本写在 `pnpm-workspace.yaml` 的 `catalog:` 里，各包依赖写成 `"vue": "catalog:"`。

Bun 也支持 catalog，写在根 `package.json`：

```json
{
  "workspaces": {
    "packages": ["apps/*", "packages/*"],
    "catalog": {
      "vue": "^3.5.41",
      "vite": "^8.2.1"
    }
  }
}
```

子包同样写 `"vue": "catalog:"`。第 2 轮只把「会重复出现的核心依赖」放进 catalog，不要把旧 yaml 整表贴过来。

### 3. 锁文件要进 Git

| 旧 | 新 |
| --- | --- |
| `pnpm-lock.yaml` | `bun.lock` |

CI 用 `bun ci` 或 `bun install --frozen-lockfile`，和 `pnpm install --frozen-lockfile` 同类。

## 日常命令

| 你想做的事 | 命令 |
| --- | --- |
| 安装全部依赖 | `bun install` |
| 给当前包加依赖 | `bun add vue` |
| 加 dev 依赖 | `bun add -d typescript` |
| 指定 catalog 版本（根上改 catalog 后） | 再执行一次 `bun install` |
| 删依赖 | `bun remove lodash` |
| 跑脚本 | `bun run dev` |
| 直接跑文件 | `bun src/main.ts`（本项目浏览器入口仍走 Vite） |
| 更新 Bun 自己 | `bun upgrade` |
| 看为什么装了某个包 | `bun why <pkg>` |
| 审计 | `bun audit` |

更完整的对照见 [06-command-mapping.md](./06-command-mapping.md)。

## 和 pnpm 不一样、迁移时会踩的点

**生命周期脚本。** Bun 默认不跑「未信任」依赖的 `postinstall`。旧仓 `pnpm-workspace.yaml` 有 `allowBuilds`（esbuild、lefthook 等）。新仓若某个原生包没编出来，把它写进根 `package.json` 的 `trustedDependencies`。

**不要带上旧根配置。**

- `"preinstall": "npx only-allow pnpm"` 必须丢掉
- `"packageManager": "pnpm@11.16.0"` 改成 `bun@<version>`
- `.npmrc` 里 pnpm 专用项（`shamefully-hoist` 等）不要原样复制

**node_modules 布局。** pnpm 是 symlink 隔离；Bun 更接近扁平安装再去重。不要假设「只有声明过的包才能 require」。该写进 `package.json` 的依赖还是要写，避免幽灵依赖。

**engines.pnpm。** 旧仓限制了 pnpm 版本。新仓可写：

```json
{
  "packageManager": "bun@1.3.14"
}
```

Corepack 对 Bun 不如对 pnpm 那么常用，以本机 `bun` 为准即可。

**Turbo。** Turbo 能在 Bun 仓里跑，但第 2 轮只有一个 app，先不用。少一个守护进程，问题更好查。

## 建议的本地练习（第 2 轮之前可做）

正式工程用 Vue 官方脚手架，不要用 `bun init` 手搭 Vue：

```bash
mkdir /tmp/create-vue-probe && cd /tmp/create-vue-probe
bun x create-vue@latest .
# 勾选 TypeScript；需要的话再勾 Router / Pinia
bun install
bun run dev
```

`bun create vue` 与 `bun x create-vue@latest` 是同一条路。练完删掉即可。本仓库第 2 轮在 `apps/web` 再跑一次，不要在 `legacy/` 里装依赖。

## 延伸阅读

- [Workspaces](https://bun.com/docs/pm/workspaces)
- [Catalogs](https://bun.com/docs/pm/catalogs)
- [bun install](https://bun.com/docs/pm/cli/install)
- [bun run](https://bun.com/docs/cli/run)
