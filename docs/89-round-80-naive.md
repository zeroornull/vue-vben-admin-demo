# 89 · 第 80 轮：Naive UI

日期：2026-08-22。

## 做了什么

新建 `apps/web-naive`。从 `web-ele` 复制壳，不从 `@app/web` 引 `.vue`。`naive-ui` + `NaivePage` + `adapter/naive.ts`。登录、用户表、部门树、个人中心（含改密）用 Naive 重写。角色 / 外链 / 日志先占位。

根脚本 `bun run dev:naive`。默认仍是 `bun run dev` → `@app/web`。

消息和确认走 `createDiscreteApi`，不 `app.use` 全量 Naive。

## 装了什么

| 包 | 锁定 | 用途 |
| --- | --- | --- |
| `naive-ui` | 2.44.1（`~2.44.1`） | 第三套皮肤。官网当前稳定；`^` 会落到 2.45 的 vue-jsx-vapor 实验包 |

## 刻意没做

- 不写角色 / 外链 / 日志表
- 不抽 `packages/app-shell`
- 不把 antd / ele 页改成 `requireSkin()`
- 不上 TDesign / antdv-next
- 不在 naive 里用 vxe

## 怎么开

```bash
bun run dev:naive
```

账号还是 `vben` / `admin` / `user`，密码 `123456`。

## 验收

能登录。`vben` 能改用户表和部门树，能改显示名和密码。`user` 仍只有工作区 / 分析 / 内嵌。`apps/web` / `web-ele` 不回退。

## 下一轮从哪里开始

第 81 轮已做，见 [90-round-81-tdesign.md](./90-round-81-tdesign.md)。下一轮是第 82 轮 antdv-next。
