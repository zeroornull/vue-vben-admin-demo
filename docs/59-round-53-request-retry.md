# 59 · 第 53 轮：GET 失败重试

日期：2026-08-20。

## 本轮结论

列表这类 GET 遇到断网、超时或 500 / 502 / 503 / 504，会立刻再打一次。只补一次，没有退避。POST / PUT / DELETE 不重试，避免登录失败锁定数双计、新建用户打两遍。401 / 403 / 404 / 取消也不重试。

通知和检查更新是轮询，带 `skipRetry`，失败就等下一轮。进度条按「一次逻辑请求」计数：第一次失败不 `end`，补打成功或最终失败再 `end`。错误条也只在最终失败时出。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| axios-retry / 自己写退避队列 | **否**。一条纯函数 + 拦截器 |
| 写操作也重试 | **否**。只 GET |
| 轮询跟着重试 | **否**。`skipRetry` |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/api/retry.ts
apps/web/src/api/request.ts
apps/web/src/types/axios.d.ts
apps/web/src/api/version.ts
apps/web/src/api/notices.ts
```

## 怎么验收

```bash
bun run test
```

看 `retry.spec.ts` 和 `request.spec.ts` 里「GET 500 补一次、pending 始终是 1、POST 不补」。

手工：现有 mock 不会故意 500。逻辑靠测试。

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 幂等才能重试。GET 读列表可以；登录、新建、删除不行。
- HTTP 200 但 `code !== 0` 是业务错，走成功拦截器，不要当成 500 去补。
- 拦截器里补打还是同一个 `config`。`retryCount === 0` 才 `begin`，决定不再补才 `end`，进度条才不会闪两下。
- 401 先清会话，不要再打一发已经过期的 token。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
