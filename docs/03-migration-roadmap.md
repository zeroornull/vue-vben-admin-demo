# 03 · 分轮迁移路线

原则：**每一轮结束时仓库都能解释自己处在哪，并且下一轮有明确入口文件。** 第 1 轮只搬文档和旧仓；从第 2 轮开始才有可运行代码。

## 总览

```text
第 1 轮  归档 + 文档
第 2 轮  create-vue 初始化 + Bun workspace
第 3 轮  请求 / 登录 / 权限路由
第 4 轮  布局壳 + 偏好 + 基础样式
第 5 轮  业务页按需移植（dashboard 等）
第 6 轮  工程化（lint / test / CI）与依赖冻结  ← 当前
```

轮次可以按实际卡点拆开（例如第 3 轮只做登录、第 3b 轮再做动态路由），但不要跳过「可运行」去堆包。

## 第 1 轮 · 归档与学习（本轮）

**做：**

- 旧仓 → `legacy/`
- ignore `legacy/`
- 写下盘点、架构、路线、Bun / Vue 学习笔记

**验收：**

- 根目录不再有 `apps/`、`packages/`、`pnpm-workspace.yaml`
- `docs/README.md` 能当目录用
- 克隆仓库的人看不到 `legacy/`（本地有的人当对照）

**不做：** 安装 Bun 依赖、改业务代码。

## 第 2 轮 · 官方脚手架 + Bun workspace

> 已完成，执行记录见 [08-round-02-scaffold.md](./08-round-02-scaffold.md)。
>
> 纠正（第 1 轮当晚）：不要手写 Vite/Vue/`tsconfig`。先用 Vue 官方 `create-vue`，再抬进 Bun 单体仓。理由见下面「为什么用 create-vue」。

**做：**

1. 用官方脚手架生成应用（在仓库根执行，目标目录 `apps/web`）：

   ```bash
   bun x create-vue@latest apps/web
   ```

   选项建议：TypeScript = 是；Vue Router = 是；Pinia = 是（第 3 轮要用，官方模板一次配好）；JSX = 否；Vitest / Playwright / ESLint 先按默认或全否，工程化放到第 6 轮。
2. 根上补一层 Bun workspace：根 `package.json` 写 `workspaces: ["apps/*"]`、`"packageManager": "bun@…"`，删掉 app 里可能生成的 npm/pnpm 锁文件，在根执行 `bun install`，提交 `bun.lock`。
3. 需要统一版本时，再把 `vue` / `vue-router` / `pinia` / `vite` / `typescript` 收进根 catalog；**先让官方模板能跑，再收 catalog**，不要生成完立刻改依赖声明。
4. 路径别名跟脚手架走（`@/*`）。旧仓的 `#/*` 等到真从 legacy 搬代码再决定要不要对齐。
5. 验证 `bun run --filter <app-name> dev` / `build` / 类型检查。
6. 写 `docs/08-round-02-scaffold.md`：实际勾选、真实版本号、和手写方案比省了什么。

**验收：** 浏览器打开官方欢迎页；`vue-tsc --noEmit` 通过。

**明确不做：** 改官方 `vite.config` 去模仿 `@vben/vite-config`；Pinia 持久化、i18n、权限、layouts、Tailwind 完整主题。

### 为什么用 create-vue，不手写

