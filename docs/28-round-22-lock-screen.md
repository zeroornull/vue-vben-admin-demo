# 28 · 第 22 轮：锁屏

日期：2026-08-20。

## 本轮结论

用户菜单加了「锁定屏幕」。盖一层遮罩，壳加 `inert`。token 和页签都还在。刷新后若 `lock.locked` 仍是 true，还是锁着，不用重新登录。

解锁走 `POST /auth/unlock`，mock 用**当前账号**的密码（还是 `123456`）。解的不是再发一张 token。密码错了只提示，不清会话。

锁屏不是安全边界：谁都能清 `localStorage.lock`。它只是挡一眼。退出才会 `reset`。

个人中心页仍不做。登录页 Form、页签右键仍不做。锁屏用原生表单，不进 `AntdPage`。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| `@vben/locks` / 锁屏组件包 | 自写 `LockScreen` + `lock` store |
| 锁屏当安全措施 | **否**。只是 overlay |
| 手势 / 背景图 | **否** |
| 新 npm 包 | **零** |

`lock` persist：`locked` + `owner`。换账号 `syncOwner` 会解开，避免上一账号的锁挡下一账号。

## 关键文件

```text
apps/web/src/auth/unlock.ts
apps/web/src/stores/lock.ts
apps/web/src/layouts/LockScreen.vue
apps/web/src/layouts/UserMenu.vue
apps/web/src/layouts/BasicLayout.vue
apps/web/src/api/auth.ts
apps/web/vite/mock-api.ts
```

## 怎么验收

```bash
bun run dev
```

1. 登录后打开用户、部门，再锁屏：遮罩盖住，侧栏点不了
2. 乱输密码：提示「密码错误」，仍锁着
3. 输入 `123456`：回到刚才的页签
4. 再锁一次，刷新：还是锁屏，没有跳到登录页
5. 锁屏上点「退出登录」：到登录页；再进不该仍锁着

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 锁屏 ≠ 退出。退出清 token；锁屏只挡 DOM。
- 解锁接口必须认当前 token 对应的账号。不要做成「任意账号密码都能解」。
- persist 的锁要带 owner。否则 A 锁了、退出、B 登录，会先看到 A 的锁。
- Escape 不能解锁。那是抽屉的关闭键，不是安全阀。

## 下一轮从哪里开始

第 23 轮做了个人中心，见 [29-round-23-profile.md](./29-round-23-profile.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
