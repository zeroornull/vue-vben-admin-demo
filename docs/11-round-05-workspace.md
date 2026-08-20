# 11 · 第 5 轮：工作区业务页

日期：2026-08-19。

## 本轮结论

对照 `legacy/apps/web-antd/src/views/dashboard/workspace`，在 `apps/web` 落地了工作区页：问候头、项目、动态、快捷导航、待办、访问来源。

**没有**把 `@vben/common-ui`、Iconify、ECharts、Tailwind 装进来。卡片和列表是本地小组件；饼图改成数字列表。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben/common-ui` 的 Workbench* / AnalysisChartCard | 不抽包。本地 `views/workspace/*` |
| `@vben/stores` / `@vben/preferences` | 用现有 `useAuthStore` |
| `@vben/utils` 的 `openWindow` | 10 行 `open-url.ts` |
| `@vben/plugins/echarts` + `AnalyticsVisitsSource` | **推迟**。同组数据做成列表，避免为这一页引入 echarts |
| Iconify / `VbenIcon` / `VbenAvatar` | 用色块字母代替图标 |
| 动态里的 `v-html` | 改成纯文本，不当 HTML 渲染 |

本轮 **零新增 npm 依赖**。

## 和旧页的差别

- 快捷导航指向本仓真实路由：`/`、`/workspace`、`/about`（`about` 仍按 admin 过滤）
- 项目卡片外链仍 `window.open`
- 待办可勾选，只存在内存，刷新还原
- 访问来源写明「旧仓是 ECharts，这里是占位」

## 关键文件

```text
apps/web/src/views/
├── WorkspaceView.vue
└── workspace/
    ├── types.ts
    ├── data.ts
    ├── open-url.ts
    ├── WorkspaceHeader.vue
    └── WorkspaceCard.vue
```

## 怎么验收

```bash
bun run dev
```

1. 登录后点侧栏「工作区」
2. 问候语里是当前用户的 `realName`
3. 点项目外链会开新标签；点快捷导航在应用内跳
4. `user` 登录时快捷导航没有「关于」
5. 勾待办，数字「待办 x/y」会变

## 学习笔记

- 业务页先拆「数据 + 导航 + 展示」。展示能用 div 就不要为了像旧仓去装 UI 包。
- 图表、表格、富文本按页加。工作区里图表只是一块点缀，不值得这轮把 echarts 拉进来。
- 旧示例里的 `v-html` 不要原样搬。动态内容以后用结构化字段。

## 下一轮从哪里开始

工程化见 [12-round-06-engineering.md](./12-round-06-engineering.md)。分析页（含 ECharts）见 [13-round-07-analytics.md](./13-round-07-analytics.md)。
