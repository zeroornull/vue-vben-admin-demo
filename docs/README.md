# 迁移与学习文档

这套文档分多轮写，每一轮同时做两件事：

1. **迁移**：把旧仓能力搬到 Bun + TypeScript + 最新 Vue
2. **学习**：把本轮碰到的工具、API、架构决策讲清楚，方便以后自己改

旧仓官方文档仍可在本地打开：`legacy/docs/`（VitePress），线上版是 [doc.vben.pro](https://doc.vben.pro/)。

## 阅读顺序

| 编号 | 文档 | 本轮 | 用途 |
| --- | --- | --- | --- |
| 00 | [overview.md](./00-overview.md) | 第 1 轮 | 目标、边界、新旧栈对照 |
| 01 | [legacy-inventory.md](./01-legacy-inventory.md) | 第 1 轮 | 旧仓目录、应用、包、依赖盘点 |
| 02 | [architecture.md](./02-architecture.md) | 第 1 轮 | 启动链路、权限、适配器、分层 |
| 03 | [migration-roadmap.md](./03-migration-roadmap.md) | 第 1 轮 | 分轮路线、验收标准、风险 |
| 04 | [learn-bun.md](./04-learn-bun.md) | 第 1 轮 | Bun 运行时 / 包管理 / workspace / catalog |
| 05 | [learn-vue-ts.md](./05-learn-vue-ts.md) | 第 1 轮 | 最新 Vue、TS、周边库怎么学 |
| 06 | [command-mapping.md](./06-command-mapping.md) | 第 1 轮 | pnpm / Turbo 与 Bun 命令对照 |
| 07 | [round-01-log.md](./07-round-01-log.md) | 第 1 轮 | 本轮做了什么、下一轮从哪开始 |
| 08 | [round-02-scaffold.md](./08-round-02-scaffold.md) | 第 2 轮 | create-vue 初始化、Bun workspace、真实版本 |
| 09 | [round-03-login.md](./09-round-03-login.md) | 第 3 轮 | 登录闭环、请求客户端、前端角色 |
| 10 | [round-04-layout.md](./10-round-04-layout.md) | 第 4 轮 | 侧栏顶栏壳、按角色菜单、preferences |
| 11 | [round-05-workspace.md](./11-round-05-workspace.md) | 第 5 轮 | 工作区业务页（未引入图表库） |
| 12 | [round-06-engineering.md](./12-round-06-engineering.md) | 第 6 轮 | oxlint、Vitest；CI 文件保留但已停自动跑 |
| 13 | [round-07-analytics.md](./13-round-07-analytics.md) | 第 7 轮 | 分析页；按需引入 ECharts，不搬 @vben/plugins |
| 14 | [round-08-antd-users.md](./14-round-08-antd-users.md) | 第 8 轮 | 选定 ant-design-vue；用户 Form / Table / mock CRUD |
| 15 | [round-09-depts.md](./15-round-09-depts.md) | 第 9 轮 | 部门树表；侧栏「系统」分组；无新依赖 |
| 16 | [round-10-user-dept.md](./16-round-10-user-dept.md) | 第 10 轮 | 用户挂部门；筛选含下级；有人不能删部门 |
| 17 | [round-11-roles.md](./17-round-11-roles.md) | 第 11 轮 | 业务角色 CRUD；用户多选角色；与登录权限分开 |
| 18 | [round-12-role-menus.md](./18-round-12-role-menus.md) | 第 12 轮 | 角色绑菜单；登录后 addRoute；403 / 404 分清 |
| 19 | [round-13-button-access.md](./19-round-13-button-access.md) | 第 13 轮 | 按钮操作码；藏按钮；mock 写接口也校验 |
| 20 | [round-14-tabs.md](./20-round-14-tabs.md) | 第 14 轮 | 页签；KeepAlive；工作台钉住 |
| 21 | [round-15-theme.md](./21-round-15-theme.md) | 第 15 轮 | 浅色 / 深色 / 跟随系统；antd 与图表同步 |
| 22 | [round-16-breadcrumb.md](./22-round-16-breadcrumb.md) | 第 16 轮 | 面包屑；分组段不能跳；工作台上藏条 |
| 23 | [round-17-v-access.md](./23-round-17-v-access.md) | 第 17 轮 | v-access；操作列和写接口仍走函数 |
| 24 | [round-18-menu-icons.md](./24-round-18-menu-icons.md) | 第 18 轮 | 侧栏图标；`meta.icon` 登记名；无 Iconify |
| 25 | [round-19-tab-icons.md](./25-round-19-tab-icons.md) | 第 19 轮 | 页签复用同一套图标；persist 用 name 回退 |
| 26 | [round-20-narrow-sidebar.md](./26-round-20-narrow-sidebar.md) | 第 20 轮 | 窄屏抽屉侧栏；不改已保存的收起偏好 |
| 27 | [round-21-user-menu.md](./27-round-21-user-menu.md) | 第 21 轮 | 顶栏用户菜单；登录角色与业务角色分开 |
| 28 | [round-22-lock-screen.md](./28-round-22-lock-screen.md) | 第 22 轮 | 锁屏；解锁走当前账号密码；不清会话 |
| 29 | [round-23-profile.md](./29-round-23-profile.md) | 第 23 轮 | 个人中心；静态路由；看会话不是系统用户 |
| 30 | [round-24-profile-name.md](./30-round-24-profile-name.md) | 第 24 轮 | 改显示名；只写登录会话，不写系统用户表 |
| 31 | [round-25-menu-search.md](./31-round-25-menu-search.md) | 第 25 轮 | 菜单搜索；Ctrl+K；hideInMenu 能搜到 |
| 32 | [round-26-loading-bar.md](./32-round-26-loading-bar.md) | 第 26 轮 | 请求进度条；pending 计数；不上 nprogress |
| 33 | [round-27-watermark.md](./33-round-27-watermark.md) | 第 27 轮 | 页面水印；显示名 · 账号；偏好可关 |
| 34 | [round-28-content-fullscreen.md](./34-round-28-content-fullscreen.md) | 第 28 轮 | 布局全屏；藏壳不调 Fullscreen API |
| 35 | [round-29-view-refresh.md](./35-round-29-view-refresh.md) | 第 29 轮 | 刷新当前页；清 KeepAlive，不是 F5 |
| 36 | [round-30-error-toast.md](./36-round-30-error-toast.md) | 第 30 轮 | 请求错误条；登录和 401 不出 |
| 37 | [round-31-color-filter.md](./37-round-31-color-filter.md) | 第 31 轮 | 色弱 / 灰色；整页 filter；不是无障碍 |
| 38 | [round-32-back-top.md](./38-round-32-back-top.md) | 第 32 轮 | 回到顶部；听 window 滚动 |
| 39 | [round-33-document-title.md](./39-round-33-document-title.md) | 第 33 轮 | 浏览器标签标题；页名 · 应用名 |
| 40 | [round-34-appearance-menu.md](./40-round-34-appearance-menu.md) | 第 34 轮 | 外观菜单；水印 / 色弱 / 主题收进面板 |

后续轮次会继续加 `08-…`、`09-…`，并在本表追加一行。已拍板的结论不要默默改掉；必须修正时在原文加短注并改决策表（第 1 轮已按此修正：第 2 轮改用 `create-vue`，见 [03](./03-migration-roadmap.md)）。

## 约定

- **对照源码**一律写 `legacy/...` 路径，不要再写仓库根下的旧路径。
- **新代码**写在 `apps/web`（以及以后的 `packages/`）。对照源码仍只写 `legacy/...`。
- `legacy/` 只存在于本机，不进 Git。换机器后需要自己再放一份对照仓，或从 [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) 再克隆。
- 文档用中文写决策和理由，代码标识符、包名、命令保持原文。
- **文档不按 UI 库分叉。** 旧仓有 Ant Design Vue / Element Plus / Naive UI / TDesign / antdv-next 五套皮肤，那是 Vben 模板的卖点。本仓库只维护一份文档、一个 `apps/web`。盘点里列出五套，只为说明旧仓结构，不会写成五份平行教程。对照实现固定为 `legacy/apps/web-antd`；需要组件库时再选一套，写进当时那一轮的记录。第二套皮肤出现之前，不写 adapter 专章。
