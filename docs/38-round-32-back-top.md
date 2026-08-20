# 38 · 第 32 轮：回到顶部

日期：2026-08-20。

## 本轮结论

窗口滚过 320px 后，右下角出现「顶部」。点了 `window.scrollTo` 回顶端。锁屏时不出现。

听的是 **window** 滚动，不是内容区某个 overflow 盒子。本仓壳没有自己做滚动容器，页面变长就是文档在滚。若以后把 `section` 做成内部滚动，这颗按钮会失灵，得改听那个盒子。

不要上 antd `BackTop`，不要上 VueUse。路由切换时 vue-router 已经把滚动重置到顶部（`scrollBehavior`），和这颗按钮不是一件事。

登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| antd `BackTop` | **否**。一颗原生按钮 |
| VueUse `useWindowScroll` | **否**。自己听 `scroll` |
| 记住滚动位置 persist | **否**。视口态 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/layouts/back-top.ts
apps/web/src/components/AppBackTop.vue
apps/web/src/App.vue
```

## 怎么验收

```bash
bun run dev
```

1. 打开用户或分析，把窗口往下滚，右下角出现「顶部」
2. 点它，回到页头，按钮消失
3. 换页：本来就会回到顶部（路由行为），按钮不应残留
4. 锁屏后即使之前滚下去了，也不应看到按钮

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 先问「谁在滚」。`window`、`document.documentElement` 和内部 `overflow: auto` 是三种监听对象。听错了，按钮永远不出现。
- `scroll` 监听用 `{ passive: true }`。这个监听不调用 `preventDefault`，标成 passive 让浏览器放心滚。
- 阈值要按「过了一屏」来，不要 16px 就跳出来晃眼睛。
- 回到顶部不是返回上一页。浏览器 Back 和这颗按钮不要做成同一个。

## 下一轮从哪里开始

第 33 轮做了浏览器标签标题，见 [39-round-33-document-title.md](./39-round-33-document-title.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
