# 26 · 第 20 轮：窄屏侧栏

日期：2026-08-20。

## 本轮结论

宽度 ≤ 768px 时，侧栏改成抽屉：默认藏在左边，点「展开菜单」盖上来，点遮罩、点菜单或按 Escape 关掉。

宽屏仍用 `preferences.sidebarCollapsed`。窄屏的开合是内存里的 `drawerOpen`，**不写进 persist**。桌面收起再缩窗口，不会把「收起」存成抽屉状态；拉回宽屏，还是你上次的收起/展开。

不上 `@vueuse/core`。`matchMedia` 和主题那轮同一套路。登录页 Form、页签右键仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vueuse/core` `useMediaQuery` / `useBreakpoints` | **否**。原生 `matchMedia` |
| 把窄屏写进 `sidebarCollapsed` | **否**。视口不是用户偏好 |
| 新 npm 包 | **零** |

四种壳：

| chrome | 何时 |
| --- | --- |
| `docked-open` | 宽屏 + 未收起 |
| `docked-collapsed` | 宽屏 + 收起（只留图标） |
| `drawer-closed` | 窄屏 + 抽屉关 |
| `drawer-open` | 窄屏 + 抽屉开（始终出标题，不是图标条） |

## 关键文件

```text
apps/web/src/layouts/sidebar-chrome.ts
apps/web/src/layouts/use-narrow.ts
apps/web/src/layouts/BasicLayout.vue
apps/web/src/layouts/__tests__/sidebar-chrome.spec.ts
```

`stores/preferences.ts` 没改。

## 怎么验收

```bash
bun run dev
```

1. 宽屏收起侧栏，刷新仍是收起
2. 把窗口拖到 768 以下：内容全宽，侧栏消失
3. 点「展开菜单」：抽屉和遮罩出来；点一条菜单，抽屉关上
4. Escape 或点遮罩也能关
5. 拉回宽屏：回到第 1 步的收起，没有被窄屏改掉
6. 登录页不受影响（不在壳里）

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 视口驱动的 UI 和用户勾选的偏好要分开。混进同一个 persist 字段，缩窗口就会污染桌面布局。
- 和主题一样：JS 算出一种 chrome，CSS 只认 class。不要再写一套 `@media (max-width: 768px)` 去藏侧栏，断点和 JS 会对不上。
- 关上的抽屉用 `inert` + `aria-hidden`，光标和读屏都进不去。只靠 `translateX(-100%)` 不够。

## 下一轮从哪里开始

第 21 轮做了顶栏用户菜单，见 [27-round-21-user-menu.md](./27-round-21-user-menu.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
