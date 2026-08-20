# 34 · 第 28 轮：布局全屏

日期：2026-08-20。

## 本轮结论

顶栏加了「全屏」。侧栏、顶栏、页签、面包屑藏起来，内容铺满。右上角「退出全屏」，Escape 也能退。

这不是浏览器 Fullscreen API，也不是 F11。不调 `requestFullscreen`。不写 persist：刷新或退出登录，壳回来。侧栏收起偏好不动。

搜索面板 `Teleport` 到 `body`，顶栏 `display: none` 时 Ctrl+K 仍能弹出。锁屏时不退全屏，也不显示退出按钮。搜索或用户菜单先按 Escape，只关自己的层（`preventDefault`），不会连带退出全屏。

登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `document.documentElement.requestFullscreen` | **否**。那是系统全屏，和「藏壳」不是一件事 |
| 全屏写进 preferences | **否**。和窄屏抽屉一样，是视口态 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/layouts/content-fullscreen.ts
apps/web/src/layouts/BasicLayout.vue
apps/web/src/layouts/AppSearch.vue   # overlay Teleport 到 body
apps/web/src/layouts/UserMenu.vue    # Escape 先关菜单
```

## 怎么验收

```bash
bun run dev
```

1. 点「全屏」：侧栏、顶栏、页签、面包屑消失，内容还在
2. 右上角「退出全屏」或 Escape，壳回来；侧栏是收还是开，和进去之前一样
3. 全屏时 Ctrl+K 仍能搜
4. 全屏后再锁屏：没有退出按钮；解开还是全屏
5. 刷新：壳在，不是全屏
6. F11 仍是浏览器自己的全屏，和这个按钮无关

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 藏壳和系统全屏要分开。系统全屏会把浏览器 UI 也拿掉，权限可能被拒，iframe 里也常不可用。
- 视口态不要 persist。刷新后还藏着顶栏，人会以为应用坏了。
- Escape 分层：谁先打开谁先收。打开的层要 `preventDefault`，下面的监听才能知道「这键已经用过了」。
- 顶栏 `display: none` 会把里面 `position: fixed` 的层一起藏掉。搜索 overlay 必须 `Teleport` 到 `body`，全屏时 Ctrl+K 才看得见。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
