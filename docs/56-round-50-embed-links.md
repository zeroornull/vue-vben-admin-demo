# 56 · 第 50 轮：可配置外链

日期：2026-08-20。

## 本轮结论

系统里多了「外链」CRUD。每条有编码、标题、iframe 地址。启用后出现在侧栏，点开是 `/embed/编码`，组件还是 `IframeView`。目录多了一条参数路由 `embed/:code`，`menuCode` 仍是 `embed`。没有「内嵌页」菜单的人既看不到侧栏外链，直接打开也是 403。

编码不能占用现有菜单 / 路由名。地址继续走 `safeIframeSrc`。编码编辑时冻结。默认只有 `biz-admin` 能管外链；访客和编辑只要有内嵌页，就能打开种子「演示文档」。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 完整菜单 CRUD（任意 Vue 页） | **否**。只产生 iframe |
| 每条外链一个 addRoute 名字 | **否**。一条 `embed-link`，用 params |
| 把未知 code 写进 MenuCode 联合类型 | **否**。权限仍认 `embed` |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/views/links/query.ts
apps/web/src/views/LinksView.vue
apps/web/src/router/dynamic-access.ts
apps/web/src/router/access-menu.ts
apps/web/src/views/IframeView.vue
apps/web/vite/links-store.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 侧栏在「内嵌页」下面能看到「演示文档」，打开是同源演示 HTML
2. 外链页再新建一条（编码 `help`，地址 `/embed-demo.html`），侧栏马上多一项
3. `user` 也能看见「演示文档」；没有「外链」管理页，直接打开 `/links` 到 403
4. 外链页把「演示文档」停用后，侧栏消失；打开 `/embed/docs` 提示对不上

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 菜单可以是数据，路由模板仍是代码。不要为每条外链生成一个 `.vue` 文件。
- 目录要能认 `embed/:code`，否则守卫会把 `/embed/docs` 当 404。`matchLayoutChild` 按段匹配，`:` 当通配。
- 记住上次页面时，参数路由要记下真实 path `/embed/docs`，不要记下模式 `/embed/:code`。
- 搜索不要收录 `embed/:code` 这一条空壳，否则会出现一个没有 params 的「外链」。外链标题另外灌进搜索列表。
- 多条外链共用路由名 `embed-link`，页签会合成一个，标题跟着当前编码变。这是刻意的：一个组件一份缓存。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
