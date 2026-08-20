# 51 · 第 45 轮：顶栏导航

日期：2026-08-20。

## 本轮结论

外观菜单加了「侧栏 / 顶栏」。默认侧栏。宽屏选顶栏时，菜单搬到顶栏，侧栏整列拿掉，收起按钮也藏掉。窄屏（≤768）仍走抽屉，**不读**顶栏偏好——这和「桌面收起」一样，视口态跟 persist 分开。

旧仓那种 sidebar / mixed / header-sidebar / header-mixed 整套布局模式没搬。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 四种以上布局模式 + `@vben/preferences` 大对象 | **否**。两个值：`sidebar` / `top` |
| 顶栏用 antd Menu | **否**。壳继续 CSS-native |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/preferences/nav-layout.ts
apps/web/src/components/NavLayoutToggle.vue
apps/web/src/layouts/sidebar-chrome.ts
apps/web/src/layouts/BasicLayout.vue
apps/web/src/stores/preferences.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 登录，外观点到「顶栏」：左边没侧栏，菜单在顶上；「系统」仍是分组标题
2. 刷新仍是顶栏
3. 把窗口缩到很窄：菜单回到抽屉，顶栏偏好还在；拉宽后又是顶栏
4. 再点回「侧栏」

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 布局模式是 chrome 的一种，不是新路由。`useAccessMenu` 同一份分组，侧栏竖排、顶栏横排。
- 窄屏优先于顶栏偏好。否则手机上既没侧栏也点不开菜单。
- `sidebarCollapsed` 在顶栏时不生效，但 persist 还留着。切回侧栏时还是你上次的收起/展开。
- 不要为了顶栏去 `addRoute` 或改 `menuCode`。权限和菜单数据没变，只是摆放变了。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
