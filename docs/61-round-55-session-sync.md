# 61 · 第 55 轮：多标签清会话

日期：2026-08-20。

## 本轮结论

一个标签点退出，或请求打到 401，其它开着的标签也会清 token、拆动态路由、回登录页。通道是 `BroadcastChannel`，名字 `vue-admin-session`。发送端自己收不到，所以退出的那个标签仍走原来的 `logout` / `handleUnauthorized`。

对端若已经没 token，不再清一遍，也不再广播，避免来回踢。登录、换账号、锁屏不同步——那些会把「清会话」和「接会话」搅在一起。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 轮询 localStorage / `storage` 事件 | **否**。显式消息 |
| 登录成功也广播，别的标签跟着重登 | **否**。本轮只清 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/auth/session-broadcast.ts
apps/web/src/auth/session-leave.ts
apps/web/src/auth/use-session-sync.ts
apps/web/src/stores/auth.ts
apps/web/src/App.vue
```

## 怎么验收

```bash
bun run dev
```

1. 两个窗口打开同一个 origin，都用 `vben` 登录
2. 窗口 A 点退出，窗口 B 应回到登录页，侧栏没了
3. 只开一个窗口退出，行为与以前一样

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- `pinia-plugin-persistedstate` 会改 localStorage，但别的标签内存里的 store 不会自己跟上。要显式通知。
- `BroadcastChannel` 不回传给自己。清会话的逻辑仍在本标签走一遍，广播只招呼别人。
- 对端 `clearSession({ broadcast: false })`。否则 B 清完再广播，A 又清一次，没完。
- 没有 `BroadcastChannel`（测试环境、老内核）就当没这能力，不要为此装 polyfill。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
