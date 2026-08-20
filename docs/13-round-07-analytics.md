# 13 · 第 7 轮：分析页

日期：2026-08-19。

## 本轮结论

对照 `legacy/apps/web-antd/src/views/dashboard/analytics`，在 `apps/web` 落地了分析页：四格概览、流量趋势 / 月访问量切换、雷达、饼图、玫瑰图。

工作区那一轮故意没上图表库。分析页几乎全是图，再做成数字列表就不是这一页了，所以 **按需引入 ECharts**。没有搬 `@vben/plugins/echarts`，也没有为了 resize / 暗色去装 `@vueuse/core`。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben/common-ui` 的 AnalysisOverview / AnalysisChartsTabs / AnalysisChartCard | 本地 markup + 已有 `WorkspaceCard` |
| `@vben/icons` | 概览只用数字，不上 SVG 图标包 |
| `@vben/plugins/echarts` 的 `EchartsUI` + `useEcharts` | 本地 `ChartPanel` + `lib/echarts.ts` |
| `echarts` | **新增**。按图表类型按需 `echarts.use` |
| `@vueuse/core`（debounce / resize / timeout） | 原生 `ResizeObserver` + `window.resize` |
| `@vben/preferences` 暗色主题 | `matchMedia('(prefers-color-scheme: dark)')` 选 ECharts `dark` |

本轮只新增 **echarts**。`bun add --filter @app/web` 会去 npm 找名为 `@app/web` 的包（404）；依赖写在 `apps/web/package.json` 后，在仓库根跑 `bun install`。

## 真实装上的版本

| 包 | 锁定 |
| --- | --- |
| echarts | 6.1.0 |

## 和旧页的差别

- 路由是 `/analytics`，菜单名「分析」，所有已登录角色可见
- Tab 用 `v-if` 切换，避免隐藏容器宽高为 0 时 init 图表
- 工作区快捷导航补了「分析」；工作区「访问来源」仍是列表，并指向分析页
- 图表 option 抽到纯函数，单测不挂 canvas

## 关键文件

```text
apps/web/src/
├── lib/echarts.ts
├── components/ChartPanel.vue
├── views/AnalyticsView.vue
└── views/analytics/
    ├── types.ts
    ├── data.ts
    ├── chart-options.ts
    └── __tests__/chart-options.spec.ts
```

## 怎么验收

```bash
bun run dev
```

1. 登录后侧栏点「分析」
2. 概览四格数字是中文千分位
3. 「流量趋势 / 月访问量」切换会换图
4. 下面三张图（雷达、环形、玫瑰）都出来
5. 缩侧栏或改窗口宽度，图会跟着 resize

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- ECharts 全量 `import * as echarts from 'echarts'` 也能跑，但分析页只用 line / bar / pie / radar。按需注册能少打一截进 bundle。分析路由是懒加载，echarts 跟在 `AnalyticsView` 那个 chunk 里（构建约 568 kB / gzip 193 kB），不进首页包。
- 旧仓的 `useEcharts` 还处理 keep-alive、暗色切换、隐藏容器重试。本仓没有 keep-alive，先不做那套。
- 图表 option 和 Vue 组件拆开：option 可以单测，组件只负责 init / dispose / resize。
- `toLocaleString('zh-CN')` 依赖运行时 locale 数据；测试里断言 `120,000`，和 Bun / Node 默认一致。

## 下一轮从哪里开始

组件库 + 用户 Form/Table 见 [14-round-08-antd-users.md](./14-round-08-antd-users.md)。
