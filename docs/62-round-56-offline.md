# 62 · 第 56 轮：离线条

日期：2026-08-20。

## 本轮结论

浏览器派发 `offline` 时，底栏出现「网络已断开」。`online` 后消失。听的是 `navigator.onLine` 和窗口事件，不 persist，不去 ping `/api`。连上后也不自动重拉列表——用户自己点刷新或再查一次。

这不是无障碍，也不是请求队列。GET 重试（第 53 轮）仍只补一次。登录页也会看到这条。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 自己 ping 健康检查 | **否**。听浏览器 |
| 断网时挡住所有按钮 | **否**。只提示 |
| 连上自动 refetch | **否** |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/network/online.ts
apps/web/src/network/use-online.ts
apps/web/src/components/AppOfflineBar.vue
apps/web/src/App.vue
```

## 怎么验收

```bash
bun run dev
```

1. Chrome DevTools → Network → Offline，底栏出现提示
2. 取消 Offline，条消失
3. 锁屏时条仍在（z-index 51，锁是 40）

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- `navigator.onLine === true` 只表示「系统觉得有网」。公司代理、热点登录页都会骗它。不要拿它当健康检查。
- 视口状态不要 persist。刷新时若已连上，不该还挂着「已断开」。
- 条放底部，免得和顶上的更新条、错误条抢位置。
- 没有 `navigator`（测试、SSR）当成在线，避免先闪一条再消失。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
