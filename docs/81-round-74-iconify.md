# 81 · 第 74 轮：Iconify

日期：2026-08-21。

## 做了什么

菜单 / 页签 / 搜索图标从 `@ant-design/icons-vue` 具名组件改成 `@iconify/vue` **离线**组件。`meta.icon` 仍是登记名（`users`、`home`），对照表写成 Iconify id（`ant-design:team-outlined`）。只用本地那 11 个 SVG，装的是 `@iconify/vue/offline`，不走 Iconify API。

`apps/web` 不再直接依赖 `@ant-design/icons-vue`。antd 表格、选择器自己带的按钮图标仍由它间接拉取，这轮不管。

第 18 轮「不上 Iconify」在 [03](./03-migration-roadmap.md) 决策表改成这一轮的写法。

## 刻意没做

- 页面里不写 `icon="mdi:whatever"`。`resolveMenuIcon('mdi:home')` 和裸 `ant-design:team-outlined` 都是 `undefined`。
- 不上 `@iconify-json/ant-design` 全量包，也不上 `unplugin-icons`。11 个图标写在 `menu-icon-collection.json`。
- 不把 Iconify 接到表单按钮、通知铃这些壳以外的地方。

## 关键文件

```text
apps/web/src/icons/menu-icons.ts
apps/web/src/icons/menu-icon-collection.json
apps/web/src/icons/MenuIcon.vue
apps/web/src/layouts/BasicLayout.vue
apps/web/src/layouts/AppTabs.vue
apps/web/src/layouts/AppSearch.vue
```

## 验收

侧栏、页签、搜索结果左边还是原来那套形；收起侧栏只剩图标。随便写一个未登记名不会出远程请求，也不会画出图标。

## 下一轮从哪里开始

第 75 轮已做，见 [83-round-75-ele-shell.md](./83-round-75-ele-shell.md)。下一轮是第 76 轮 ele 用户表。
