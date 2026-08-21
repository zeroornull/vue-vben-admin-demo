# 90 · 第 81 轮：TDesign Vue

日期：2026-08-22。

## 做了什么

新建 `apps/web-tdesign`。从 `web-naive` 复制壳，不从 `@app/web` 引 `.vue`。`tdesign-vue-next` + `TdPage` + `adapter/tdesign.ts`。登录、用户表、部门树、个人中心（含改密）用 TDesign 重写。角色 / 外链 / 日志先占位。

根脚本 `bun run dev:tdesign`。默认仍是 `bun run dev` → `@app/web`。

消息和确认走 `MessagePlugin` / `DialogPlugin`，不 `app.use` 全量 TDesign。暗色用 `html[theme-mode=dark]`。排序值仍是共享的 `ascend` / `descend`，表头是 `sortBy` + `descending`，在 `tdesign-sort.ts` 里转。

## 装了什么

| 包 | 锁定 | 用途 |
| --- | --- | --- |
| `tdesign-vue-next` | 1.20.6（`~1.20.6`） | 第四套皮肤。Vue 3 线，不是 Vue 2 的 `tdesign-vue` |

## 刻意没做

- 不写角色 / 外链 / 日志表
- 不抽 `packages/app-shell`
- 不把已有页改成 `requireSkin()`
- 不上 antdv-next
- 不在 tdesign 里用 vxe

## 怎么开

```bash
bun run dev:tdesign
```

账号还是 `vben` / `admin` / `user`，密码 `123456`。

## 验收

能登录。`vben` 能改用户表和部门树，能改显示名和密码。`user` 仍只有工作区 / 分析 / 内嵌。前面三套皮肤不回退。

## 下一轮从哪里开始

第 82 轮已做，见 [91-round-82-antdv-next.md](./91-round-82-antdv-next.md)。下一轮是第 83 轮 Playwright + 自动 CI。
