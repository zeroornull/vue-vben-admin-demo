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

后续轮次会继续加 `08-…`、`09-…`，并在本表追加一行。已拍板的结论不要默默改掉；必须修正时在原文加短注并改决策表（第 1 轮已按此修正：第 2 轮改用 `create-vue`，见 [03](./03-migration-roadmap.md)）。

## 约定

- **对照源码**一律写 `legacy/...` 路径，不要再写仓库根下的旧路径。
- **新代码**写在 `apps/web`（以及以后的 `packages/`）。对照源码仍只写 `legacy/...`。
- `legacy/` 只存在于本机，不进 Git。换机器后需要自己再放一份对照仓，或从 [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) 再克隆。
- 文档用中文写决策和理由，代码标识符、包名、命令保持原文。
- **文档不按 UI 库分叉。** 旧仓有 Ant Design Vue / Element Plus / Naive UI / TDesign / antdv-next 五套皮肤，那是 Vben 模板的卖点。本仓库只维护一份文档、一个 `apps/web`。盘点里列出五套，只为说明旧仓结构，不会写成五份平行教程。对照实现固定为 `legacy/apps/web-antd`；需要组件库时再选一套，写进当时那一轮的记录。第二套皮肤出现之前，不写 adapter 专章。
