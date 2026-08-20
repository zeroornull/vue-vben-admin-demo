# 03 · 分轮迁移路线

原则：**每一轮结束时仓库都能解释自己处在哪，并且下一轮有明确入口文件。** 第 1 轮只搬文档和旧仓；从第 2 轮开始才有可运行代码。

## 总览

```text
第 1 轮  归档 + 文档
第 2 轮  create-vue 初始化 + Bun workspace
第 3 轮  请求 / 登录 / 权限路由
第 4 轮  布局壳 + 偏好 + 基础样式
第 5 轮  业务页按需移植（dashboard 等）
第 6 轮  工程化（lint / test / CI）与依赖冻结
第 7 轮  分析页 + ECharts
第 8 轮  组件库 + 用户 Form/Table
第 9 轮  部门树 + 侧栏分组
第 10 轮 用户挂部门
第 11 轮 业务角色 + 用户挂角色
第 12 轮 角色绑菜单 + 动态路由
第 13 轮 按钮权限
第 14 轮 页签 + KeepAlive
第 15 轮 暗色开关
第 16 轮 面包屑
第 17 轮 v-access
第 18 轮 侧栏图标
第 19 轮 页签图标
第 20 轮 窄屏侧栏
第 21 轮 用户菜单
第 22 轮 锁屏
第 23 轮 个人中心
第 24 轮 改显示名
第 25 轮 菜单搜索
第 26 轮 请求进度条
第 27 轮 页面水印
第 28 轮 布局全屏
第 29 轮 刷新当前页
第 30 轮 请求错误条
第 31 轮 色弱 / 灰色
第 32 轮 回到顶部
第 33 轮 浏览器标题
第 34 轮 外观菜单
第 35 轮 用户 CSV 导出
第 36 轮 用户 CSV 导入
第 37 轮 快捷键说明
第 38 轮 页脚版权
第 39 轮 紧凑密度
第 40 轮 记住上次页面
第 41 轮 检查更新
第 42 轮 复制当前路径
第 43 轮 用户表列显隐
第 44 轮 内嵌页
第 45 轮 顶栏导航
第 46 轮 闲置锁屏
第 47 轮 通知中心
第 48 轮 登录失败锁定
第 49 轮 操作日志
第 50 轮 可配置外链
第 51 轮 未保存离开确认
第 52 轮 侧栏宽度
第 53 轮 GET 失败重试
第 54 轮 表格每页条数
第 55 轮 多标签清会话
第 56 轮 离线条
第 57 轮 换页取消 GET  ← 当前
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

> 工作区见 [11-round-05-workspace.md](./11-round-05-workspace.md)；分析页见 [13-round-07-analytics.md](./13-round-07-analytics.md)。

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

## 第 7 轮 · 分析页

> 已完成，执行记录见 [13-round-07-analytics.md](./13-round-07-analytics.md)。

对照 `legacy/apps/web-antd/src/views/dashboard/analytics`。这一页本身就是图表，所以引入 ECharts；不搬 `@vben/plugins/echarts`、`@vueuse/core`、暗色 preferences。

## 第 8 轮 · 组件库与用户页

> 已完成，执行记录见 [14-round-08-antd-users.md](./14-round-08-antd-users.md)。

选定 **ant-design-vue 4**（对照 `web-antd`，不用 playground 的 `antdv-next` / vxe-table）。落地一页用户列表：查询表单、分页表、新建/编辑弹窗、删除确认；mock 内存 CRUD。

## 第 9 轮 · 部门树

> 已完成，执行记录见 [15-round-09-depts.md](./15-round-09-depts.md)。

对照 `legacy/playground/src/views/system/dept`。用 antd Table 树 + TreeSelect 做部门 CRUD；侧栏用 `meta.group` 把用户/部门收成「系统」。仍不上 vxe-table。

## 第 10 轮 · 用户挂部门

> 已完成，执行记录见 [16-round-10-user-dept.md](./16-round-10-user-dept.md)。

用户表加上 `deptId`：筛选含下级、表单 TreeSelect、部门人数、有人不能删。零新依赖。

## 第 11 轮 · 业务角色

> 已完成，执行记录见 [17-round-11-roles.md](./17-round-11-roles.md)。

角色是业务数据（`biz-admin` / `editor` / `viewer`），编码避开登录用的 `admin` / `user`。用户可多选角色；有人占用则不能删。

## 第 12 轮 · 角色绑菜单

> 已完成，执行记录见 [18-round-12-role-menus.md](./18-round-12-role-menus.md)。

角色勾选菜单；登录账号映射到业务角色；守卫 `addRoute`。登录 `meta.roles` 仍只管「关于」。不做按钮权限。

## 第 13 轮 · 按钮权限

> 已完成，执行记录见 [19-round-13-button-access.md](./19-round-13-button-access.md)。

操作码与菜单码分开。页面藏按钮，mock 写接口也查码。不做 `v-access`。

## 第 14 轮 · 页签

> 已完成，执行记录见 [20-round-14-tabs.md](./20-round-14-tabs.md)。

页签 + KeepAlive。工作台钉住。不搬旧仓拖拽和右键菜单。

## 第 15 轮 · 暗色

> 已完成，执行记录见 [21-round-15-theme.md](./21-round-15-theme.md)。

`themeMode`：system / light / dark。antd 和 ECharts 跟 resolved 主题。无主题色拾色器。

## 第 16 轮 · 面包屑

> 已完成，执行记录见 [22-round-16-breadcrumb.md](./22-round-16-breadcrumb.md)。

`工作台 / 系统 / 用户`。分组段不能跳。工作台上藏条。不用 antd Breadcrumb，不扫 `route.matched`。

## 第 17 轮 · v-access

> 已完成，执行记录见 [23-round-17-v-access.md](./23-round-17-v-access.md)。

按钮用 `v-access="'user:create'"`。操作列和 mock 写接口仍走函数。`v-access:role` 只认登录角色。

## 第 18 轮 · 侧栏图标

> 已完成，执行记录见 [24-round-18-menu-icons.md](./24-round-18-menu-icons.md)。

`@ant-design/icons-vue@7.0.1`。`meta.icon` 是登记名。不上 Iconify。登录页 Form 仍不做。

## 第 19 轮 · 页签图标

> 已完成，执行记录见 [25-round-19-tab-icons.md](./25-round-19-tab-icons.md)。

页签复用 `menuIcons`。旧 persist 用路由名回退。不加右键菜单。

## 第 20 轮 · 窄屏侧栏

> 已完成，执行记录见 [26-round-20-narrow-sidebar.md](./26-round-20-narrow-sidebar.md)。

≤768px 改抽屉。`drawerOpen` 不 persist。不上 VueUse。

## 第 21 轮 · 用户菜单

> 已完成，执行记录见 [27-round-21-user-menu.md](./27-round-21-user-menu.md)。

顶栏下拉：账号 + 两层角色 + 退出。不用 antd Dropdown。无个人中心页。

## 第 22 轮 · 锁屏

> 已完成，执行记录见 [28-round-22-lock-screen.md](./28-round-22-lock-screen.md)。

锁屏不清 token。解锁校验当前账号密码。个人中心页仍不做。

## 第 23 轮 · 个人中心

> 已完成，执行记录见 [29-round-23-profile.md](./29-round-23-profile.md)。

`/profile` 静态、藏侧栏。看会话不是系统用户。页签白名单改 `staticLayoutNames()`。

## 第 24 轮 · 改显示名

> 已完成，执行记录见 [30-round-24-profile-name.md](./30-round-24-profile-name.md)。

`PUT /user/profile` 只改登录账号的 `realName`。不动系统用户表。

## 第 25 轮 · 菜单搜索

> 已完成，执行记录见 [31-round-25-menu-search.md](./31-round-25-menu-search.md)。

Ctrl+K 搜能去的页。个人中心能搜到。无权限的页不出现。不上 Fuse。

## 第 26 轮 · 请求进度条

> 已完成，执行记录见 [32-round-26-loading-bar.md](./32-round-26-loading-bar.md)。

顶栏绿条数进行中的请求。不上 nprogress。mock 很快，条至少停 240ms。

## 第 27 轮 · 页面水印

> 已完成，执行记录见 [33-round-27-watermark.md](./33-round-27-watermark.md)。

登录后铺「显示名 · 账号」。偏好可关。不是防泄密。不上 canvas 库。

## 第 28 轮 · 布局全屏

> 已完成，执行记录见 [34-round-28-content-fullscreen.md](./34-round-28-content-fullscreen.md)。

藏壳，不调 Fullscreen API。不 persist。Escape 分层退出。

## 第 29 轮 · 刷新当前页

> 已完成，执行记录见 [35-round-29-view-refresh.md](./35-round-29-view-refresh.md)。

重挂当前 KeepAlive 实例。不是 F5。页签还在。

## 第 30 轮 · 请求错误条

> 已完成，执行记录见 [36-round-30-error-toast.md](./36-round-30-error-toast.md)。

失败出红条。登录 / 解锁 / 401 不出。页面不再叠 message.error。

## 第 31 轮 · 色弱 / 灰色

> 已完成，执行记录见 [37-round-31-color-filter.md](./37-round-31-color-filter.md)。

整页 CSS filter。不是无障碍。和主题分开 persist。

## 第 32 轮 · 回到顶部

> 已完成，执行记录见 [38-round-32-back-top.md](./38-round-32-back-top.md)。

滚过 320px 出按钮。听 window。不上 antd BackTop。

## 第 33 轮 · 浏览器标题

> 已完成，执行记录见 [39-round-33-document-title.md](./39-round-33-document-title.md)。

标签为「页名 · 应用名」。登录 / 403 / 404 也有。不上 useTitle。

## 第 34 轮 · 外观菜单

> 已完成，执行记录见 [40-round-34-appearance-menu.md](./40-round-34-appearance-menu.md)。

水印 / 色弱 / 主题收进「外观」。动作按钮留在顶栏。

## 第 35 轮 · 用户 CSV

> 已完成，执行记录见 [41-round-35-user-csv.md](./41-round-35-user-csv.md)。

按筛选导出，最多 100 条。BOM + 公式转义。不上 xlsx。

## 第 36 轮 · 用户 CSV 导入

> 已完成，执行记录见 [42-round-36-user-csv-import.md](./42-round-36-user-csv-import.md)。

同一格式导回。走 `user:create` 和表单校验。不是事务。不上 xlsx。

## 第 37 轮 · 快捷键说明

> 已完成，执行记录见 [43-round-37-shortcut-help.md](./43-round-37-shortcut-help.md)。

`?` / `Ctrl+/` 打开已有快捷键清单。捕获阶段 Esc。不上快捷键库。

## 第 38 轮 · 页脚版权

> 已完成，执行记录见 [44-round-38-footer.md](./44-round-38-footer.md)。

壳底一行版权。年份用函数算。全屏隐藏。不上 ICP。

## 第 39 轮 · 紧凑密度

> 已完成，执行记录见 [45-round-39-density.md](./45-round-39-density.md)。

舒适 / 紧凑。壳用 CSS 变量，antd 用 `small`。persist。

## 第 40 轮 · 记住上次页面

> 已完成，执行记录见 [46-round-40-last-route.md](./46-round-40-last-route.md)。

按账号记目录 path。redirect 优先。没权限或外链回工作台。

## 第 41 轮 · 检查更新

> 已完成，执行记录见 [47-round-41-check-updates.md](./47-round-41-check-updates.md)。

60 秒问版本号。变了出条。`location.reload()`。轮询不上进度条。

## 第 42 轮 · 复制当前路径

> 已完成，执行记录见 [48-round-42-copy-path.md](./48-round-42-copy-path.md)。

用户菜单复制相对 path。不要域名和 hash。

## 第 43 轮 · 用户表列显隐

> 已完成，执行记录见 [49-round-43-user-columns.md](./49-round-43-user-columns.md)。

可选列可关。用户名和操作列不关。导出不受影响。

## 第 44 轮 · 内嵌页

> 已完成，执行记录见 [50-round-44-iframe.md](./50-round-44-iframe.md)。

`meta.iframeSrc` 嵌同源演示页。过滤 javascript:。不上多 iframe 缓存。

## 第 45 轮 · 顶栏导航

> 已完成，执行记录见 [51-round-45-nav-layout.md](./51-round-45-nav-layout.md)。

外观切侧栏 / 顶栏。窄屏仍抽屉。不上 mixed 等整套布局。

## 第 46 轮 · 闲置锁屏

> 已完成，执行记录见 [52-round-46-idle-lock.md](./52-round-46-idle-lock.md)。

外观开 1 / 15 分钟闲置后锁屏。不清 token。隐藏标签页也计时。

## 第 47 轮 · 通知中心

> 已完成，执行记录见 [53-round-47-notices.md](./53-round-47-notices.md)。

顶栏通知列表。已读按账号记在 mock。href 过权限才跳。

## 第 48 轮 · 登录失败锁定

> 已完成，执行记录见 [54-round-48-login-lockout.md](./54-round-48-login-lockout.md)。

连错 3 次锁 1 分钟。只挡登录，不挡解锁。

## 第 49 轮 · 操作日志

> 已完成，执行记录见 [55-round-49-audit.md](./55-round-49-audit.md)。

只读账本。记系统写操作。默认 biz-admin 可见。

## 第 50 轮 · 可配置外链

> 已完成，执行记录见 [56-round-50-embed-links.md](./56-round-50-embed-links.md)。

外链是数据。侧栏项打开 `/embed/编码`。还是 IframeView。

## 第 51 轮 · 未保存离开确认

> 已完成，执行记录见 [57-round-51-unsaved.md](./57-round-51-unsaved.md)。

脏表单先确认再关。同步 `confirm`，不 persist。

## 第 52 轮 · 侧栏宽度

> 已完成，执行记录见 [58-round-52-sidebar-width.md](./58-round-52-sidebar-width.md)。

宽屏展开可拖。persist 与抽屉分开。

## 第 53 轮 · GET 失败重试

> 已完成，执行记录见 [59-round-53-request-retry.md](./59-round-53-request-retry.md)。

GET 5xx / 断网补一次。写操作和轮询不补。

## 第 54 轮 · 表格每页条数

> 已完成，执行记录见 [60-round-54-table-page.md](./60-round-54-table-page.md)。

只记 pageSize。四档。按表键。

## 第 55 轮 · 多标签清会话

> 已完成，执行记录见 [61-round-55-session-sync.md](./61-round-55-session-sync.md)。

一个标签退出，其它标签也回登录页。

## 第 56 轮 · 离线条

> 已完成，执行记录见 [62-round-56-offline.md](./62-round-56-offline.md)。

听浏览器 online / offline。不 ping，不自动重拉。

## 第 57 轮 · 换页取消 GET

> 已完成，执行记录见 [63-round-57-page-abort.md](./63-round-57-page-abort.md)。

path 变了就 abort 上一页 GET。写操作和轮询不挂。

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
| 第 8 轮组件库 | ant-design-vue 4.2.6 | 对照仓是 `web-antd`；官方包最新稳定是 4.x。不上 antdv-next、vxe-table、五套皮肤 |
| 第 18 轮图标 | `@ant-design/icons-vue` 具名引入 | 已跟 antd；不上 Iconify / unplugin-icons |

需要改上述决定时，开新一轮文档，不要默默改这一节而不留痕迹。

## 风险

| 风险 | 表现 | 处理 |
| --- | --- | --- |
| 把 `@core` 整棵搬过来 | 第 2 轮就装不完、类型爆炸 | 先扁平 app |
| 同时换包管理器 + 升 Vue 3.6 | 分不清是 Bun 问题还是 Vapor 问题 | Vue 锁 3.5；3.6 单独开实验分支 |
| 依赖 Vite 插件只测过 Node | `bun run` 调 Vite 一般可用；插件里 `fs`/`path` 出问题再改用 `bun --bun` 或回退 Node 跑 Vite | 第 2 轮验证 |
| 忘记 legacy 被 ignore | 换机器没有对照代码 | 文档和 README 写明；需要时再 clone 上游 |
| 复制旧 `preinstall: only-allow pnpm` | Bun 装不上 | 新仓不要带这段 |
