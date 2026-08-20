# 45 · 第 39 轮：紧凑密度

日期：2026-08-20。

## 本轮结论

外观菜单加了「舒适 / 紧凑」。默认舒适。紧凑时：

- `html[data-density=compact]` 收侧栏、顶栏、内容边距、正文字号
- 包着 antd 的 `AntdPage` 把 `ConfigProvider` 的 `componentSize` 改成 `small`

两套要一起改。只缩壳，表格还是 middle；只改 antd，侧栏还是厚的。persist 和主题、色弱同一份 `preferences`。`index.html` 在 Vue 起来前读一次，减少闪一下。

只有两档，不上 `large`。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 整页偏好抽屉 / 多种布局模式 | **否**。一个开关 |
| 用 `zoom` / `transform: scale` 假装紧凑 | **否**。字体会糊，点击区域也对不齐 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/preferences/density.ts
apps/web/src/components/DensityToggle.vue
apps/web/src/components/AntdPage.vue
apps/web/src/assets/base.css
apps/web/index.html
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 打开用户页，外观里点到「紧凑」：顶栏变矮，表格行变矮
2. 刷新仍是紧凑
3. 再点回「舒适」，壳和表格一起回到原来

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- antd 的 size 只管它自己的控件。布局壳是另一套 CSS。密度是映射，不是一个魔法属性。
- token 写在 `html` 上，组件里用 `var(--chrome-*)`。不要在每个 Vue 文件里 `if (compact) class="tight"`。
- 和主题一样：不要把紧凑写进 `prefers-reduced-motion` 或媒体查询。这是用户偏好，不是系统偏好。
- persist 的 key 是 store id `preferences`。`index.html` 里的读取必须和 `normalizeDensity` 认同一组字符串。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
