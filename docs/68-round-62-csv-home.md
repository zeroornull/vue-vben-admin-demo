# 68 · 第 62 轮：外链/日志 CSV + Home/End

日期：2026-08-20。

这一轮打包两件边角。角色导出上一轮有了，外链和操作日志跟上。搜索补齐 Home/End。

## 本轮结论

外链表和操作日志都能按当前筛选导出，最多 100 条，带 BOM，公式前缀加撇号。日志里的对象和动作写成中文。谁能进那一页谁就能导出。部门是树，没有分页，这一轮仍不导出。

搜索打开后 Home 跳到第一条，End 跳到最后一条。和 ↑↓ 一样要 `preventDefault`，输入法选词时不抢。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 部门树也导出 | **否**。没有分页，和列表页不是同一套 |
| 外链 / 日志导入 | **否** |
| xlsx | **否** |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/search/cursor.ts
apps/web/src/layouts/AppSearch.vue
apps/web/src/views/links/csv.ts
apps/web/src/views/audit/csv.ts
apps/web/src/views/LinksView.vue
apps/web/src/views/AuditView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` Ctrl+K，按 End 高亮最后一项，按 Home 回到第一项，回车能跳
2. 外链页导出 `links-YYYYMMDD.csv`，能看到演示文档那一行
3. 操作日志筛「用户」再导出，文件里对象列是「用户」不是 `user`
4. 日期范围筛完再导出，行数跟表一致

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- Home/End 在搜索框里本来是挪插入符。要自己接管，否则高亮停在中间、光标去了头尾。
- 日志导出写中文标签。文件给人看，不要把 `delete` / `user` 原样丢出去。
- 转义继续走 `tables/csv.ts`。每张表只负责「哪些列、什么标签」。
- 树表没有「筛选全集」。硬导出要么拍扁丢层级，要么只导当前展开，两种都容易误会。

## 下一轮从哪里开始

核心可以停。若还要加快，把边角打包，不要再拆成单点 chrome：

1. 登录页改 antd Form / 页签右键 / 改密（收益仍小，继续不做除非点名）
2. 部门拍扁导出、搜索数字键，仍是边角
3. i18n、第二套皮肤、`@core`、Turbo、Vue 3.6 —— 不做

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
