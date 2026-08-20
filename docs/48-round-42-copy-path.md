# 48 · 第 42 轮：复制当前路径

日期：2026-08-20。

## 本轮结论

用户菜单加了「复制路径」。写入剪贴板的是相对地址：`/users` 或 `/users?name=a`。不要 `window.location.href`（带当前主机），也不要 hash（有的系统会把 token 放在 `#` 后面）。

不是目录里的页也能复制（404 也能）。`//evil.com` 和绝对 URL 直接丢掉。成功后按钮变成「已复制」1.5 秒，不上 toast，不加快捷键（Ctrl+C 是复制选区）。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `document.execCommand('copy')` | **否**。只走 `clipboard.writeText`，失败就保持原文案 |
| 复制完整 URL | **否**。预览域名和本地不一致 |
| 顶栏再加一颗按钮 | **否**。顶栏已经挤 |

## 关键文件

```text
apps/web/src/layouts/copy-path.ts
apps/web/src/layouts/UserMenu.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 打开用户，用户菜单点「复制路径」，粘贴应是 `/users`
2. 按钮短暂变成「已复制」，菜单还开着
3. 无权限的 `user` 打开工作区，复制应是 `/workspace`

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- `route.fullPath` 已经是 path + query + hash。复制前去掉 hash，不要再拼 `origin`。
- 剪贴板 API 要安全上下文（https 或 localhost）。失败时不要假装成功。
- 这和「记住上次页面」不同：上次只收目录 path；复制可以带筛选 query，给人分享当前列表。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
