# 15 · 第 9 轮：部门树

日期：2026-08-20。

## 本轮结论

对照 `legacy/playground/src/views/system/dept`，落地 `/depts`：树表、上级 TreeSelect、新增下级、同级重名校验、禁止选自己/下级当上级、有子节点不能删。

用户页已经是一张平表。再搬角色几乎是复制。部门页才有新结构，所以这一轮走树，不上 vxe-table，也没有新 npm 包。

侧栏用 `meta.group: '系统'` 把「用户 / 部门」收成一组。没有嵌套路由，也没有第二层 `RouterView`。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `#/adapter/vxe-table` 树表 | antd `Table` 的 `children` |
| `#/adapter/form` + schema | 本地 `validateDeptForm` + Modal |
| `@vben/common-ui` Modal / Page | antd Modal + 抽出的 `AntdPage` |
| 部门树组件 / 图标包 | `TreeSelect`；操作仍是文字按钮 |
| 新 npm 包 | **零** |

`AntdPage` 收了 `reset.css` + 中文 `ConfigProvider`。用户页改走这个壳。构建里 antd 进了 `AntdPage` 这个共享 chunk（约 694 kB），`UsersView` / `DeptsView` 本身只有几 KB。首页包仍约 100 kB。

## 和旧页的差别

- 旧仓 `pid: 0` 表示根；这里用 `parentId: null`
- 列表一次拉整棵树，名称/状态在前端过滤，并保留匹配节点的祖先
- 同级名称不可重复；不能把节点挂到自己或子孙下
- 有下级时先删叶子，页面和 mock 都拦
- 菜单仍是扁平路由：`/users`、`/depts`，只是侧栏显示分组

## 关键文件

```text
apps/web/src/
├── components/AntdPage.vue
├── views/DeptsView.vue
├── views/depts/
│   ├── types.ts
│   ├── query.ts
│   ├── DeptFormModal.vue
│   └── __tests__/query.spec.ts
├── api/system/dept.ts
└── router/access-menu.ts          # toMenuItems + groupMenuItems

apps/web/vite/depts-store.ts
```

## 怎么验收

```bash
bun run dev
```

1. 登录后侧栏「系统」下有用户、部门
2. 部门表默认展开；「前端」在「研发」下面
3. 搜「前端」仍能看到集团 → 研发 → 前端
4. 点「下级」新建，上级已带上当前节点
5. 编辑时不能把集团挂到前端下面
6. 集团删不掉；先删叶子可以
7. 刷新后种子树回来

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 树的约束（环、同级重名、先删子）值得抽纯函数。页面只负责点按钮。
- `defaultExpandAllRows` 只认首次挂载。数据是 mounted 后才到的，给 Table 一个随条数变化的 `key`，让它重新挂上并展开。
- 分组菜单按**相遇顺序**合并同一 `group`。如果用 Map 按 group 名合并，无分组的「工作台」和「关于」会被收成一组，关于会跑到系统前面。
- 过滤树时保留祖先，否则搜叶子会看起来像数据丢了。

## 下一轮从哪里开始

用户挂部门见 [16-round-10-user-dept.md](./16-round-10-user-dept.md)。
