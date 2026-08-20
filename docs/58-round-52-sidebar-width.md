# 58 · 第 52 轮：侧栏宽度

日期：2026-08-20。

## 本轮结论

宽屏展开侧栏时，右边可以拖宽度。范围 180–360，默认 220，写进 `preferences.sidebarWidth`。拖的时候只改画面，松手才 persist。键盘左右键步进 8，Home / End 到两端，双击或外观里的「侧栏 220」回到默认。

收起后的图标栏、顶栏导航、窄屏抽屉都不读这个数。抽屉仍是 `min(220px, 85vw)`。和收起偏好一样：视口怎么显示，跟用户存了什么，分开算。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 旧仓偏好里的侧栏宽（本对照仓没有现成项） | **自己做**。CSS 变量 + 拖条 |
| 拖的时候每像素写 localStorage | **否**。松手再 `setSidebarWidth` |
| 窄屏抽屉跟桌面宽走 | **否**。视口自己决定 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/preferences/sidebar-width.ts
apps/web/src/layouts/sidebar-chrome.ts
apps/web/src/layouts/BasicLayout.vue
apps/web/src/stores/preferences.ts
apps/web/src/components/SidebarWidthReset.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 宽屏拖侧栏右边，松手刷新，宽度还在
2. 收起侧栏变成图标栏；再展开回到刚才的宽
3. 外观改成顶栏，没有拖条；改回侧栏，宽度还在
4. 窗口缩到窄屏，抽屉仍约 220，不是桌面那一档
5. 外观点「侧栏 …」回到 220

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 用户偏好是「想要多宽」。`sidebarChrome` 才决定现在用不用。不要在 CSS 里把 persist 和抽屉写死成同一个 `--sidebar-width`。
- `setPointerCapture` 让指针离开把手也能收到 move / up。不要去听 `window.mousemove`。
- 拖动中的值放本地 ref，persist 只在 pointerup。否则插件每次 move 都写盘。
- `window.confirm` 能同步，拖宽不能：松手才是一次完整动作。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
