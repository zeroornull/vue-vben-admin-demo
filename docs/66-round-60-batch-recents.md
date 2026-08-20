# 66 · 第 60 轮：批量删除补全 + 搜索最近

日期：2026-08-20。

这一轮打包两件边角。用户表第 58 轮已经能勾选，另外三张表跟上。搜索空着的时候先看最近去过的页。

## 本轮结论

角色、部门、外链可以勾选，一次最多 20 条。走各自的 `*:delete`。没有删除权的人看不到勾选。删成功的记操作日志；被占用或已不存在的跳过，不把整批打回去。

部门是树。勾选互不影响（`checkStrictly`），先删更深的节点，这样同时勾了父和子时，子先走，父才有机会。只勾还有下级或还有人的部门，这条会跳过。

Ctrl+K 空着时，上面是「最近」，最多 8 条，按账号 persist。没权限的项不出现。点「清除」只清当前账号。有关键字时仍只看匹配，不插最近。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 勾父自动勾子 | **否**。树表 `checkStrictly` |
| 整批失败回滚 | **否**。能删的删，不能的跳过 |
| 最近记关键字 | **否**。只记去过的页 |
| 四个账号共用最近 | **否**。按 username |
| Fuse / cmdk | **否** |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/tables/batch.ts
apps/web/src/search/recents.ts
apps/web/src/stores/search-recents.ts
apps/web/src/views/RolesView.vue
apps/web/src/views/DeptsView.vue
apps/web/src/views/LinksView.vue
apps/web/src/layouts/AppSearch.vue
apps/web/vite/mock-api.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 新建两个空角色，勾上删除选中，表少两行；勾种子「业务管理员」应跳过（还有人）
2. 部门勾「支持」（没人没下级）能删；只勾「集团」应跳过
3. 外链勾一条删除，侧栏那一项消失
4. `user` 看不到这三张表的勾选（也进不去）
5. Ctrl+K 打开用户页再打开搜索，上面有「最近 / 用户」；换 `admin` 不应看到 vben 的最近

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 批量仍是循环单条。先 peek 名字再删，再记日志。先记再删会留下假账。
- 有人占用不要 400 整批。返回 `deleted` 和 `skipped`，页面自己说清楚。
- 树表默认勾父会带子。批量删除要自己选，`checkStrictly: true`。
- 同一批里父和子都勾了，必须先子后父。顺序错了，父永远「还有下级」。
- 搜索最近和「上次打开哪页」不是一件事。上次打开管登录落地；最近只管搜索面板。
- 外链菜单项 name 都是 `embed-link`，要用 path 当键。只用 name 会塌成一条。
- 展示最近时再和当前能去的页求交。persist 里留着过期项没关系，看不见就行。

## 下一轮从哪里开始

核心可以停。若还要加快，把边角打包，不要再拆成单点 chrome：

1. 登录页改 antd Form / 页签右键 / 改密（收益仍小，继续不做除非点名）
2. 通知已读 persist、搜索键盘上下、导出角色 CSV，仍是边角
3. i18n、第二套皮肤、`@core`、Turbo、Vue 3.6 —— 不做

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
