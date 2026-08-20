# 33 · 第 27 轮：页面水印

日期：2026-08-20。

## 本轮结论

登录后整页铺一层斜着的水印，文案是「显示名 · 账号」。顶栏「水印开 / 水印关」，写在 `preferences.watermarkEnabled`，刷新还在。默认开。

水印不是安全边界：`pointer-events: none`，挡不了截图，谁都能在控制台把节点删掉。它只是提醒这是谁的会话。未登录不画。改个人中心显示名，水印跟着变。

不要上 canvas 水印库。不要用 antd 的 Spin 盖一层字。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben` 水印 / canvas 方案 | **否**。SVG data URL 当 `background-image` |
| 把水印当防泄密 | **否**。和锁屏一样只是 overlay |
| 新 npm 包 | **零** |

z-index **6**：盖在内容上，低于抽屉 / 搜索 / 锁屏 / 进度条。点得穿。

## 关键文件

```text
apps/web/src/preferences/watermark.ts
apps/web/src/stores/preferences.ts
apps/web/src/components/AppWatermark.vue
apps/web/src/components/WatermarkToggle.vue
apps/web/src/App.vue
apps/web/src/layouts/BasicLayout.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 登录，页面斜着「Vben · vben」
2. 登录页没有水印
3. 顶栏点成「水印关」，字消失；刷新仍关
4. 个人中心把显示名改成「阿本」，水印变成「阿本 · vben」
5. 水印挡不住按钮，搜索和锁屏仍可点

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 重复水印用 SVG 当 tile，比往 DOM 里铺几十个 `<span>` 干净，也不用 canvas 库。
- 文案进 SVG 之前要 `escapeXml`。显示名里若有 `<` `&`，不转义会把 data URL 剪坏，极端情况还能注入标记。
- 深色用浅字、浅色用深字。跟主题走，不要写死一种半透明黑。
- 开关是偏好，身份是会话。关水印只记布尔值，不要把名字写进 persist。

## 下一轮从哪里开始

第 28 轮做了布局全屏，见 [34-round-28-content-fullscreen.md](./34-round-28-content-fullscreen.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
