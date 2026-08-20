# 57 · 第 51 轮：未保存离开确认

日期：2026-08-20。

## 本轮结论

用户 / 部门 / 角色 / 外链表单弹窗，以及个人中心显示名，在有未保存改动时会先确认再关。关弹窗走 `@cancel`；换页走 `onBeforeRouteLeave`。确认框是浏览器自带的 `window.confirm`，不是 antd Modal，这样路由守卫里能同步拦住。

脏状态只活在当前页，不写 persist。弹窗没打开时不算脏。换页并确认丢弃后会关掉弹窗，避免 KeepAlive 回来还开着。个人中心确认离开后把显示名还原成已保存值；关浏览器标签会走 `beforeunload`。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 自己画一层确认 Modal | **否**。`confirm` 能同步返回 |
| 脏状态写 localStorage | **否**。关掉就丢 |
| 所有页关标签都拦 | **否**。只有个人中心挂 `beforeunload` |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/forms/unsaved.ts
apps/web/src/forms/use-unsaved.ts
apps/web/src/views/users/UserFormModal.vue
apps/web/src/views/depts/DeptFormModal.vue
apps/web/src/views/roles/RoleFormModal.vue
apps/web/src/views/links/LinkFormModal.vue
apps/web/src/views/ProfileView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 打开用户「新建」，改一个字，点取消，出现「有未保存的修改，确定离开？」；选取消，弹窗还在
2. 同样脏着点侧栏「部门」，确认后才离开，再回来用户弹窗是关的
3. 个人中心改显示名不保存，点侧栏会确认；保存后再走不弹
4. 没改过的弹窗，取消直接关

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- `onBeforeRouteLeave` 要同步 `false`。antd Modal 的确认是 Promise，守卫等不及，所以用 `window.confirm`。
- 对照用快照，不要逐字段手写 dirty。对象键排序、字符串数组排序，避免多选角色勾选顺序误报。
- 受控 Modal 只要不 `emit('update:open', false)`，点遮罩或叉也关不掉。
- 空快照不算脏。弹窗关掉后 `isActive` 为假，换页不会误拦。
- KeepAlive 会记住 `modalOpen`。离开并确认丢弃时要顺手关掉，否则回来还开着脏表单。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
