# 14 · 第 8 轮：ant-design-vue + 用户页

日期：2026-08-20。

## 本轮结论

选定 **ant-design-vue 4.2.6** 作为唯一组件库，落地 `/users`：查询、分页表、新建/编辑弹窗、删除确认。接口是 Vite mock 内存 CRUD，刷新页面后种子数据会回来。

对照的完整用户页在 `legacy/playground/src/views/system/user`，不在 `web-antd`。那一页绑了 `useVbenVxeGrid`、`useVbenForm`、`useVbenDrawer`、部门树、权限树、`antdv-next`。本轮只借「用户列表 + 表单」这条业务，组件直接用 ant-design-vue 的 Form / Table / Modal。

## 为什么是 ant-design-vue 4，不是别的

| 选项 | 决定 | 原因 |
| --- | --- | --- |
| ant-design-vue 4 | **采用** | 对照仓 `legacy/apps/web-antd` 用的就是它；npm 上这个包名的最新稳定是 4.2.6 |
| antdv-next / Ant Design Vue 5 | 不上 | playground 在用，等于跳到第五套皮肤；本仓仍只一套 |
| Element / Naive / TDesign | 不上 | 文档不按 UI 库分叉 |
| vxe-table | 不上 | 旧仓表格壳；本页用 antd Table 就够 |
| `@vben/common-ui` / form adapter | 不上 | schema 表单是后期优化 |

登录页仍是原生 form，没有改成 antd。壳子也还是自己的侧栏顶栏。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `ant-design-vue` | **新增** 4.2.6 |
| `antdv-next` | 不上 |
| `@vben/common-ui` Page / Tree / Drawer | 本地页面 + Modal |
| `#/adapter/vxe-table` | antd `Table` |
| `#/adapter/form` + schema | antd `Form` + 本地 `validateUserForm` |
| 部门树 / 权限树 / 日期范围 | 推迟 |
| `@ant-design/icons-vue` / `dayjs` | 不写入 `package.json`（antd 会自己带上） |
| `unplugin-vue-components` | 不上。页面里显式 import，跟用户路由一起懒加载 |

没有 `app.use(Antd)`。全局注册会把约 1.4 MB 打进首页；现在 antd 在 `UsersView` chunk（约 699 kB / gzip 214 kB）。

## 真实装上的版本

| 包 | 锁定 |
| --- | --- |
| ant-design-vue | 4.2.6 |

`reset.css` 只在用户页引入，登录页首次进入不受影响。

## 和旧页的差别

- 路由 `/users`，菜单名「用户」，所有已登录角色可见
- 查询只有用户名（模糊）和状态；没有部门、时间范围
- 弹窗字段：用户名、状态、备注。用户名必填、最长 32、不可与他人重名
- 列表数据 `{ items, total }`，不是旧仓 request 客户端再拆一层的数组
- 增删改只活在 dev / preview 的内存里

## 关键文件

```text
apps/web/src/
├── api/request.ts              # 补 put / del
├── api/system/user.ts
├── views/UsersView.vue
└── views/users/
    ├── types.ts
    ├── query.ts                # 过滤、分页、校验；单测锁契约
    ├── UserFormModal.vue
    └── __tests__/query.spec.ts

apps/web/vite/
├── mock-api.ts                 # /api/system/user*
└── users-store.ts              # 内存表；复用 query.ts
```

## 怎么验收

```bash
bun run dev
```

1. 登录后侧栏点「用户」
2. 表能分页；按用户名 / 状态能筛
3. 新建一条，列表最前面能看到
4. 编辑改备注或状态，保存后表格更新
5. 删除有确认；删掉后条数变
6. 刷新页面，改动消失，12 条种子数据回来
7. 未登录打开 `/users` 仍回登录页

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

Vitest 现在 **36** 条。构建时 Vite 会警告：`vite/users-store.ts` 进了配置图，因而扫到 `src/views/users/query.ts` 里不带扩展名的 `./types`。功能不受影响；以后若要消掉，把 query 从 Vite 配置图里挪走，不要去改 src 的 import 风格。

## 学习笔记

- 旧 playground 用户页的复杂度来自 adapter，不来自「一张表 + 一个表单」。先把 CRUD 闭环跑通，再考虑 schema form / vxe。
- ant-design-vue 4 的组件样式跟 JS 走，页面 import 组件即可；另加 `dist/reset.css`。不要为了省几行 import 去 `app.use(Antd)`。
- `Table` 的 `bodyCell.record` 类型是宽对象，和 `SystemUser` 对不上，包一层 `toUser` 再传给编辑/删除。
- mock 过滤规则和页面单测共用 `query.ts`，避免 Vite 插件里再写一份分页。

## 下一轮从哪里开始

部门树见 [15-round-09-depts.md](./15-round-09-depts.md)。
