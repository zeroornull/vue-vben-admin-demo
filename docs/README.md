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
| 41 | [round-35-user-csv.md](./41-round-35-user-csv.md) | 第 35 轮 | 用户 CSV 导出；筛选结果；公式转义 |
| 42 | [round-36-user-csv-import.md](./42-round-36-user-csv-import.md) | 第 36 轮 | 用户 CSV 导入；同一校验；user:create |
| 43 | [round-37-shortcut-help.md](./43-round-37-shortcut-help.md) | 第 37 轮 | 快捷键说明；? / Ctrl+/；Esc 分层 |
| 44 | [round-38-footer.md](./44-round-38-footer.md) | 第 38 轮 | 页脚版权；开工年–今年；全屏隐藏 |
| 45 | [round-39-density.md](./45-round-39-density.md) | 第 39 轮 | 紧凑密度；CSS token + antd size |
| 46 | [round-40-last-route.md](./46-round-40-last-route.md) | 第 40 轮 | 记住上次页面；redirect 优先；按账号 |
| 47 | [round-41-check-updates.md](./47-round-41-check-updates.md) | 第 41 轮 | 检查更新；版本号轮询；skipLoadingBar |
| 48 | [round-42-copy-path.md](./48-round-42-copy-path.md) | 第 42 轮 | 复制当前路径；相对地址；不带 hash |
| 49 | [round-43-user-columns.md](./49-round-43-user-columns.md) | 第 43 轮 | 用户表列显隐；锁定用户名；persist |
| 50 | [round-44-iframe.md](./50-round-44-iframe.md) | 第 44 轮 | 内嵌页；同源 iframe；过滤 src |
| 51 | [round-45-nav-layout.md](./51-round-45-nav-layout.md) | 第 45 轮 | 顶栏导航；侧栏 / 顶栏；窄屏仍抽屉 |
| 52 | [round-46-idle-lock.md](./52-round-46-idle-lock.md) | 第 46 轮 | 闲置锁屏；1 / 15 分钟；只锁不清会话 |
| 53 | [round-47-notices.md](./53-round-47-notices.md) | 第 47 轮 | 通知中心；mock 消息；已读按账号 |
| 54 | [round-48-login-lockout.md](./54-round-48-login-lockout.md) | 第 48 轮 | 登录失败锁定；3 次 / 1 分钟 |
| 55 | [round-49-audit.md](./55-round-49-audit.md) | 第 49 轮 | 操作日志；只读；biz-admin 默认可见 |
| 56 | [round-50-embed-links.md](./56-round-50-embed-links.md) | 第 50 轮 | 可配置外链；数据菜单；同一 iframe |
| 57 | [round-51-unsaved.md](./57-round-51-unsaved.md) | 第 51 轮 | 未保存离开确认；`window.confirm`；不 persist |
| 58 | [round-52-sidebar-width.md](./58-round-52-sidebar-width.md) | 第 52 轮 | 侧栏宽度；拖条 persist；抽屉不跟 |
| 59 | [round-53-request-retry.md](./59-round-53-request-retry.md) | 第 53 轮 | GET 失败重试一次；写操作不重试 |
| 60 | [round-54-table-page.md](./60-round-54-table-page.md) | 第 54 轮 | 表格每页条数；四档；按表 persist |
| 61 | [round-55-session-sync.md](./61-round-55-session-sync.md) | 第 55 轮 | 多标签清会话；BroadcastChannel |
| 62 | [round-56-offline.md](./62-round-56-offline.md) | 第 56 轮 | 离线条；navigator.onLine；不 persist |
| 63 | [round-57-page-abort.md](./63-round-57-page-abort.md) | 第 57 轮 | 换页取消 GET；AbortSignal；轮询跳过 |
| 64 | [round-58-batch-session.md](./64-round-58-batch-session.md) | 第 58 轮 | 用户批量删除；多标签锁屏 / 接会话 |
| 65 | [round-59-table-sort.md](./65-round-59-table-sort.md) | 第 59 轮 | 表格排序 persist；操作日志日期范围 |
| 66 | [round-60-batch-recents.md](./66-round-60-batch-recents.md) | 第 60 轮 | 角色/部门/外链批量删除；搜索最近项 |
| 67 | [round-61-search-csv.md](./67-round-61-search-csv.md) | 第 61 轮 | 搜索 ↑↓ 选择；角色 CSV 导出 |
| 68 | [round-62-csv-home.md](./68-round-62-csv-home.md) | 第 62 轮 | 外链/日志 CSV；搜索 Home/End |
| 69 | [round-63-dept-digits.md](./69-round-63-dept-digits.md) | 第 63 轮 | 部门拍扁 CSV；搜索 1-9 |
| 70 | [round-64-dept-import.md](./70-round-64-dept-import.md) | 第 64 轮 | 部门 CSV 导入；搜索 0 |
| 71 | [round-65-role-link-import.md](./71-round-65-role-link-import.md) | 第 65 轮 | 角色/外链 CSV 导入 |
| 72 | [round-66-table-columns.md](./72-round-66-table-columns.md) | 第 66 轮 | 角色/外链/日志列显隐 |
| 73 | [round-67-expand-iframe.md](./73-round-67-expand-iframe.md) | 第 67 轮 | 部门树展开 persist；iframe 重载 |
| 74 | [round-68-leftovers.md](./74-round-68-leftovers.md) | 第 68 轮 | 登录 Form / 页签右键拖拽 / 改密 / 日志导入 / 部门列 |
| 75 | [phase-2-roadmap.md](./75-phase-2-roadmap.md) | 二期规划 | catalog / 拆包 / 薄核 / i18n / 多皮肤 / e2e；第 69–84 轮 |
| 76 | [round-69-catalog.md](./76-round-69-catalog.md) | 第 69 轮 | bun catalog；核心 7 个版本收进根 |
| 77 | [round-70-packages.md](./77-round-70-packages.md) | 第 70 轮 | packages 薄拆；access / request / tables |
| 78 | [round-71-core.md](./78-round-71-core.md) | 第 71 轮 | @app/core 薄核；antd adapter 口子 |
| 79 | [round-72-turbo.md](./79-round-72-turbo.md) | 第 72 轮 | Turbo；lint/test/typecheck/build 走缓存 |
| 80 | [round-73-i18n.md](./80-round-73-i18n.md) | 第 73 轮 | vue-i18n；zh-CN / en-US；语言进 preferences |
| 81 | [round-74-iconify.md](./81-round-74-iconify.md) | 第 74 轮 | Iconify 离线白名单；去掉 icons-vue 直接依赖 |
| 82 | [ele-split.md](./82-ele-split.md) | 规划 | Element 改成第 75–77 轮；后面整段 +2 |
| 83 | [round-75-ele-shell.md](./83-round-75-ele-shell.md) | 第 75 轮 | web-ele 空壳；Element 登录；mock 抽包 |
| 84 | [round-76-ele-users.md](./84-round-76-ele-users.md) | 第 76 轮 | ele 用户表、弹窗、改密 |
| 85 | [round-77-ele-system.md](./85-round-77-ele-system.md) | 第 77 轮 | ele 部门、角色、外链、日志 |
| 86 | [adapter.md](./86-adapter.md) | 专章 | 二期 / adapter：核、两套皮肤、抄路 |
| 87 | [round-78-vitepress.md](./87-round-78-vitepress.md) | 第 78 轮 | VitePress；`bun run docs` |
| 88 | [round-79-vxe.md](./88-round-79-vxe.md) | 第 79 轮 | 默认用户表换 vxe-table |
| 89 | [round-80-naive.md](./89-round-80-naive.md) | 第 80 轮 | web-naive；登录 / 用户 / 部门 / 改密 |
| 90 | [round-81-tdesign.md](./90-round-81-tdesign.md) | 第 81 轮 | web-tdesign；登录 / 用户 / 部门 / 改密 |
| 91 | [round-82-antdv-next.md](./91-round-82-antdv-next.md) | 第 82 轮 | web-antdv-next；与 antd 4 隔离 |
| 92 | [round-83-playwright.md](./92-round-83-playwright.md) | 第 83 轮 | Playwright 烟测默认 app；push / PR 自动 CI |
| 93 | [round-84-vue36-vapor.md](./93-round-84-vue36-vapor.md) | 第 84 轮 | web-vapor；Vue 3.6 RC + Vapor；默认仍 3.5 |

