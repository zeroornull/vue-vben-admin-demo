# 23 · 第 17 轮：v-access

日期：2026-08-20。

## 本轮结论

第 13 轮说码少、用 `hasAction` 就够。三页却把同一套 `v-if` 写了三遍。本轮收成指令，不是因为码变多了。

```vue
<Button v-access="'user:create'">新建</Button>
<Button v-access="['user:update', 'user:delete']">有编辑或删除就显示</Button>
<p v-access:role="'admin'">登录角色 admin 才看见</p>
```

默认看 `actionCodes`。`v-access:menu` 看菜单码，`v-access:role` 看**登录角色**。业务角色码 `biz-admin` / `editor` / `viewer` 不要写进指令。

数组是 OR。空绑定当没权限。没有 `v-access:not`——「没有某码才显示」仍用 `v-if` + `!hasAction`。

表格「操作」列还在不在，是列配置，不是 DOM。继续用 `hasAnyAction`。mock 写接口仍自己查码，指令只藏按钮。

零新依赖。没上 `@vue/test-utils`，测的是 `matchAccess`。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben/access` 指令 + AccessControl 组件 | 只要指令；不搬组件包一层 |
| `v-access:code` 别名 | **否**。默认就是操作码 |
| 指令 DSL（AND、not） | **否**。复杂判断回脚本 |
| 新 npm 包 | **零** |

## 为什么摘节点，不用 display:none

antd `Space` 仍会给 `display: none` 的子节点留空隙。指令用注释节点换掉元素。`userInfo` 变了再换回来——KeepAlive 页改了角色，按钮能出现。

卸载时如果元素已摘掉，要亲手删掉注释，否则 Vue 卸的是游离节点，注释留在父级。

## 指令替代不了的两件事

1. **操作列**：`columns` 是数据。没有编辑/删除时整列不该出现，这是 `hasAnyAction`。
2. **写接口**：页面没按钮，curl 还能打。mock 继续查 `actionCodes`。

## 关键文件

```text
apps/web/src/access/match.ts
apps/web/src/access/directive.ts
apps/web/src/access/use-access.ts
apps/web/src/main.ts
apps/web/src/views/UsersView.vue
apps/web/src/views/DeptsView.vue
apps/web/src/views/RolesView.vue
apps/web/src/views/HomeView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 进用户 / 部门 / 角色，新建编辑删除都在
2. 工作台能看到「登录角色 admin」那一段
3. 编辑「访客」：勾用户菜单，不要勾操作。换 `user` 登录，能进用户页，没有新建/编辑/删除，也没有操作列
4. 再给访客勾「用户 / 新建」，`user` 刷新后出现新建，操作列仍无（没有编辑/删除）
5. `user` 工作台没有 admin 那一段，只有「当前是 user…」

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 指令适合「这个节点在不在」。列在不在、接口过不过，不是节点的事。
- `v-access:role` 的 role 是登录权限 `admin` / `user`，和业务角色表不是一张表。写错层会「明明是业务管理员却看不见」。
- 空值当拒绝：漏写 `v-access="code"` 时宁可少一个按钮，不要多一个。
- 不要为了指令去装测试库。权限规则是纯函数，DOM 挂钩跟着规则走就行。
- 不要在 `env.d.ts` 里写 `declare module 'vue' { interface GlobalDirectives { … } }`。没有 `export {}` 时，这段会盖掉整个 `vue` 的导出，`computed` / `ref` 全报不存在。指令在 `main.ts` 注册即可。

## 下一轮从哪里开始

第 18 轮做了侧栏图标，见 [24-round-18-menu-icons.md](./24-round-18-menu-icons.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
