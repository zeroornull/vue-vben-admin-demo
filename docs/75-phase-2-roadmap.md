# 75 · 第二期路线：工程与多皮肤

日期：2026-08-21。

第一期（第 1–68 轮）已经把 **一个** Bun + Vue 3.5 + ant-design-vue 后台做到能用。用户点名还想做下面这些，它们不再是边角，是换产品形态。执行时从第 69 轮起，每轮仍写一篇中文记录，四项检查过了再往下。第 69 轮 catalog 已做，见 [76-round-69-catalog.md](./76-round-69-catalog.md)。

通知已读写 `localStorage`、Nitro mock、ESLint + Stylelint、把 `legacy/docs` 整站搬过来——不在这张名单里，二期也不做。

## 结论

顺序按依赖，不按名单原文：

```text
基建     第 69  bun catalog          ← 已完成
         第 70  packages/ 薄拆       ← 已完成
         第 71  @app/core（薄核 + adapter 口子）← 已完成
         第 72  Turbo                 ← 已完成

产品     第 73  i18n                  ← 已完成
         第 74  Iconify               ← 已完成
         第 75  第二套皮肤（Element Plus）

展开     第 76  VitePress
         第 77  vxe-table（先一张表）
         第 78  Naive UI
         第 79  TDesign
         第 80  antdv-next

收口     第 81  Playwright + 自动 CI
         第 82  Vue 3.6 实验（默认仍是 3.5）
```

「五套皮肤」= 现在的 antd + 后面四套。第二套单独一轮，用来验证 adapter；其余三套各一轮，不要一周开四个 app。

`@core` 是自己抽的 `@app/core`，不是把 `legacy/packages/@core` 整棵贴过来。旧核为四套皮肤服务，体积和包名都会把第一期的扁平结构撑爆。

## 为什么是这个顺序

| 若先做 | 会卡住 |
| --- | --- |
| 先第二套皮肤、后拆包 | 布局和 `AntdPage` 还在 `apps/web`，只能复制粘贴 |
| 先 i18n、后拆包 | 每个字符串搬一次包还要再改一遍 |
| 先五套皮肤、后 Iconify | 四套都绑着 `@ant-design/icons-vue` |
| 先 Vue 3.6、后多皮肤 | 分不清是 Vapor 坏了还是 Element 没跟上 |
| 先 Playwright、后皮肤 | 页面结构还在拆，e2e 会整轮重写 |
| 先 Turbo、后拆包 | 只有一个 `@app/web`，缓存没对象 |

catalog 放最前：后面每个新包写 `"vue": "catalog:"`，不必再对版本。

## 第 69 轮 · bun catalog

**做：** 根 `package.json` 的 `workspaces.catalog` 收齐会重复的核心版本：`vue`、`vue-router`、`pinia`、`vite`、`typescript`、`vue-tsc`、`@vitejs/plugin-vue`。`apps/web` 改成 `"vue": "catalog:"`。`bun install`，锁文件进 Git。

**不做：** 把旧仓上百行 catalog 贴过来；antd、echarts、axios 仍写在 app 里，等第二个 app 真用到再收。

**对照：** [04-learn-bun.md](./04-learn-bun.md) 第 2 节。第 2 轮说过「先跑再收 catalog」，一直没做。

**验收：** `bun run lint` / `test` / `typecheck` / `build` 仍绿；`apps/web/package.json` 里 vue 不再是 `^3.5.40` 这种各自声明。

## 第 70 轮 · packages/ 薄拆

**做：** 根 workspace 改成 `["apps/*", "packages/*"]`。先拆已经有纯函数边界的目录，不要一次拆完：

| 新包 | 从哪搬 | 为什么先它 |
| --- | --- | --- |
| `@app/access` | `apps/web/src/access` | 菜单 / 操作码，皮肤不该拥有 |
| `@app/request` | `apps/web/src/api/request.ts` 一带 | 拦截器与业务页无关 |
| `@app/tables` | `apps/web/src/tables` | 列、排序、CSV、批量删除已是纯函数 |

views、layouts、stores、vite mock **留在 app**。测试跟着代码走。包与包用 `workspace:*`。

**不做：** `@vben/*` 包名；`@core`（下一轮）；把 BasicLayout 拆出去。

**验收：** 登录、用户表、权限指令行为不变；`@app/web` 用包名引用，不再相对路径进那三坨。

## 第 71 轮 · `@app/core`（薄核）

**做：** 只放「换皮肤必须共用」的口子，不搬旧仓 ui-kit 全家桶。

建议进核的：

- 主题 token（现在的 `html[data-theme]` / 密度 / 色弱）
- 消息 / 弹窗 / 表单控件的 **adapter 类型**（注册 Input、Modal、message）
- 第一份实现：antd adapter，仍由 `apps/web` 注册，核里不 `import 'ant-design-vue'`

