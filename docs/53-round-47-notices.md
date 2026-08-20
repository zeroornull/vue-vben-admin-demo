# 53 · 第 47 轮：通知中心

日期：2026-08-20。

## 本轮结论

顶栏加了「通知」。三条 mock 消息，按账号记已读。点一条先标已读，href 只认以 `/` 开头的站内路径；对不上目录、或当前账号过不了 `canAccessRoute` 的，不跳转。没有单独的通知页，也不轮询。

已读存在 Vite mock 进程里，刷新还在，重启 dev 会回到未读。不要写进 `localStorage`。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 通知页 + 多类型（公告 / 待办 / 消息） | **否**。顶栏一份列表 |
| WebSocket / 轮询 | **否**。登录后拉一次 |
| antd Badge / Dropdown 进壳 | **否**。CSS-native |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/notices/query.ts
apps/web/src/layouts/AppNoticeBell.vue
apps/web/src/stores/notices.ts
apps/web/src/api/notices.ts
apps/web/vite/notices-store.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 登录，顶栏通知有数字 3。打开「欢迎使用」会到个人中心，数字变 2
2. 「全部已读」后数字消失；刷新仍是已读
3. `user` 点「用户表可以导出 CSV」只已读，不会进 /users（访客没有用户菜单）
4. 重启 `bun run dev` 后三条又变成未读

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 通知里的链接跟第 42 轮复制路径、第 44 轮 iframe 一样：只信相对 path，不信 `//` 和带协议的外链。
- 已读是账号态，不是全局 preferences。`vben` 读过不影响 `user`。
- 拉列表用 `skipLoadingBar` + `skipErrorToast`。顶栏小请求不要带动整页进度条。
- 没有权限就 403，和「点了不跳」比，后者更接近通知的用途：告诉你有这件事，不替你硬闯。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
