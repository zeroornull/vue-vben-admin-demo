# 08 · 第 2 轮：create-vue + Bun workspace

日期：2026-08-19。

## 本轮结论

用官方 `create-vue` 生成 `apps/web`，根目录只加了一层 Bun workspace。`vue-tsc --build` 和 `vite build` 已通过；开发服在 `http://localhost:5173/`。

没有手写 Vite / `tsconfig` / Vue 插件。没有收 catalog（按路线：先跑通，再统一版本）。

## 实际执行

本机 Bun **1.3.14**。非交互命令：

```bash
mkdir -p apps
cd apps
bun x create-vue@latest --typescript --router --pinia web
```

脚手架勾选（CLI 等价于当时文档建议）：

| 选项 | 结果 |
| --- | --- |
| TypeScript | 是（`--typescript`） |
| Vue Router | 是（`--router`） |
| Pinia | 是（`--pinia`） |
| JSX | 否 |
| Vitest / Playwright / Cypress | 否 |
| ESLint / Prettier / Oxfmt | 否 |

`create-vue` **额外带上了** `vite-plugin-vue-devtools`，这是当前官方模板默认，不是我们后加的。

生成后只做了 workspace 需要的改动：

1. 把 `apps/web/package.json` 的 `name` 从 `web` 改成 `@app/web`，方便 `bun run --filter`
2. 根目录新增 `package.json`：`workspaces: ["apps/*"]`，`packageManager: bun@1.3.14`
3. 根目录 `bun install`，得到 `bun.lock`
4. 根 `.gitignore` 补了 `*.tsbuildinfo`

没有改 `vite.config.ts`、`tsconfig*.json`、`src/**`。

## 真实装上的版本

`apps/web/package.json` 里是范围（模板写的 `vue` 是 `^3.5.40`）。`bun.lock` 解析结果：

| 包 | 声明 | 锁定 |
| --- | --- | --- |
| vue | `^3.5.40` | **3.5.41** |
| vue-router | `^5.2.0` | 5.2.0 |
| pinia | `^4.0.2` | **4.0.3** |
| vite | `^8.1.5` | **8.2.1** |
| typescript | `~6.0.0` | 6.0.3 |
| vue-tsc | `^3.3.7` | **3.3.10** |
| @vitejs/plugin-vue | `^6.0.8` | 6.0.8 |

和第 1 轮调研一致：稳定线是 Vue **3.5.41**，不是 3.6 RC。官方模板的 `^` 自己抬到了 latest patch。

## 生成出来的结构

```text
apps/web/
├── index.html
├── vite.config.ts          # plugin-vue + vue-devtools，alias @ → src
├── tsconfig.json           # project references
├── tsconfig.app.json       # @vue/tsconfig，paths.@/*
├── tsconfig.node.json      # Vite 配置用
├── env.d.ts
├── src/
│   ├── main.ts             # createApp → pinia → router → mount
│   ├── App.vue
│   ├── router/index.ts     # / 与 /about
│   ├── stores/counter.ts   # setup store 示例
│   ├── views/
│   └── components/         # 官方欢迎页
└── package.json
```

启动链比 legacy 短，这是预期：第 3 轮才往里面加 preferences / 守卫 / 请求。对照阅读时不要把 `apps/web/src/main.ts` 直接改成 `legacy/apps/web-antd/src/bootstrap.ts` 的拷贝。

路径别名跟脚手架：**`@/*`**。旧仓 `#/*` 先不动。

## 怎么跑

在仓库根：

```bash
bun install
bun run dev          # http://localhost:5173/
bun run typecheck    # 转到 @app/web 的 vue-tsc --build
bun run build
bun run preview
```

等价：`bun run --filter @app/web dev`。

## 和手写方案比，脚手架省了什么

- 双 `tsconfig` + `vue-tsc --build` + `tsBuildInfoFile` 放到 `node_modules/.tmp`
- `@` 同时写在 Vite `resolve.alias` 和 `tsconfig.app.json` 的 `paths`
- `env.d.ts` 引入 Vite 客户端类型
- `npm-run-all2` 让 `build` 同时 type-check + `vite build`
- 官方欢迎页，用来验收「能看见 Vue」，而不是空白 `div`

我们自己只该维护：根 workspace、锁文件、包名 `@app/web`。

## 刻意没做

- 没有把依赖收进 catalog
- 没有 Turbo、没有 ESLint、没有 Tailwind
- 没有从 `legacy/` 搬任何业务模块
- 没有改官方 `vite.config` 去模仿 `@vben/vite-config`

## 学习笔记（本轮）

- `bun x create-vue@latest` 带 feature flag 时是非交互的；目录名必须是合法包名（所以在 `apps/` 下生成 `web`，而不是一次传 `apps/web`）。
- 当前模板默认带 Vue DevTools 插件；开发服日志里的 `/__devtools__/` 来自它。
- `bun run --filter` 按 **package.json 的 name** 过滤，不是按目录名。改成 `@app/web` 之后根脚本才能写成现在这样。
- workspace 安装后依赖在根 `node_modules`，app 目录下没有自己的 lockfile，这是对的。

## 下一轮从哪里开始

[03-migration-roadmap.md](./03-migration-roadmap.md) 第 3 轮：登录闭环。

建议入口文件（先读再改）：

1. `apps/web/src/main.ts` — 保持官方挂载顺序，往上加东西而不是换成 bootstrap 大文件
2. `apps/web/src/router/index.ts` — 加登录页、受保护首页、守卫
3. `legacy/apps/web-antd/src/router/guard.ts` — 对照，不要整文件粘贴
4. `apps/web/src/stores/` — 用官方 Pinia 写法加 `auth`，`counter` 示例可留可删
