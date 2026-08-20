# 31 · 第 25 轮：菜单搜索

日期：2026-08-20。

## 本轮结论

顶栏加了「搜索」，快捷键 Ctrl+K（Mac 上是 Cmd+K）。按标题、路由名或分组过滤，点一项或回车跳第一条。

搜索和侧栏不是同一份名单：`hideInMenu` 的个人中心能搜到，没有权限的页（访客搜「用户」「关于」）不会出现。不要上 Fuse.js。

锁屏时不打开。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 命令面板 / Fuse / cmdk | **否**。`includes` 够用 |
| antd `Modal` / `AutoComplete` | **否**。壳还是 CSS |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/router/access-menu.ts   # canSearchRoute / toSearchItems / filterSearchItems
apps/web/src/layouts/AppSearch.vue
apps/web/src/layouts/BasicLayout.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 按 Ctrl+K，输入「个」能看到个人中心；回车跳过去
2. 输入「系统」能看到用户 / 部门 / 角色
3. 换 `user` 登录，搜「用户」或「关于」应是「没有匹配的页面」
4. 锁屏后再按 Ctrl+K，搜索不应出来
5. Escape 或点遮罩关掉

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 侧栏是导航，搜索是「我能去哪」。藏起来的页仍可能要被找到。
- 搜索结果必须再过一遍权限。只滤标题会让访客搜到 403。
- Ctrl+K 要 `preventDefault`，否则浏览器自己的搜索框会抢。

## 下一轮从哪里开始

第 26 轮做了请求进度条，见 [32-round-26-loading-bar.md](./32-round-26-loading-bar.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
