# 25 · 第 19 轮：页签图标

日期：2026-08-20。

## 本轮结论

页签用和第 18 轮同一张 `menuIcons`。不新开图标集，不加依赖。

`tabFromRoute` 把 `meta.icon` 抄进页签。persist 里可能是第 14 轮留下的旧对象、没有 `icon`。渲染时 `tabIconName` 用 `icon || name` 回退，旧页签不用先点一遍才出图标。

登录页 Form、页签右键 / 拖拽仍不做。面包屑不加图标。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 页签自己再引一套 Iconify | **否**。复用 `menuIcons` |
| 右键关闭左侧 / 拖拽 | **否** |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/layouts/tab-query.ts
apps/web/src/layouts/AppTabs.vue
apps/web/src/layouts/__tests__/tab-query.spec.ts
```

`HOME_TAB` 补了 `icon: 'home'`。store 不用改，persist 的是整份 `AppTab`。

## 怎么验收

```bash
bun run dev
```

1. 登录后「工作台」页签左边有家图标
2. 打开用户、部门，页签图标和侧栏同一套
3. 若本地还有旧 persist：刷新后页签仍有图标（靠 name 回退）
4. 右键菜单仍然没有

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 侧栏和页签是两份 UI，图标应该是一份登记表。复制组件名会在换图标时漏改。
- persist 会把旧字段形状冻住。新字段要么回退，要么在读的时候补，不要假定 localStorage 里已经是新类型。
- `icon || name` 能用，是因为本仓库登记名和路由名碰巧相同。以后若分叉，只信 `icon`，回退写进迁移函数。

## 下一轮从哪里开始

第 20 轮做了窄屏侧栏，见 [26-round-20-narrow-sidebar.md](./26-round-20-narrow-sidebar.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
