# 18 · 第 12 轮：角色绑菜单 + 动态路由

日期：2026-08-20。

## 本轮结论

业务角色现在勾选菜单。登录后按 `userInfo.menuCodes` **`addRoute`**，侧栏和能打开的页面跟着变。

两套权限仍然分开：

| 字段 | 取值 | 管什么 |
| --- | --- | --- |
| `userInfo.roles` | `admin` / `user` | 登录守卫，`/about` 的 `meta.roles` |
| `userInfo.roleCodes` | `biz-admin` / `editor` / `viewer` | 登录账号映射到的业务角色 |
| `userInfo.menuCodes` | `workspace`、`users`… | 侧栏和动态子路由 |

工作台没有 `menuCode`，登录即可。按钮级权限本轮不做。

零新依赖。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben/access` + `generateAccessible` | 自写 `filterDynamicRoutes` + `addRoute` |
| 后端菜单 `getAllMenusApi` | 否。菜单目录写在前端 `access/catalog.ts` |
| `import.meta.glob` 页表 | 否。路由仍手写，只是拆成静态 / 动态两截 |
| `v-access` / 按钮码 | **推迟** |
| 登录角色与业务角色合一 | **否** |
| 新 npm 包 | **零** |

## 登录账号怎么接到业务角色

系统用户（Alice / Bob）和登录账号（`vben` / `admin` / `user`）还是两套人。本轮只给登录账号写死映射，否则改角色菜单不会反映到侧栏：

| 登录 | 登录角色 | 业务角色 | 默认菜单 |
| --- | --- | --- | --- |
| `vben` | admin + user | biz-admin | 全部 |
| `admin` | admin | biz-admin | 全部 |
| `user` | user | viewer | 工作区、分析 |

`/api/user/info` 按**当前**角色表算 `menuCodes`。改访客菜单再刷新，`user` 的侧栏会变。

「关于」要两层都过：菜单勾了 `about`，并且登录角色含 `admin`。给访客勾上「关于」，`user` 仍是 403。

## 和旧仓动态路由的差别

旧仓 `generateAccess` 会扫 `views/**/*.vue`，再按前端角色或后端菜单生成。本轮：

1. `staticLayoutChildren`：只有工作台，一开始就挂在 `root` 上
2. `dynamicLayoutChildren`：其余页，守卫里 `addRoute('root', …)`
3. 目录 `layoutChildren` 仍是完整清单。没挂上的已知路径走 **403**，真正不认识的路径走 **404**

第 3 点必要：动态路由没挂时，地址会先撞上 catch-all。catch-all 标了 `public`，不先对照目录，未登录打开 `/users` 会直接 404，而不是去登录。

## 关键文件

```text
apps/web/src/access/catalog.ts
apps/web/src/access/resolve.ts
apps/web/src/router/routes.ts          # 静态 / 动态拆开
apps/web/src/router/dynamic-access.ts  # addRoute / removeRoute
apps/web/src/router/guard.ts
apps/web/src/views/roles/RoleFormModal.vue
apps/web/vite/mock-api.ts              # user/info 带 menuCodes
```

改完角色菜单会 `fetchUserInfo` + `syncAccessRoutes`。若当前页被摘掉，回到工作台。

## 怎么验收

```bash
bun run dev
```

1. `vben` 能看到系统三页和关于
2. `user` 只有工作台、工作区、分析；地址栏进 `/users` 是 403
3. 用 `vben` 编辑「访客」，勾上「用户」，再换 `user` 登录（或刷新），侧栏出现用户
4. 给访客勾「关于」不够：`user` 打开 `/about` 仍 403
5. 从 `biz-admin` 去掉「角色」并保存，若人还在角色页会回到工作台

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 动态路由的难点不是 `addRoute`，是 **第一次匹配已经结束**。生成后要 `replace` 再走一遍；没权限的已知路径不要交给 404。
- 菜单目录和「当前挂上的路由」不是同一份。目录回答「这是不是我们系统里的页」，挂载回答「这个会话能不能进」。
- 登录角色和业务菜单叠两层，比合成一套更清楚。合成之后，「关于只要 admin」和「访客能不能看分析」会缠在同一个数组里。
- mock 登录账号必须显式映射到业务角色，否则角色 CRUD 和守卫各说各话。

## 下一轮从哪里开始

第 13 轮已做按钮权限，见 [19-round-13-button-access.md](./19-round-13-button-access.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
