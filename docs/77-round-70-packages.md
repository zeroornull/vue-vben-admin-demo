# 77 · 第 70 轮：packages/ 薄拆

日期：2026-08-21。

二期第二刀。把已经有纯函数边界的三坨从 `apps/web` 挪出去，不搬布局，不抽 `@core`。

## 本轮结论

根 workspace 的 `packages` 现在是 `apps/*` + `packages/*`。三个本地包：

| 包 | 装了什么 | 还留在 app |
| --- | --- | --- |
| `@app/access` | catalog / match / resolve | `use-access`、`v-access`（读 auth store） |
| `@app/tables` | 列、排序、CSV、批量、展开、每页条数 | 各表的 store 和页面 |
| `@app/request` | abort / retry / toast / pending / unwrap / `createRequestClient` | `src/api/request.ts` 把 token、进度条、401 跳转接进去 |

业务 API（`/auth/login`、`/system/user`）仍在 app。测试跟着代码走。根上的 `lint` / `test` / `typecheck` 改成 `bun run --filter '*' …`，四个包一起跑。

没有 `@vben/*` 包名。没有 Turbo。没有第二套皮肤。

## 依赖清单（先列再决定）

| 项 | 决定 |
| --- | --- |
| 拆 access / tables / request 纯函数 | **是** |
| 指令和 composable 进 access 包 | **否**。它们 `useAuthStore()`，包不该依赖 app 的 Pinia |
| 请求单例进 request 包 | **否**。包只出工厂；app 注入 token / loading / 401 |
| 布局进包 | **否**。第 71 轮才开口子 |
| 新 npm | **零**。axios 跟 request 包走，版本仍是 app 里那档 |

## 关键文件

```text
packages/access/
packages/tables/
packages/request/
apps/web/src/api/request.ts
apps/web/src/access/directive.ts
apps/web/src/access/use-access.ts
package.json
```

## 怎么验收

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

1. `apps/web/src` 里不再有 `tables/`，也没有 `access/catalog.ts`
2. 用户页、角色页从 `@app/tables` / `@app/access` 引
3. 登录、权限按钮、GET 失败重试行为和拆之前一样
4. 四个包的 test 都能单独 `bun run --filter @app/tables test`

## 学习笔记

- 包被 Vite mock 当 Node ESM 加载时，包内相对路径要带 `.ts`。`tsc` 则要 `allowImportingTsExtensions` + `noEmit`。这和 app 里 `@/` 不写后缀不是同一套规则。
- `createRequestClient` 把拦截器从 store 解耦。测试 app 的 `request.spec.ts` 仍挂 Pinia，测的是接好线的那一份。
- mock 可以写 `from '@app/access/resolve'`。workspace 包走 `node_modules`，不必再相对钻进 `src/access`。
- 根脚本用 `--filter '*'` 时，没写对应 script 的根包会被跳过，四个 workspace 包会跑。

## 下一轮从哪里开始

第 71 轮已做，见 [78-round-71-core.md](./78-round-71-core.md)。下一轮是第 72 轮 Turbo。
