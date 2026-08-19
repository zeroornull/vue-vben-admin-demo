# 10 · 第 4 轮：布局壳

日期：2026-08-19。

## 本轮结论

登录后进入 `BasicLayout`：侧栏 + 顶栏 + 内容区。侧栏菜单由 `layoutChildren` 按当前角色算出来，不是存一份菜单快照，所以刷新不会丢。

没有搬 `legacy/packages/effects/layouts` 整棵树（混合导航、页签、偏好抽屉、通知、锁屏都不在本轮）。

## 对照与裁剪

| 旧仓 | 本轮留下的 |
| --- | --- |
| `BasicLayout` + `@vben-core/layout-ui` 多种导航模式 | 一个固定「侧栏 + 顶栏」网格 |
| `accessStore.accessMenus` 动态生成后存起来 | `useAccessMenu()` 现算：有 `title`、角色匹配、未 `hideInMenu` |
| `@vben/preferences` 大对象 | `preferences` store：应用名 + 侧栏折叠（折叠会 persist） |
| 页内自己画顶栏（第 3 轮 HomeView） | 壳子统一画，页面只写内容 |

## 路由怎么铺

```text
/                    BasicLayout
  ''                 工作台（所有登录用户）
  workspace          工作区占位（所有登录用户）
  about              关于（admin）
/login /403 /404     仍在壳子外面
```

菜单用路由 `name` 跳，不手写 path。`user` 看不到「关于」；地址栏硬进 `/about` 仍是第 3 轮的 403。

## 关键文件

```text
apps/web/src/
├── layouts/BasicLayout.vue
├── stores/preferences.ts
├── router/access-menu.ts
├── router/routes.ts          # layoutChildren + accessRoutes
└── views/WorkspaceView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 登录：侧栏有工作台、工作区、关于
2. 点菜单能进对应页；顶栏标题跟着 `meta.title` 变
3. 收起菜单后刷新，仍是收起
4. 换 `user`：侧栏没有「关于」
5. 退出后壳子消失，回到登录页

## 学习笔记

- 旧仓菜单是「算完存 store」。本轮路由表很小，现算更不容易和角色不同步。第 5 轮若上后端菜单，再考虑存 `accessMenus`。
- 页面不要再写一套顶栏/退出。壳子负责 chrome，view 只负责内容。
- `tsconfig.node.json` 开了 `allowImportingTsExtensions`，才能既让 Vite 原生加载 `./vite/mock-api.ts`，又让 `vue-tsc` 过关。

## 刻意没做

- 没有暗色开关、主题色、混合导航、页签、面包屑
- 没有图标库
- 403/404 仍是独立整页，不套壳

## 下一轮从哪里开始

[03-migration-roadmap.md](./03-migration-roadmap.md) 第 5 轮：业务页。

建议先搬 `legacy/apps/web-antd/src/views/dashboard/workspace` 到现在的 `WorkspaceView`，先列它依赖的 `@vben/*` 再决定复制还是抽包。
