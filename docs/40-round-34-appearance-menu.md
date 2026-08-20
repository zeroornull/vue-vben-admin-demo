# 40 · 第 34 轮：外观菜单

日期：2026-08-20。

## 本轮结论

水印、色弱、深浅收进顶栏「外观」。搜索、刷新、全屏还是动作，不进这个菜单。登录页和锁屏也用同一颗按钮。

打开态不 persist。点外面或 Escape 关掉；Escape 会 `preventDefault`，避免连带退出布局全屏。用户菜单的点外关闭抽成了 `shouldClosePopover`，两处共用。

不要上 antd Dropdown。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| antd `Dropdown` / `Popover` | **否**。和用户菜单一样用 CSS 面板 |
| 偏好设置整页 | **否**。三个开关不够单开一页 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/layouts/popover.ts
apps/web/src/components/AppearanceMenu.vue
apps/web/src/layouts/UserMenu.vue
apps/web/src/layouts/BasicLayout.vue
apps/web/src/views/LoginView.vue
apps/web/src/layouts/LockScreen.vue
```

## 怎么验收

```bash
bun run dev
```

1. 顶栏不再并排「水印开 / 原色 / 跟随系统」，只剩「外观」
2. 点开可切水印、色弱、深浅；刷新后偏好还在
3. 点外面或 Escape，菜单关；布局全屏不会一起退
4. 登录页、锁屏同样有「外观」

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 顶栏按钮分成两类：动作（搜、刷新、全屏）和偏好（水印、滤镜、主题）。偏好可以进菜单，动作最好仍一眼看见。
- 两个弹出层都要会点外关闭。逻辑抽成纯函数，避免用户菜单和外观菜单各写一套漏掉 Escape。
- 打开态是视口态。刷新后菜单应是关的，开关本身才 persist。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
