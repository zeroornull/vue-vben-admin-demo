# 20 · 第 14 轮：页签 + KeepAlive

日期：2026-08-20。

## 本轮结论

布局顶栏下面加了页签。打开过的页面留在条上；工作台钉住，关不掉。关掉当前页回到前一个。

内容区用 `<KeepAlive :include>`。用户页改了筛选再切走，页签还在时筛选还在。刷新会丢内存缓存，页签本身会 persist。

没有搬旧仓的拖拽、右键菜单、图标。零新依赖。

登录页改 antd 仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben-core/tabs-ui` / 布局页签整套 | 自写 `AppTabs` + `tab-query` |
| 右键关闭左侧 / 右侧 | **否**。只要关闭其他 |
| 图标库 | **否** |
| 新 npm 包 | **零** |

## KeepAlive 对的是组件名，不是路由名

`include` 匹配 SFC 的 `name`。`<script setup>` 默认没有 name，所以每个进页签的页面写了 `defineOptions({ name: 'UsersView' })`，路由 `meta.viewName` 必须同字。

对不上时页签在、缓存不在，切回去会重新挂载。

## 换账号

页签 persist 了 `tabs` 和 `owner`。`syncOwner` 发现用户名变了就只留工作台。退出会 `reset`。

没权限的页（改了角色菜单之后）会被 `prune` 掉。

## 关键文件

```text
apps/web/src/layouts/tab-query.ts
apps/web/src/layouts/AppTabs.vue
apps/web/src/layouts/BasicLayout.vue
apps/web/src/stores/tabs.ts
apps/web/src/router/routes.ts          # viewName / affixTab
```

## 怎么验收

```bash
bun run dev
```

1. 登录后有「工作台」页签，没有关闭钮
2. 打开用户、部门，条上多两个页签
3. 用户页写点筛选，切到部门再点回用户，筛选还在
4. 关掉当前页签，回到前一个
5. 「关闭其他」只留当前和工作台
6. 刷新：页签还在，筛选没了（KeepAlive 不进 persist）
7. 退出再换 `user` 登录，不应看到上一账号的系统页签

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 旧仓页签很重。页签列表是数据，KeepAlive 是另一件事。列表 persist，缓存不要 persist。
- `RouterView` 的 `key` 用路由 `name`，同一页的查询变化共用实例。用 `fullPath` 当 key 会让 KeepAlive 形同虚设。
- 403 / 404 / 登录在壳外，不会进页签。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 暗色开关（`base.css` 已有 dark 变量，现在跟系统走）
2. 面包屑
3. `v-access`（码再多时）
4. 登录页改 antd Form（收益仍小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
