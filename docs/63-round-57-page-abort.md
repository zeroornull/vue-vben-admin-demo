# 63 · 第 57 轮：换页取消 GET

日期：2026-08-20。

## 本轮结论

路由 `path` 变了，上一页还在飞的 GET 会被 `AbortSignal` 取消。取消不出错误条、不重试、进度条会 `end`。同一 path 再进一次守卫（刚生成动态路由后的 replace）不旋转信号，免得把 `fetchUserInfo` 自己掐掉。

只给 GET 挂页级信号。POST / PUT / DELETE 不挂，避免保存到一半被换页打断。通知、检查更新带 `skipAbort`，换页后还继续轮询。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| axios CancelToken（旧 API） | **否**。`AbortSignal` |
| 每个页面自己 new AbortController | **否**。守卫里一个页级信号 |
| 写操作也取消 | **否** |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/api/abort.ts
apps/web/src/api/request.ts
apps/web/src/router/guard.ts
apps/web/src/api/notices.ts
apps/web/src/api/version.ts
```

## 怎么验收

```bash
bun run test
```

看 `abort.spec.ts` 和 `request.spec.ts` 里「已取消、不出条、pending 归零」。

手工：用户页慢网下立刻点部门，不该再弹出用户列表的错误条。

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 取消是成功路径的一种结束，不是业务失败。不要 toast，也不要当 500 去重试。
- 守卫里 `generatedNow` 会再 replace 一次同一 path。按 path 而不是 fullPath 决定是否旋转。
- 轮询若挂上页级信号，每次点菜单都会死。`skipAbort` 和 `skipRetry` 是一对。
- KeepAlive 回来不会自动重拉。取消的是「不该再落地的旧响应」，不是「回来补一枪」。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
