# 43 · 第 37 轮：快捷键说明

日期：2026-08-20。

## 本轮结论

顶栏加了「快捷键」。`?` 或 `Ctrl+/`（Mac 用 `⌘/`）打开同一块说明。清单是数据，不是写死在模板里的三行字。只收录**已经存在**的键：搜索、说明自己、Esc 分层。不给刷新 / 全屏再发明一套快捷键。

说明是壳上的浮层，Teleport 到 `body`，z-index **32**（搜索 30，锁屏 40）。开着状态不 persist。锁屏时关掉、也不再打开。输入框里的 `?` 不当快捷键；`Ctrl+/` 是组合键，输入时也能开。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| antd Modal / Drawer | **否**。和搜索一样的 CSS 浮层 |
| 快捷键库（tinykeys / hotkeys-js） | **否**。三个键不值得 |
| 给每个顶栏按钮配快捷键 | **否**。没有的不编 |

## 关键文件

```text
apps/web/src/layouts/shortcut-help.ts
apps/web/src/layouts/AppShortcutHelp.vue
apps/web/src/layouts/BasicLayout.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 按 `?`，看到 Ctrl+K / ? / Esc 三条
2. 打开搜索后再按 `Ctrl+/`，说明盖在搜索上面；Esc 先关说明，搜索还在
3. 搜索框里打 `?`，说明不会开
4. 布局全屏后按 `?` 仍能开（Teleport 不在被藏的顶栏里）
5. 锁屏后按 `?` 不会出说明

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 快捷键 overlay 和搜索一样：顶栏在 `display: none` 时，组件还在，Teleport 出去的节点仍在 `body`。监听挂在 `window` 上才靠得住。
- Esc 分层靠 `preventDefault`。说明用**捕获阶段**先收 Esc，否则搜索（先挂上的冒泡监听）会先把自己关了。
- `event.key === '?'` 在不同键盘上通常是 Shift+/。不要用 `event.code === 'Slash'` 再自己猜 Shift，AZERTY 会对不上。
- `INPUT type="button"` 不是在打字。只拦 text / search / password 这类。
- 清单写「已有的键」，不要为了面板好看去加没接上的快捷键。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