`AntdPage` 改成「当前皮肤的 ConfigProvider」，名字可以仍叫 `AntdPage` 直到第 75 轮。

**不做：** 复制 `legacy/packages/@core`；form-ui 整包；为还不存在的皮肤建空目录。

**对照：** [02-architecture.md](./02-architecture.md) 第 6 节。那里写过：第二套皮肤出现之前不要抽 adapter。这一轮只开口子，实现仍一份。

**验收：** 现有页面零视觉变化；核包不依赖任何一个 UI 库。

## 第 72 轮 · Turbo

**做：** 根加 `turbo.json`。`lint` / `test` / `typecheck` / `build` 走 `turbo run`，`dependsOn` 按 workspace 图。根脚本改一层，开发仍 `bun run --filter @app/web dev`（Turbo 对 dev 收益小）。

**不做：** 用 Turbo 换 Bun workspace；上 `turbo-run` 交互选 app（那是旧仓习惯，等真有五个 app 再谈）。

**验收：** 改 `@app/tables` 再 `bun run test`，只重跑依赖它的包；全绿。

## 第 73 轮 · i18n

**做：** `vue-i18n`。先 `zh-CN` + `en-US`。抽出壳和系统页上的中文：登录、侧栏、页签菜单、表格列名、确认框、错误条。antd 的 `zhCN` / `enUS` 跟语言走。语言进 preferences persist。

**不做：** 把 mock 种子数据（Alice、部门名）翻译成两套业务数据；不要上到 10 种语言。

**验收：** 切到 English，侧栏和用户表表头是英文；刷新还在 English；接口报错可以仍是中文（mock 文案下一轮再说）。

## 第 74 轮 · Iconify

**做：** 菜单 / 页签图标从 `@ant-design/icons-vue` 具名表改成 Iconify 登记名（或 `@iconify/vue` + 白名单）。`resolveMenuIcon` 仍只认登记名，不任意字符串拉远程。

**不做：** 页面里随手写 `icon="mdi:whatever"`；不上就为了省事的全量图标包。

**改决策：** 第 18 轮「不上 Iconify」在这一轮作废，在 [03](./03-migration-roadmap.md) 决策表加短注。

**验收：** 侧栏图标还在；`apps/web` 可以不再直接依赖 `@ant-design/icons-vue`（antd 自己带的按钮图标另算）。

## 第 75 轮 · 第二套皮肤（Element Plus）

**做：** `apps/web-ele`。对照 `legacy/apps/web-ele` 只看 adapter 和依赖，不抄它的 views。业务页尽量共用（能共用的放 `packages/`，不能共用的在 app 里用 Element 重写 Table / Form / Modal）。注册 Element adapter。根脚本加 `dev:ele`。

**不做：** 这一轮再开 Naive / TDesign；不要为了共用把 antd 页改烂。

**验收：** `bun run dev:ele` 能登录、能开用户表、能改密；权限和 mock 与 antd 同一套。`apps/web` 仍是默认。

## 第 76 轮 · VitePress

**做：** 用现有 `docs/*.md` 做站点（例如 `apps/docs` 或根 `docs/.vitepress`），把 00–75 编进侧栏。加「二期 / adapter」一章。开发 `bun run docs`。

**不做：** 搬运 `legacy/docs`（那是 Vben 官方站，和我们的学习记录不是一份）；不要按皮肤复制五份教程。

**验收：** 本地打开站点能从总览点到本页；构建出静态目录。

## 第 77 轮 · vxe-table

**做：** 只换 **用户表** 这一张（行最多、列开关 / 排序 / 批量删除最全）。其它表仍 antd / Element Table。CSV、权限、mock 接口不动。

**不做：** 五张表一起换；不要上 vxe 商业套件。

**改决策：** 第 8 轮「不上 vxe-table」在这一轮收窄为「非用户表默认不上」。

**验收：** 用户表筛选、排序、列显隐、批量删除、导入导出仍过；页签刷新不丢状态。

## 第 78–80 轮 · 其余三套皮肤

每轮一个 app，同一套验收（登录 + 用户 + 部门树 + 个人中心）：

| 轮 | app | 库 | 对照 |
| --- | --- | --- | --- |
| 78 | `apps/web-naive` | Naive UI | `legacy/apps/web-naive` |
| 79 | `apps/web-tdesign` | TDesign Vue | `legacy/apps/web-tdesign` |
| 80 | `apps/web-antdv-next` | antdv-next | `legacy/apps/web-antdv-next` |

第 80 轮特别小心：它和 `apps/web` 都是 antd 家系，差在包和 API。两套依赖必须隔离，禁止一个 app 同时引进 `ant-design-vue@4` 和 antdv-next。

**不做：** playground；为演示再做一套「五种皮肤切换器」（那是模板站卖点，不是本仓目标）。五个 app 五个 dev 脚本即可。

## 第 81 轮 · Playwright + 自动 CI

**做：**

