# 01 · 旧仓盘点

对照根路径：`legacy/`。版本号来自 `legacy/package.json`（`5.7.0`）和 `legacy/pnpm-workspace.yaml` 的 catalog。

## 根目录长什么样

```text
legacy/
├── apps/                  # 可运行应用
├── packages/              # 业务与核心库
├── packages/@core/        # 更底层的 UI / 偏好 / 基础工具
├── packages/effects/      # 偏「副作用」的能力：请求、权限、布局、hooks
├── internal/              # 只给仓库自己用的工具链（vite/ts/lint 配置）
├── scripts/               # vsh、turbo-run、docker
├── playground/            # 功能最全的演示应用
├── docs/                  # VitePress 官方文档（不是本目录这套迁移文档）
├── pnpm-workspace.yaml    # workspace 范围 + catalog 版本表
├── pnpm-lock.yaml
├── turbo.json
└── package.json           # 根脚本；preinstall 只允许 pnpm
```

根脚本里最常用的是：

| 脚本 | 实际做什么 |
| --- | --- |
| `pnpm install` | 全仓安装；`postinstall` 会跑各包 `stub` |
| `pnpm dev` | `turbo-run dev`，交互选一个 app 起开发服 |
| `pnpm dev:antd` 等 | 直接 `pnpm -F @vben/web-antd run dev` |
| `pnpm build` | `turbo build`，按依赖图构建 |
| `pnpm check:type` | `turbo run typecheck` |
| `update:deps` | `taze` 批量升依赖 |

引擎约束：Node `^22.18.0` 或 `^24.12.0`，`pnpm >= 11`。

## 应用（apps）

| 目录 | 包名 | 角色 |
| --- | --- | --- |
| `apps/web-antd` | `@vben/web-antd` | Ant Design Vue 皮肤，作为**默认对照实现** |
| `apps/web-ele` | `@vben/web-ele` | Element Plus |
| `apps/web-naive` | `@vben/web-naive` | Naive UI |
| `apps/web-tdesign` | `@vben/web-tdesign` | TDesign |
| `apps/web-antdv-next` | `@vben/web-antdv-next` | antdv-next |
| `apps/backend-mock` | — | Nitro mock API，给前端联调 |

五个 web app 的骨架几乎一样：`main.ts` → `preferences` → `bootstrap.ts` → `router` / `store` / `adapter` / `views`。差别集中在：

- UI 组件库依赖
- `adapter/component`、`adapter/form`（把 Vben 表单/弹窗接到具体组件）
- `styles` 的皮肤入口（如 `@vben/styles/antd`）

**迁移时选一份当蓝本即可。** 推荐 `legacy/apps/web-antd`：文件最少、路径最熟、官方文档示例也多以它为准。

`playground/` 功能更多（示例页、e2e），适合「对照某个特性怎么写」，不要当第一个要跑起来的 app。

## 包分层（packages）

从上到下可以看成四层。箭头表示「谁依赖谁」。

```text
apps / playground
    ↓
@vben/layouts  @vben/common-ui  @vben/plugins  @vben/access  @vben/request
@vben/hooks    @vben/stores     @vben/locales  @vben/preferences
    ↓
@vben/icons  @vben/styles  @vben/utils  @vben/types  @vben/constants
    ↓
@vben-core/*   （ui-kit、composables、design、shared、typings、preferences）
```

### effects（应用侧能力）

| 包 | 路径 | 先搬吗 | 一句话 |
| --- | --- | --- | --- |
| access | `packages/effects/access` | 第 3 轮 | 指令 + 菜单/路由生成 |
| request | `packages/effects/request` | 第 2–3 轮 | Axios 封装 |
| hooks | `packages/effects/hooks` | 按需 | 水印等 |
| layouts | `packages/effects/layouts` | 第 4 轮 | 后台壳子、偏好面板 |
| common-ui | `packages/effects/common-ui` | 按需 | Page、验证码、裁剪等 |
| plugins | `packages/effects/plugins` | 按需 | Motion、TipTap、vxe-table |

### 普通 packages

