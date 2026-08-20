# 36 · 第 30 轮：请求错误条

日期：2026-08-20。

## 本轮结论

失败请求会在窗口上方出一条红字，4 秒后自己消失，点一下也能关。挂在 `unwrap`，所以 HTTP 失败和业务 `code !== 0` 都能出。不上 antd `message` 当全局条。

登录、解锁、退出传 `skipErrorToast`：这三处自己有表单/流程，再出条会叠两条。HTTP 401 也不出条，人已经被带回登录页。

用户 / 部门 / 角色 / 个人中心的接口 `catch` 不再 `message.error`。校验失败、成功提示、删除前的 warning 仍用 antd。

登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| antd `message.error` 当全局 | **否**。条挂在 `App.vue` |
| nprogress 以外的请求提示库 | **否** |
| 新 npm 包 | **零** |

`request.notice` 不 persist。

## 关键文件

```text
apps/web/src/api/toast.ts
apps/web/src/api/request.ts
apps/web/src/stores/request.ts
apps/web/src/components/AppToast.vue
apps/web/src/api/auth.ts
```

## 怎么验收

```bash
bun run dev
```

1. 登录页填错密码：错误只在卡片里，窗口上方没有红条
2. 用 `vben` 进用户页，可用开发者工具把 `/api/system/user/list` 拦成 500：上方出现红条
3. 角色里给编码起一个已存在的码：红条出「编码已存在」之类，弹窗还开着
4. 红条点一下会关；不点大约 4 秒后自己关
5. token 失效被踢回登录：没有多余的红条

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 进度条数的是「飞了几条」。错误条说的是「最近一条为什么失败」。不要把 notice 和 pending 搅成一个状态。
- 拦截器只能看见 HTTP。业务 `code !== 0` 是 200，要在解包处抛。条必须挂在解包，不能只挂 HTTP 错误拦截器。
- 页面已经展示过的错误不要再出条。`skipErrorToast` 和 `skipLoadingBar` 是同一类开关。
- 401 是会话事件，不是表单错误。出条再跳登录，人会觉得「报了错却把我扔走」。

## 下一轮从哪里开始

第 31 轮做了色弱 / 灰色，见 [37-round-31-color-filter.md](./37-round-31-color-filter.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
