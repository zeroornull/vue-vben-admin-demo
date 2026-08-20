# 44 · 第 38 轮：页脚版权

日期：2026-08-20。

## 本轮结论

登录后的壳在内容区下面加了一行版权：`© 2026 Vue Admin`。今年之后会变成 `© 2026–20xx Vue Admin`。名字跟 `preferences.appName`，不是再写死一个公司名。

对照旧仓 `legacy/packages/effects/layouts` 的 footer / copyright，只搬「一行字」。不上 ICP、不上公司外链、不用 `javascript:void(0)`。没有开关，不 persist。布局全屏时和顶栏一起藏。登录页不在 `BasicLayout` 里，所以没有页脚。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 偏好抽屉里的 footer 开关 | **否**。默认一直在，全屏除外 |
| ICP / 备案号 | **否**。学习仓没有备案 |
| 公司站点 `<a href="javascript:void(0)">` | **否**。没地址就不要假装是链接 |

## 关键文件

```text
apps/web/src/layouts/copyright.ts
apps/web/src/layouts/AppFooter.vue
apps/web/src/layouts/BasicLayout.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 登录后，任意业务页底部看到 `© 2026 Vue Admin`
2. 点全屏，页脚消失；退出全屏，页脚回来
3. 登录页没有页脚

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 版权年份写死在模板里，明年就要改文件。开工年和「现在」分开传入，测试才能钉死，不必等跨年。
- 没链接就不要用 `<a>`。旧仓空站点写成 `javascript:void(0)`，会多一个假焦点，还可能被浏览器拦。
- 页脚是 `.main` 网格的最后一行 `auto`，内容区仍是 `1fr`。全屏把页脚 `display: none` 后，行定义改回 `1fr`，避免留下一条空高。
- 登录页和后台壳不是同一棵树。页脚挂在壳上，登录自然没有。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
