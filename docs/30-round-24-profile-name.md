# 30 · 第 24 轮：改显示名

日期：2026-08-20。

## 本轮结论

个人中心可以改 `realName`。写的是登录账号那张表（`vben` / `admin` / `user`），不是系统用户 CRUD。Alice 的名字不会变。

账号、登录角色、业务角色、密码都不能改。没有操作码：改的是自己的会话，不是用户管理。mock 只要求登录。

保存后 `userInfo` 更新，顶栏圆点和锁屏上的名字跟着变。刷新仍在（mock 内存）；重启 dev 回到种子「Vben」。

登录页 Form、页签右键仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 改密 / 头像 | **否** |
| 和个人中心共用系统用户 PUT | **否**。两张表 |
| 新 npm 包 | **零** |

`PUT /user/profile` 只收 `realName`。校验和页面同一份 `validateProfileForm`。

## 关键文件

```text
apps/web/src/views/profile/query.ts
apps/web/src/views/ProfileView.vue
apps/web/src/api/user.ts
apps/web/src/stores/auth.ts
apps/web/vite/mock-api.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 进个人中心，显示名改成「维特」，保存
2. 顶栏圆点变成「维」，点开菜单也是这个名字
3. 锁屏上也是「维特」
4. 打开系统用户：Alice 仍叫 Alice
5. 显示名清空再保存，应提示「请输入显示名」

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 会话资料和业务用户表长得像，写进同一张表会把登录账号改成 Alice。
- 改自己的显示名不要套 `user:update`。那个码是系统用户页的编辑。
- mock 从 `src` 引校验时，那份文件不要用 `@/`。和角色 query 同一条限制。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（mock 现在三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
