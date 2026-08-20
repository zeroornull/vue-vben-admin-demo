# 19 · 第 13 轮：按钮权限

日期：2026-08-20。

## 本轮结论

菜单码只管「能不能进这页」。新建 / 编辑 / 删除另有操作码，例如 `user:create`。角色表单里操作挂在对应菜单下面；勾了操作会自动带上父菜单。

页面按 `userInfo.actionCodes` 藏按钮。mock 写接口也会查同一份码，只藏按钮不够。

当时没做 `v-access`，调用 `useAccess().hasAction`。第 17 轮补了指令，见 [23-round-17-v-access.md](./23-round-17-v-access.md)。

零新依赖。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `v-access` | **否**。composable 更直观，也更好测 |
| 按钮码和菜单码合成一个数组 | **否**。`menuCodes` / `actionCodes` 分开 |
| 新 npm 包 | **零** |

## 种子

| 业务角色 | 菜单 | 操作 |
| --- | --- | --- |
| biz-admin | 全部 | 用户 / 部门 / 角色的新建、编辑、删除 |
| editor | 工作区、分析、用户、部门 | 用户和部门的新建、编辑；不能删，不管角色 |
| viewer | 工作区、分析 | 无 |

登录映射没变：`vben` / `admin` → biz-admin，`user` → viewer。

## 关键文件

```text
apps/web/src/access/catalog.ts     # actionCatalog
apps/web/src/access/resolve.ts     # resolveActionCodes / grantParentMenus
apps/web/src/access/use-access.ts
apps/web/src/views/UsersView.vue
apps/web/src/views/DeptsView.vue
apps/web/src/views/RolesView.vue
apps/web/vite/mock-api.ts          # POST/PUT/DELETE 查 actionCodes
```

列表 GET 仍只要求登录。用户页要拉部门/角色目录，不能因为没「角色」菜单就把 GET `/system/role/list` 挡掉。

## 怎么验收

```bash
bun run dev
```

1. `vben` 进用户 / 部门 / 角色，新建编辑删除都在
2. 编辑「访客」：勾「用户」，不要勾任何用户操作。换 `user` 登录，能进用户页，没有新建/编辑/删除
3. 再给访客勾「用户 / 新建」，`user` 刷新后出现新建
4. 编辑角色默认没有删除。系统用户里的「编辑」是业务角色，和登录账号不是同一批人

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 藏按钮是体验，接口拒绝才是权限。两边用同一份码，才不会「页面没按钮、curl 还能删」。
- 操作码没有父菜单时，进不去页面，按钮也没用。保存时补上父菜单，比让人自己再勾一次清楚。
- 取消菜单时要摘掉子操作，否则表单上菜单没了、操作还勾着。
- 指令适合到处写 `v-access="'user:create'"`。现在只有三页、九个码，函数调用够了。码变多再加指令。

## 下一轮从哪里开始

第 14 轮做了页签和 KeepAlive，见 [20-round-14-tabs.md](./20-round-14-tabs.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
