# 47 · 第 41 轮：检查更新

日期：2026-08-20。

## 本轮结论

应用起来后每 60 秒问一次 `GET /version`。第一次只记下当前 `buildId`。以后若变了，顶上出条：刷新 / 稍后。刷新走 `location.reload()`，和第 29 轮「重挂当前页」不是一回事。

轮询带 `skipLoadingBar`、`skipErrorToast`。标签隐藏或锁屏时不问。旧仓是 HEAD 首页吃 etag，本地 Vite 会乱跳，所以本仓用版本号接口。关于页有「模拟发版」，给本地把 mock 号 +1，立刻再拉一次，不必干等到下一分钟。

不 persist 条。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| HEAD `index.html` + etag | **否**。dev server 的 etag 不代表发版 |
| `@vben-core/popup-ui` 模态框 | **否**。一条非阻断横条 |
| 在 localhost 直接关闭检查 | **否**。学习仓要能看见 |

## 关键文件

```text
apps/web/src/updates/version.ts
apps/web/src/stores/updates.ts
apps/web/src/components/AppUpdateBar.vue
apps/web/vite/version-store.ts
apps/web/src/views/AboutView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 打开关于，点「模拟发版」，顶上出现更新条，进度条不应闪
2. 点「稍后」，条消失；再点一次模拟发版，条回来
3. 点「刷新」，页面整页重载，条不再出现
4. 锁屏后不应靠轮询把条打出来（先锁屏再在别的标签发版，解屏后切回再查）

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 第 29 轮的刷新只踢 KeepAlive。发版后旧 JS 还在内存里，必须 `location.reload()` 才拿到新资源。
- 轮询若走进度条，每分钟顶栏绿一下，像在出错。`skipLoadingBar` 就是给这种后台问询的。
- 旧仓跳过 localhost，是因为 Vite 改文件就会换 etag。版本号接口把「资源变了」和「开发热更新」分开。
- 条不要做成必须立刻刷新的模态。有人正在填表。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
