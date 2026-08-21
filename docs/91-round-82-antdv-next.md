# 91 · 第 82 轮：antdv-next

日期：2026-08-22。

## 做了什么

新建 `apps/web-antdv-next`。从 `web-tdesign` 复制壳，不从 `@app/web` 引 `.vue`。依赖只装 `antdv-next`，没有 `ant-design-vue`。登录、用户表、部门树、个人中心（含改密）用 antdv-next 重写。角色 / 外链 / 日志先占位。

根脚本 `bun run dev:antdv-next`。默认仍是 `bun run dev` → `@app/web`。

两套 antd 家系隔离：默认 app 继续 `ant-design-vue@4`，这一套只认 `antdv-next`。catalog 不收成同一个键。`isolation.spec.ts` 盯着本 app 的 package.json 和源码 import。

## 装了什么

| 包 | 锁定 | 用途 |
| --- | --- | --- |
| `antdv-next` | 1.5.2（`~1.5.2`） | 第五套皮肤。独立重写，不是 `ant-design-vue-next` 那个 4.x 兼容叉 |

## 刻意没做

- 不写角色 / 外链 / 日志表
- 不抽 `packages/app-shell`
- 不把已有页改成 `requireSkin()`
- 不在这一套里引进 `ant-design-vue`
- 不在 antdv-next 里用 vxe
- 不开 Playwright / 自动 CI（第 83 轮）

## 怎么开

```bash
bun run dev:antdv-next
```

账号还是 `vben` / `admin` / `user`，密码 `123456`。

## 验收

能登录。`vben` 能改用户表和部门树，能改显示名和密码。`user` 仍只有工作区 / 分析 / 内嵌。前面四套皮肤不回退。本 app 的 lock 里没有 `ant-design-vue`。

## 下一轮从哪里开始

第 83 轮已做，见 [92-round-83-playwright.md](./92-round-83-playwright.md)。下一轮是第 84 轮 Vue 3.6 实验。