后续轮次会继续加 `08-…`、`09-…`，并在本表追加一行。已拍板的结论不要默默改掉；必须修正时在原文加短注并改决策表（第 1 轮已按此修正：第 2 轮改用 `create-vue`，见 [03](./03-migration-roadmap.md)）。二期若改「一套皮肤 / 不上 Iconify」等决定，按 [75](./75-phase-2-roadmap.md) 执行并回写 [03](./03-migration-roadmap.md) 的表。

## 约定

- **对照源码**一律写 `legacy/...` 路径，不要再写仓库根下的旧路径。
- **新代码**写在 `apps/web`、`apps/web-ele`、`apps/web-naive`、`apps/web-tdesign`、`apps/web-antdv-next`、`apps/web-vapor`、`apps/docs`（以及 `packages/`）。对照源码仍只写 `legacy/...`。站点用 `bun run docs` 打开。
- `legacy/` 只存在于本机，不进 Git。换机器后需要自己再放一份对照仓，或从 [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) 再克隆。
- 文档用中文写决策和理由，代码标识符、包名、命令保持原文。
- **文档不按 UI 库分叉。** 旧仓有 Ant Design Vue / Element Plus / Naive UI / TDesign / antdv-next 五套皮肤，那是 Vben 模板的卖点。本仓库只维护一份教程。盘点里列出五套，只为说明旧仓结构，不会写成五份平行书。对照默认仍是 `legacy/apps/web-antd`。二期若开第二套皮肤，只加一篇 adapter 专章和该皮肤的短记录，见 [75](./75-phase-2-roadmap.md)。
