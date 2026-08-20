# 32 · 第 26 轮：请求进度条

日期：2026-08-20。

## 本轮结论

发请求时，窗口最顶上出现一条绿色不确定进度条。挂在 `App.vue`，登录页和锁屏也能看到。

计数的是**进行中的请求数**，不是假百分比。两条请求同时在飞，要等两条都回来才开始收。mock 几乎是瞬间返回，条至少停 240ms，避免闪一下看不见。

不要上 nprogress。不要全屏 antd Spin。某次请求不想出条，传 `skipLoadingBar: true`。

登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| nprogress / `@vben` 进度封装 | **否**。CSS + pending 计数 |
| antd `Spin` / `Progress` | **否**。条不进 `AntdPage` |
| 新 npm 包 | **零** |

`request` store 不 persist。刷新时没有进行中的请求。

## 关键文件

```text
apps/web/src/api/pending.ts
apps/web/src/api/request.ts
apps/web/src/stores/request.ts
apps/web/src/components/AppLoadingBar.vue
apps/web/src/App.vue
apps/web/src/types/axios.d.ts
```

## 怎么验收

```bash
bun run dev
```

1. 登录：点提交后，最顶上出现绿条，再进工作台
2. 打开用户页（会打几个列表）：条再出来一次
3. 锁屏后解锁：条仍能看见（z-index 50，锁屏是 40）
4. mock 很快，条不会只闪 1 帧

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 进度条要会数并发。只靠「开始显示 / 结束隐藏」会在第二条还没回来时先收掉。
- 结束时 `count` 不能减到负数。失败、401、业务 `code !== 0` 都要 `end`，否则条会卡住。
- 假进度（nprogress 那种往 90% 爬）看起来更「准」，其实是在骗。不确定动画更老实。
- 条挂在 `App` 而不是 `BasicLayout`，未登录的请求也能提示。
- `skipLoadingBar` 留给以后的轮询。现在没有轮询，默认都出条。

## 下一轮从哪里开始

第 27 轮做了页面水印，见 [33-round-27-watermark.md](./33-round-27-watermark.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