- Playwright：只测默认 `apps/web`。最少四条：登录成功、错密锁定文案、用户新建、无权限进 `/users` 到 403。
- mock 用现有 Vite 插件，e2e 起 `vite preview` 或 `vite dev`，不要另写一套后端。
- `.github/workflows/ci.yml`：`pull_request` + `push` 到 `master` 自动跑 lint / typecheck / test / build；Playwright 单独 job，缓存浏览器。`workflow_dispatch` 保留。

**不做：** 五套皮肤 × e2e 矩阵（先一条绿）；不要在 push 每个实验分支都跑浏览器（只保护 `master` 和 PR）。

**验收：** 本地 `bun run test:e2e` 过；PR 上能看到 ci + e2e 两个 job。

## 第 82 轮 · Vue 3.6 实验

2026-08-21 时 Vue 3.6 仍是 RC（Vapor + alien-signals），稳定默认仍是 3.5。这一轮**不准**改默认运行时。

**做：** 单独 app 或 catalog 覆盖，例如 `apps/web-vapor`，只挂一个无 UI 库的叶子页（工作区一张卡片或分析页的一张图）。Vapor 按官方标成 opt-in。记一份「哪些 SFC / antd 不能进 Vapor」。

**不做：** 把 `apps/web` 的 vue 改成 3.6；不要五套皮肤一起升。

**闸门：** 3.6 出 `latest` 稳定、且 ant-design-vue / Element / vue-router / pinia 声明支持之后，再开「默认改 3.6」的新一轮。那一轮不在本期预支。

## 依赖清单（先列再决定）

| 名单项 | 进哪一轮 | 新 npm / 工具 |
| --- | --- | --- |
| bun catalog | 69 | 无（Bun 已有） |
| `packages/` 拆包 | 70 | 无 |
| `@core` | 71 | 无（自研 `@app/core`） |
| Turbo | 72 | `turbo` |
| i18n | 73 | `vue-i18n` |
| Iconify | 74 | `@iconify/vue` 或 `unplugin-icons`（开做时二选一写进当轮记录） |
| 第二套皮肤 | 75 | `element-plus` |
| VitePress | 76 | `vitepress` |
| vxe-table | 77 | `vxe-table`（及它当时要求的配套） |
| 其余皮肤 | 78–80 | `naive-ui` / `tdesign-vue-next` / antdv-next |
| Playwright 自动 CI | 81 | `@playwright/test` |
| Vue 3.6 | 82 | `vue@rc` 仅实验 app |

## 和第一期决策怎么相处

改决定时在 [03](./03-migration-roadmap.md) 表上加注，不要默默改第 1 轮原文。

| 第一期 | 二期 |
| --- | --- |
| 一套皮肤 | 第 75 轮起变成多 app，默认仍是 `apps/web`（antd） |
| 不上 Turbo | 第 72 轮上，前提是已经拆包 |
| 不上 Iconify | 第 74 轮上 |
| 不上 vxe-table | 第 77 轮只上用户表 |
| 不上 VitePress | 第 76 轮上**我们自己的**学习站 |
| Vue 3.5 默认 | 不改；第 82 轮只加实验 app |
| catalog「已具备」 | 第 2 轮写过、没落地；第 69 轮才算具备 |
| 文档不按皮肤分叉 | 仍只维护一份教程；每套皮肤一篇短记录，不写五本平行书 |

## 风险

| 风险 | 处理 |
| --- | --- |
| 把 `@vben-core` 当作业抄 | 第 71 轮验收：核包零 UI 库依赖 |
| 五套皮肤 × 两套语言 | i18n 必须在第 75 轮之前；业务页尽量进包 |
| antd 4 和 antdv-next 抢依赖 | 第 80 轮隔离，catalog 里不要强行收成同一个键 |
| Playwright 碰 Vite mock 不稳定 | 先四条烟测；失败先修 mock 时序，不加 `waitForTimeout` |
| 3.6 / Vapor 和组件库不兼容 | 默认锁 3.5；实验 app 挂了就记文档，不回滚第一期 |
| Turbo 和 `bun run --filter` 两套脚本 | 文档写清：dev 用 filter，CI 用 turbo |

## 怎么开始

点名「做第 69 轮」再改代码。不要从皮肤或 Vue 3.6 插队。

某一项不想做了，划掉对应轮，后面的编号不用重排，在当轮记录写「跳过 + 原因」。

## 学习笔记

- 旧仓五套皮肤能共用，是因为先有 `@core` adapter，不是因为 Vue 换皮很容易。我们第一期把控件写进页面了，所以必须先拆包再开口子。
- catalog 解决的是「两个包各写一个 vue 版本」。一个 app 时它是空转，两个 app 时它是救命的。
- Playwright 测的是用户路径，Vitest 测的是纯函数。两者替代不了。自动 CI 测的是「别人拉 PR 别把主线弄红」，和本机 `bun run test` 不是同一件事。
