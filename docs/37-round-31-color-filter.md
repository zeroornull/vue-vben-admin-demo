# 37 · 第 31 轮：色弱 / 灰色

日期：2026-08-20。

## 本轮结论

顶栏、登录页、锁屏都能切「原色 → 色弱 → 灰色」。写在 `preferences.colorFilter`，刷新还在。默认原色。

色弱是 `html { filter: invert(0.8) }`，灰色是 `grayscale(1)`。这是旧仓常见的整页滤镜，**不是**色觉障碍模拟，也**不能**代替对比度 / 键盘无障碍。图表、水印、错误条都会一起被滤。

不要上专门的无障碍库。不要用 `prefers-color-scheme` 去写滤镜。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben` 色弱 / 灰色偏好 | 自写 `color-filter` + `html[data-filter]` |
| 把滤镜当无障碍交付 | **否** |
| 新 npm 包 | **零** |

`index.html` 在 Vue 起来之前读 persist，避免先闪原色再变灰。和主题同一套手法。

## 关键文件

```text
apps/web/src/preferences/color-filter.ts
apps/web/src/stores/preferences.ts
apps/web/src/components/ColorFilterToggle.vue
apps/web/src/assets/base.css
apps/web/index.html
apps/web/src/App.vue
```

## 怎么验收

```bash
bun run dev
```

1. 点到「色弱」：整页反相；分析页的图也会反
2. 再点到「灰色」：整页变灰
3. 刷新仍是灰色
4. 登录页也能切；和深浅色可以叠（先选深色再灰色）
5. 再点回「原色」

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 主题改的是 token。滤镜改的是渲染结果。两件事不要合成一个 `themeMode`。
- `invert` 叠在深色主题上会很难看。这正好说明它不是认真的「色弱模式」。
- 滤镜写在 `html` 上，子树（含 canvas）一起变。想让某一块免滤，得拿出来挂到 `html` 外面，本轮不做。
- persist 的字段要在 `index.html` 里提前读，否则刷新会闪一帧原色。

## 下一轮从哪里开始

第 32 轮做了回到顶部，见 [38-round-32-back-top.md](./38-round-32-back-top.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
