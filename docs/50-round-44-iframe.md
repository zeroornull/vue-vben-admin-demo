# 50 · 第 44 轮：内嵌页

日期：2026-08-20。

## 本轮结论

侧栏多了「内嵌页」。路由 `meta.iframeSrc` 指向同源 ` /embed-demo.html`。在壳里用 iframe 打开，不是 `window.open`。地址先过 `safeIframeSrc`：只认以 `/` 开头的同源路径，或 `http` / `https`。`javascript:`、`data:`、`//evil.com`、带用户名密码的 URL 丢掉。

iframe 带 `sandbox`，没有 `allow-top-navigation`。旧仓那种「开一堆 iframe 跟着页签缓存」没搬，只嵌当前这一页。访客也能看到（和看工作区一样）。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 多 iframe + tab 缓存 | **否**。当前路由一个框 |
| 随便嵌外站 | **否**。演示用同源 HTML。外站常有 X-Frame-Options |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/views/iframe/src.ts
apps/web/src/views/IframeView.vue
apps/web/public/embed-demo.html
apps/web/src/access/catalog.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 或 `user` 打开内嵌页，框里是「同源演示页」那段说明
2. 角色里能勾选「内嵌页」；去掉后该账号再登录，侧栏没有、直接打开 `/embed` 到 403
3. 顶栏刷新会重挂 iframe（KeepAlive 被踢），不是浏览器 F5

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- `iframe src="javascript:..."` 能在框里跑脚本。过滤要比「看起来像网址」更严。
- `sandbox` 没有 `allow-same-origin` 时，同源页也被当成独立源。脚本还能跑（有 `allow-scripts`），但不能读父页 DOM。
- 很多文档站禁嵌。失败时框是空的或报拒绝，那是对方的头，不是路由坏了。
- 这和第 42 轮复制路径一样：只信相对 path 或明确协议，不信 `//`。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
