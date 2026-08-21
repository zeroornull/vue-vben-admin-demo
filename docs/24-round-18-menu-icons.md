# 24 · 第 18 轮：侧栏图标

日期：2026-08-20。

## 本轮结论

登录页改 antd Form 仍不做。页签右键 / 拖拽仍不搬。本轮定图标集，把侧栏「截标题第一个字」换成图标。

图标集：**`@ant-design/icons-vue@7.0.1`**，写成 `@app/web` 的直接依赖。antd 4 本来就间接带着它，不要从 `node_modules` 里偷用。

不装 Iconify、`unplugin-icons`、`@vben/icons`。七个菜单不需要按需编译整仓图标。

> 第 74 轮已改成 `@iconify/vue` 离线白名单，见 [81-round-74-iconify.md](./81-round-74-iconify.md)。

路由只写登记名：`meta.icon: 'users'`。组件对照写在 `menuIcons`。不要把 `TeamOutlined` 写进路由——路由应是可序列化的字串。

收起侧栏只留图标，标题走 `title` 提示。未登记的 key 收起时才退回第一个字。

页签、面包屑本轮不加图标。侧栏不在 `AntdPage` 里，图标靠 `currentColor`，不靠 antd 主题算法。

根 `package.json` 不要写这个依赖。在 workspace 子目录执行 `bun add` 可能写到根上，要挪回 `apps/web/package.json`。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben/icons` / Iconify / unplugin-icons | **否** |
| `@ant-design/icons-vue` 全量 `import *` | **否**。只具名引入用到的 |
| lucide / 自绘 SVG | **否**。已经选定 antd |
| 页签 / 面包屑图标 | **否** |

登记名 → 组件：

| key | 组件 |
| --- | --- |
| home | HomeOutlined |
| workspace | AppstoreOutlined |
| analytics | BarChartOutlined |
| users | TeamOutlined |
| depts | ApartmentOutlined |
| roles | SafetyCertificateOutlined |
| about | InfoCircleOutlined |

## 关键文件

```text
apps/web/package.json                 # 直接依赖
apps/web/src/icons/menu-icons.ts
apps/web/src/layouts/BasicLayout.vue
apps/web/src/router/routes.ts
apps/web/src/router/access-menu.ts
apps/web/src/types/router.d.ts
```

## 怎么验收

```bash
bun run dev
```

1. 侧栏每项左边有图标，不再是「工 / 用 / 部」
2. 收起菜单：只剩图标，hover 仍能看到标题
3. 深色下图标跟着文字变色
4. `user` 登录：没有系统三项，也就没有那三个图标

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 路由 meta 放字串，组件放登记表。meta 里塞组件，动态路由和测试都会变脏。
- `import { TeamOutlined } from '@ant-design/icons-vue'` 才能摇树。`import * as Icons` 会把七百个图标打进包。
- 间接依赖不是你的依赖。antd 升级若拆走 icons-vue，侧栏会先坏。
- 在 Bun workspace 里装包，看的是「写进了哪个 package.json」，不是命令是在哪执行的。

## 下一轮从哪里开始

第 19 轮把同一套图标接到页签上，见 [25-round-19-tab-icons.md](./25-round-19-tab-icons.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