`create-vue` 是 Vue 文档推荐的官方脚手架（[create-vue](https://github.com/vuejs/create-vue)），会按当时的稳定组合生成：

- Vite + `@vitejs/plugin-vue`
- `tsconfig` / `vue-tsc` / 环境类型（`vite/client`）
- 可选的 Router、Pinia、Vitest

这些文件手写容易漏：`moduleResolution`、`paths` 只配一边、SFC 类型、脚本和 Vite 二进制对不上。官方模板的版本线就是「最新稳定 Vue 依赖」的来源，比我们在文档里冻结的 3.5.41 快照更准。

`create-vue` **只生成单包应用**，不管 monorepo。所以第 2 轮的分工是：

| 谁来做 | 做什么 |
| --- | --- |
| `create-vue` | 可运行的 Vue + TS + Vite 应用 |
| 我们 | 根 workspace、Bun 锁文件、以后的 catalog |

不要用 `bun init` 当 Vue 脚手架：它只给一个空 TS/JS 包，没有 SFC、没有 Vite 插件、没有 Vue 官方推荐结构。`bun create vue` 本质也是跑 `create-vue`。

## 第 3 轮 · 登录闭环

> 已完成，执行记录见 [09-round-03-login.md](./09-round-03-login.md)。

对照：

- `legacy/apps/web-antd/src/router/guard.ts`
- `legacy/apps/web-antd/src/store/auth.ts`
- `legacy/apps/web-antd/src/api/`

**做：**

- 路由：登录页 + 一个需登录的空首页 + 404
- 守卫：无 token 跳登录；有 token 放行
- 请求客户端：baseURL、token 头、401 处理
- mock：先用 Vite 插件或静态 JSON，不必上 Nitro
- 再加：角色过滤或后端菜单，二选一先做前端角色

**验收：** 假账号能登录，刷新后（若做了持久化）仍在首页；登出回到登录页。

## 第 4 轮 · 壳子

> 已完成，执行记录见 [10-round-04-layout.md](./10-round-04-layout.md)。

对照 `legacy/packages/effects/layouts`，但只搬用到的部分。

**做：**

- 侧栏 + 顶栏 + 内容区
- 菜单由第 3 轮的 access 结果驱动
- 一份可改的 preferences（主题色、暗色可以后做）

**验收：** 登录后能从菜单进到占位页；刷新菜单不丢。

## 第 5 轮 · 业务页

> 工作区已完成，见 [11-round-05-workspace.md](./11-round-05-workspace.md)。分析页尚未搬。

从 `legacy/apps/web-antd/src/views/dashboard` 开始，一次一页。

规则：

- 先看页面依赖哪些 `@vben/*`，列清单再决定「复制函数」还是「抽包」
- 图表、vxe-table、富文本等重依赖按需加，不提前装全 catalog
- 每迁一页在 `docs/` 记依赖增量

## 第 6 轮 · 工程化

> 已完成，执行记录见 [12-round-06-engineering.md](./12-round-06-engineering.md)。

- lint / format（不要同时上 eslint + oxlint + stylelint，先选一套）
- Vitest 覆盖请求拦截和路由守卫
- CI：`bun ci` + typecheck + build
- 再评估要不要 Turbo：单 app 时 `bun run --filter` 足够

## 决策记录（第 1 轮已拍板）

| 议题 | 决定 | 原因 |
| --- | --- | --- |
| 是否整仓 `pnpm import` 到 Bun | 否 | 包数量和 preinstall 绑定会把问题搅在一起 |
| 默认 Vue | 3.5 最新稳定（现 3.5.41） | 3.6 仍是 RC，Vapor 与现有 SFC/生态未作为默认 |
| 默认对照 app | `web-antd` | 结构最完整、示例最多 |
| 是否保留 5 套皮肤 | 否，先一套 | adapter 是后期优化 |
| `legacy/` 是否提交 | 否 | 体积大，且与上游仓库重复；本机对照即可 |
| 包管理 | Bun | 用户指定；workspace 与 catalog 已具备 |
| 第 2 轮如何初始化 | **`bun x create-vue@latest apps/web`**，再套 Bun workspace | 官方模板对齐最新稳定 Vue/Vite/TS；手写配置容易漏；monorepo 是后加的一层，不是手写整个 app 的理由 |
| 第 6 轮 lint | 只上 oxlint | 不叠 ESLint / Stylelint |
| 第 6 轮 Turbo | 不上 | 单 app，`bun run --filter` 足够 |

需要改上述决定时，开新一轮文档，不要默默改这一节而不留痕迹。

## 风险

| 风险 | 表现 | 处理 |
| --- | --- | --- |
| 把 `@core` 整棵搬过来 | 第 2 轮就装不完、类型爆炸 | 先扁平 app |
| 同时换包管理器 + 升 Vue 3.6 | 分不清是 Bun 问题还是 Vapor 问题 | Vue 锁 3.5；3.6 单独开实验分支 |
| 依赖 Vite 插件只测过 Node | `bun run` 调 Vite 一般可用；插件里 `fs`/`path` 出问题再改用 `bun --bun` 或回退 Node 跑 Vite | 第 2 轮验证 |
| 忘记 legacy 被 ignore | 换机器没有对照代码 | 文档和 README 写明；需要时再 clone 上游 |
| 复制旧 `preinstall: only-allow pnpm` | Bun 装不上 | 新仓不要带这段 |
