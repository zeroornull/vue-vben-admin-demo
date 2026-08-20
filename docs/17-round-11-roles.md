# 17 · 第 11 轮：业务角色

日期：2026-08-20。

## 本轮结论

落地 `/roles`：名称、编码、状态、人数。用户表可多选业务角色，也可按角色筛。

**业务角色 ≠ 登录权限。** 登录仍是 `vben` / `admin` / `user` 那套 `meta.roles`。系统角色编码用 `biz-admin` / `editor` / `viewer`，并禁止占用 `admin` / `user`。没有把两边揉成一套权限模型。

旧 playground 角色页还有权限树。本轮不做菜单授权。

零新依赖。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| vxe-table + schema form | antd Table / Form / Modal |
| 角色绑菜单权限树 | **推迟** |
| 登录角色与业务角色合一 | **否**。编码预留 `admin` / `user` |
| 新 npm 包 | **零** |

## 和旧页的差别

- 编码创建后不可改（避免用户身上的引用对不上码）
- 用户 `roleIds` 是数组，筛选用单个 `roleId`
- 有人占用的角色删不掉
- Oscar 种子数据没有业务角色

## 关键文件

```text
apps/web/src/views/RolesView.vue
apps/web/src/views/roles/
apps/web/src/api/system/role.ts
apps/web/vite/roles-store.ts
apps/web/src/views/users/          # roleIds
```

`users-store` 只读 `roles-store` 的 `mockRoleExists`；删角色时由 mock 中间件数人数。

## 怎么验收

```bash
bun run dev
```

1. 侧栏「系统」下有角色
2. 页头说明了和登录权限的区别
3. 新建编码 `admin` 会被拒；`reviewer` 可以
4. 「用户」里 Alice 是业务管理员，Oscar 未分配
5. 按「编辑」筛，能看到 Bob / Dave / Eve
6. 编辑用户可多选角色
7. 直接删「编辑」会提示先移走用户

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 登录角色回答「能不能进这个路由」；业务角色回答「在业务里是什么身份」。过早合成一套，守卫和 CRUD 会缠在一起。
- 编码用正则锁死，比自由字符串好查、也好和后端对齐。
- 编辑时冻结编码，改名可以。要改码就新建。

## 下一轮从哪里开始

第 12 轮已做角色绑菜单和动态路由，见 [18-round-12-role-menus.md](./18-round-12-role-menus.md)。按钮权限仍留着。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
