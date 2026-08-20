# 27 · 第 21 轮：顶栏用户菜单

日期：2026-08-20。

## 本轮结论

顶栏不再并排摆姓名和「退出」。点名字（或窄屏上的圆点缩写）展开菜单：账号、登录角色、业务角色码、退出。

壳里仍不用 antd `Dropdown`。没有个人中心页，没有头像上传。开合不 persist。点外面或 Escape 关掉。

窄屏只藏 `.user-label`，圆点留下，不再把整段姓名 `display: none` 弄没点击目标。

登录页 Form、页签右键仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| antd `Dropdown` / `Avatar` | **否**。壳还是 CSS |
| 个人中心 / 锁屏 | **否** |
| `@vueuse/core` `onClickOutside` | **否**。`pointerdown` + `contains` |
| 新 npm 包 | **零** |

菜单里两行角色故意分开：登录角色是 `admin` / `user`，业务角色是 `biz-admin` / `editor` / `viewer`。不要合成一行。

## 关键文件

```text
apps/web/src/layouts/user-menu.ts
apps/web/src/layouts/UserMenu.vue
apps/web/src/layouts/BasicLayout.vue
apps/web/src/layouts/__tests__/user-menu.spec.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 登录，点顶栏名字：账号 `vben`，登录角色 `admin / user`，业务角色 `biz-admin`
2. 点「退出」回到登录页
3. 菜单开着时点主题开关或页面空白处，菜单关掉
4. 窗口拖到 768 以下：顶栏只剩圆点缩写，点开仍能退出

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 顶栏是壳。为了一个下拉把 antd 的 Dropdown 和它的样式/主题算法拉进 layout，比自写贵。
- 缩写用 `[...name][0]`，不要 `name[0]`。后者会切开代理对。
- 点外部关闭要排除根节点，否则点触发器会先 outside-close 再 toggle，看起来像点不开。

## 下一轮从哪里开始

第 22 轮做了锁屏，见 [28-round-22-lock-screen.md](./28-round-22-lock-screen.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