| 包 | 路径 | 先搬吗 |
| --- | --- | --- |
| stores | `packages/stores` | 是，登录态 / access / user |
| preferences | `packages/preferences` | 是，主题与布局开关 |
| locales | `packages/locales` | 第 3 轮，可先写死中文 |
| utils / types / constants / icons / styles | `packages/*` | 用到再搬，禁止整目录复制 |

### @core

`packages/@core` 是设计系统和底层偏好。里面有 `ui-kit`（shadcn-vue 风格、form-ui、layout-ui、menu-ui、popup-ui、tabs-ui）、`composables`、`base/design`、`base/shared`。

第 2、3 轮**不要**先搬整棵 `@core`。后台壳子能跑起来之前，用 Vue + 少量布局组件顶上。等「必须复刻 Vben 布局」时再拆。

## internal 与 scripts

| 路径 | 作用 | 新仓策略 |
| --- | --- | --- |
| `internal/vite-config` | 统一 Vite 插件、env 转换 | 先内联到 app 的 `vite.config.ts` |
| `internal/tsconfig` | 共享 tsconfig | 根上一个 `tsconfig.json` 即可 |
| `internal/tailwind-config` | Tailwind 4 | 需要样式体系时再引入 |
| `internal/lint-configs/*` | eslint / oxlint / oxfmt / stylelint / commitlint | 第 2 轮只上 oxlint 或 eslint 二选一 |
| `internal/node-utils` | 给脚本用的 node 工具 | 等写仓库脚本再考虑 |
| `scripts/vsh` | lint、环依赖、publint | 不搬 |
| `scripts/turbo-run` | 交互式选 app 跑 turbo | 单 app 阶段不需要 |
| `scripts/deploy` | Docker / nginx | 部署轮次再看 |

## Catalog 里和前端最相关的版本

摘自 `legacy/pnpm-workspace.yaml`，只列迁移会碰到的：

| 包 | catalog |
| --- | --- |
| vue | `^3.5.40` |
| vue-router | `^5.2.0` |
| pinia | `^4.0.2` |
| pinia-plugin-persistedstate | `^4.7.1` |
| vue-i18n | `^11.4.7` |
| @vueuse/core | `^14.3.0` |
| vite | `^8.2.1` |
| @vitejs/plugin-vue | `^6.0.8` |
| typescript | `^6.0.3` |
| vue-tsc | `^3.3.9` |
| tailwindcss | `^4.3.3` |
| axios | `^1.18.1` |
| ant-design-vue | `^4.2.6` |
| element-plus | `^2.14.3` |
| naive-ui | `^2.44.1` |
| tdesign-vue-next | `^1.20.3` |
| vitest | `^4.1.10` |
| turbo | `^2.10.10` |

完整表仍以 yaml 为准，这里不复制整份 catalog。

## 一个 web app 的内部结构（以 web-antd 为例）

```text
legacy/apps/web-antd/src/
├── main.ts                 # 算 namespace → initPreferences → 动态 import bootstrap
├── bootstrap.ts            # createApp、指令、i18n、pinia、router、插件、mount
├── app.vue
├── preferences.ts          # 覆盖默认偏好
├── adapter/                # 把抽象表单/组件接到 ant-design-vue
├── api/                    # 请求实例 + auth/user/menu
├── locales/
├── layouts/                # auth / basic，多数逻辑在 @vben/layouts
├── router/
│   ├── index.ts            # createRouter
│   ├── guard.ts            # 进度条 + 权限
│   ├── access.ts           # generateAccessible + glob 页面
│   └── routes/
├── store/auth.ts           # 应用级登录 store，组合 @vben/stores
└── views/                  # 登录、403、dashboard、demos
```

`package.json` 里用了 [import maps](https://nodejs.org/api/packages.html#imports)：`"#/*": "./src/*"`，所以源码写 `#/router` 而不是 `@/router`。新仓可以继续用 `#/*`，或改成 `@/*`，第 2 轮选定后不要来回改。

## 对照时怎么查

1. 先看 `legacy/apps/web-antd/src/main.ts` 和 `bootstrap.ts`，建立启动顺序。
2. 某个能力（例如请求头带 token）再顺着 import 进 `packages/`。
3. 官方概念解释看 `legacy/docs/src/guide/`，以代码为准，文档可能滞后。
