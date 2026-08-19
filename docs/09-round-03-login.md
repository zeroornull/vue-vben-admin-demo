# 09 · 第 3 轮：登录闭环

日期：2026-08-19。

## 本轮结论

`apps/web` 能走完：未登录 → 登录页 → mock 登录 → 工作台；刷新后 token 仍在；退出回登录。前端角色：`/about` 只给 `admin`，`user` 打开会到 403。

对照了 `legacy/apps/web-antd` 的守卫 / auth store / 请求拦截，**没有**整文件粘贴，也没有搬 `@vben/request`、SecureLS、refresh token、i18n、Ant Design。

## 对照与裁剪

| 旧仓 | 本轮留下的 |
| --- | --- |
| `guard.ts`：核心路由放行、无 token 去登录、动态生成菜单 | 核心/公开路由放行；无 token 去登录带 `redirect`；有 token 缺 userInfo 再拉；`meta.roles` 不匹配去 403。不做 `addRoute` |
| `store/auth.ts`：accessStore + userStore + notification | 一个 `auth` store：token、userInfo、login/logout/fetch |
| `request.ts`：多层 interceptor、refresh、antd message | axios 实例：带 token、`code !== 0` 抛错、401 清会话并回登录 |
| Nitro `backend-mock` | Vite 插件 `vite/mock-api.ts`，dev / preview 都挂 |

## 实际装上的依赖

写在 `apps/web/package.json`，不是根目录（`bun add --filter @app/web` 会 404 `@app/web`，在子包目录 `bun add` 又写到了根，已挪回来）。

| 包 | 锁定 |
| --- | --- |
| axios | 1.19.0 |
| pinia-plugin-persistedstate | 4.7.1 |

只持久化 `accessToken`。刷新后守卫再打 `/user/info`，和「token 在本地、资料以接口为准」一致。

## 假账号

密码都是 `123456`。

| 用户 | 角色 | `/about` |
| --- | --- | --- |
| `vben` | admin, user | 可以 |
| `admin` | admin | 可以 |
| `user` | user | 403 |

## 关键文件

```text
apps/web/
├── .env                         # VITE_API_BASE=/api
├── vite/mock-api.ts
├── src/api/request.ts           # 带 token；get/post 解包 { code, data }
├── src/api/auth.ts
├── src/api/user.ts
├── src/stores/auth.ts
├── src/router/routes.ts         # 公开 / 需登录 / roles
├── src/router/guard.ts
└── src/views/LoginView.vue
```

`main.ts` 仍是官方顺序：`createApp` → pinia（加 persist 插件）→ router → mount。没有改成 legacy 的 `bootstrap.ts`。

## 怎么验收

```bash
bun run dev
```

1. 打开 `/` 应被送到 `/login`
2. `vben` / `123456` 进入工作台，能点「关于」
3. 刷新仍在工作台
4. 退出回到登录页
5. 换 `user` 登录，地址栏进 `/about` 看到 403
6. 错密码看到「账号或密码错误」

mock 不进生产包，只在 Vite `configureServer` / `configurePreviewServer` 里。

## 学习笔记

- 权限仍分三处：token 在 store，判断在守卫，请求只负责带头和 401。不要把跳转写进每个页面。
- axios 1.19 的 interceptor **必须**返回 `AxiosResponse`。业务解包放在 `get` / `post` 包装函数，不要在 interceptor 里直接 `return body.data`。
- 401 里动态 `import('@/router')` 是为了避开 `request → store → api → request` 在模块顶层再静态拉 router。构建会提示这个 dynamic import 无效（`main.ts` 已经静态引入了），可以忽略，不拆包而已。
- 前端角色这轮用静态路由 + `meta.roles`。旧仓的 `generateAccessible` + `addRoute` 留给第 4 轮做菜单时再考虑。

## 刻意没做

- 没有组件库、没有验证码、没有 refresh token
- 没有后端菜单、没有动态 `addRoute`
- 没有进度条、没有加密 localStorage

## 下一轮从哪里开始

[03-migration-roadmap.md](./03-migration-roadmap.md) 第 4 轮：壳子。

建议入口：

1. `apps/web/src/views/HomeView.vue` — 现在的顶栏是临时的，会收进 layout
2. `apps/web/src/router/routes.ts` 的 `accessRoutes` — 菜单从这里长出来
3. `legacy/packages/effects/layouts` — 对照，只搬用到的部分
