# 74 · 第 68 轮：剩下的边角一次做完

日期：2026-08-20。

用户说别再一轮轮扫。点名过、一直往后推的边角这一轮一起收：登录 antd Form、页签右键和拖拽、改密、日志导入、部门树列开关。

## 本轮结论

登录页包进 `AntdPage`，用户名 / 密码走 antd Form。外观菜单还是 CSS 面板。假账号芯片仍填种子密码 `123456`。校验是纯函数：用户名 trim，密码不 trim，和锁屏同一套精确比较。

页签右键出 CSS 菜单，不进 antd Dropdown。动作看点到的那一项：刷新、关闭、关闭其他 / 左侧 / 右侧 / 全部。钉住的工作台关不掉。刷新先跳到该页，再沿用壳上的 `viewEpoch`。拖非钉住页签可改顺序，工作台永远在最左；顺序跟着 `tabs` persist。菜单 z-index 31，夹在搜索 30 和快捷键说明 32 之间。

改密在个人中心。当前密码 + 新密码 + 确认。只改登录账号 `vben` / `admin` / `user`，不写系统用户表。密码存在 Vite mock 进程里，登录和解锁都认新的。刷新开发服务回到 `123456`。日志记一条「修改资料「登录密码」」，不写明文。

操作日志导入按导出 CSV 回放。没有 `audit:create`，也不假装有。能打开日志页就能导。写入内存环形缓冲，最多 100 条，旧的被挤掉。重启 mock 仍回种子。

部门树有了列开关。锁定部门名称。人数 / 状态 / 备注 / 创建时间可关。操作列仍跟权限走。列键是 `TableColumnKey`，比分页 / 排序的 `TablePageKey` 多一个 `depts`。树仍然不分页、不排序。导出导入仍是完整列。

通知已读 persist、i18n、第二套皮肤、`@core`、Turbo、Vue 3.6 仍然不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 登录页 antd Form | **是**。只包这一页，不 `app.use(Antd)` |
| 页签 antd Dropdown | **否**。壳继续 CSS |
| 页签拖拽库 | **否**。原生 HTML5 drag |
| 改密写 localStorage | **否**。跟锁屏一样认 mock 进程里的密码 |
| `audit:create` | **否**。导入是回放，不是业务新建 |
| 部门树分页 / 排序 | **否**。只加列显隐 |
| 通知已读 persist | **否**。第 47 轮锁过 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/views/LoginView.vue
apps/web/src/views/login/query.ts
apps/web/src/layouts/tab-query.ts
apps/web/src/layouts/AppTabs.vue
apps/web/src/stores/tabs.ts
apps/web/src/views/ProfileView.vue
apps/web/src/views/profile/query.ts
apps/web/src/api/auth.ts
apps/web/vite/mock-api.ts
apps/web/src/views/audit/query.ts
apps/web/src/views/audit/csv.ts
apps/web/src/views/AuditView.vue
apps/web/src/tables/columns.ts
apps/web/src/views/DeptsView.vue
```

## 怎么验收

```bash
bun run dev
```

1. 登录页是 antd 输入框。外观里改紧凑 / 深色，表单跟着变。芯片仍能填 `vben / 123456`
2. 打开用户和部门，右键用户页签能关、能刷新、能关左侧。工作台右键没有「关闭」。拖部门到用户左边，刷新后顺序还在
3. 个人中心把 `vben` 密码改成 `abcdef`，退出再登要用新密码；锁屏解锁也是。重启 `bun run dev` 后回到 `123456`
4. 操作日志先导出再导回去，表上多出同样的行。时间、操作者、中文对象 / 动作对得上
5. 部门树关掉「备注」，刷新后还关着。名称列关不掉

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 壳上的菜单继续 CSS。antd 只进 `AntdPage`。登录页现在也是页面，不是壳，所以可以包 Form。
- 页签拖到目标上：往右移插到目标后面，往左移插到目标前面。钉住项只能当「放到最左可动位」的落点。
- 改密和解锁必须同一份内存密码。persist 只存 token，不存口令。
- 日志导入和用户导入不是一类事。用户导入调 `user:create`。日志没有创建接口，CSV 只是把环形缓冲再喂一遍。

## 下一轮从哪里开始

点名过的边角已经收完。再说「继续」没有同等体量的表能力或壳能力可搬。下面这些仍不做：

1. i18n、第二套皮肤、`@core`、Turbo、Vue 3.6
2. 通知已读写 `localStorage`
3. VitePress、Iconify、vxe-table、五套皮肤、`packages/` 拆包、Playwright 自动 CI

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
