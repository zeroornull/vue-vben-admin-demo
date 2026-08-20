# 21 · 第 15 轮：暗色开关

日期：2026-08-20。

## 本轮结论

外观三态：跟随系统、浅色、深色。写在 `preferences.themeMode`，刷新还在。

`base.css` 不再用 `@media (prefers-color-scheme: dark) { :root }` 一刀切——那样无法强制浅色。改成 `html[data-theme]`：

- `light`：始终浅色
- `dark`：始终深色
- `system`：媒体查询跟系统

antd 用 `ConfigProvider` 的 `darkAlgorithm`。ECharts 换主题要 `dispose` 再 `init`，不能只 `setOption`。

零新依赖。没有主题色拾色器，没有五套皮肤。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben/preferences` 大对象 + 主题色 | 只加 `themeMode` |
| `@vueuse/core` `usePreferredDark` | 原生 `matchMedia` |
| 主题色 / 圆角 / 紧凑 | **否** |

## 首屏别闪

`index.html` 在 Vue 起来之前读 `localStorage.preferences`，先写 `data-theme`。Pinia persist 的 key 是 store id：`preferences`。

## 关键文件

```text
apps/web/src/preferences/theme.ts
apps/web/src/preferences/use-theme.ts
apps/web/src/components/ThemeToggle.vue
apps/web/src/components/AntdPage.vue
apps/web/src/components/ChartPanel.vue
apps/web/src/assets/base.css
apps/web/index.html
```

登录页和顶栏都有开关，未登录也能改。

## 怎么验收

```bash
bun run dev
```

1. 点开关：跟随系统 → 浅色 → 深色 → 跟随系统
2. 强制浅色后，系统即使是深色，页面仍浅
3. 打开用户页，切深色，表格也变深
4. 打开分析页，切主题，图表跟着换
5. 刷新仍是刚才的选择

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- CSS 变量和组件库主题是两层。只改 `--color-background`，antd 按钮还是白的。
- ECharts 的 `theme` 在 `init` 时定死。主题变了必须卸掉实例。
- `prefers-color-scheme` 写在 `:root` 上，用户就没有「我就要浅色」的否决权。

## 下一轮从哪里开始

第 16 轮做了面包屑，见 [22-round-16-breadcrumb.md](./22-round-16-breadcrumb.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
