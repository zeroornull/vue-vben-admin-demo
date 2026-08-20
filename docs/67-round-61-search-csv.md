# 67 · 第 61 轮：搜索键盘 + 角色 CSV

日期：2026-08-20。

这一轮打包两件边角。通知已读 persist 没做：第 47 轮写明已读只在 Vite 进程里，不要写进 localStorage，这一轮不改那条。

## 本轮结论

Ctrl+K 打开后可以用 ↑↓ 移动高亮，回车跳当前项，到头会绕回另一头。关键字一变，高亮回到第一条。鼠标移上去也改高亮，这样回车和点击是同一条。列表太长时把高亮滚进视野。

角色表加了「导出」。按当前筛选拉，最多 100 条，带 BOM，公式前缀加撇号。谁能进角色页谁就能导出，不再单开 `role:export`。不上 xlsx。登录页 Form、页签右键、改密仍不做。

转义、文件名和拼 CSV 抽到 `tables/csv.ts`，用户导出走同一套。导入解析还留在用户页。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 通知已读写 localStorage | **否**。第 47 轮已拍板 |
| 角色 CSV 导入 | **否**。菜单和操作码用中文标签往回映射容易错 |
| xlsx / exceljs | **否** |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/search/cursor.ts
apps/web/src/layouts/AppSearch.vue
apps/web/src/tables/csv.ts
apps/web/src/views/roles/csv.ts
apps/web/src/views/RolesView.vue
apps/web/src/views/users/csv.ts
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 按 Ctrl+K，↓ 几次高亮往下走，回车进高亮那一页
2. 输入「用」，高亮回到第一条匹配；↑ 从第一条会绕到最后一条
3. 角色页点导出，得到 `roles-YYYYMMDD.csv`，中文不乱码，菜单是中文名
4. 筛「编辑」再导出，文件里只有匹配的角色

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 搜索框里 ↑↓ 会移动光标。要 `preventDefault`，否则高亮和输入位置各走各的。`isComposing` 时别抢，中文输入法在选词。
- 最近和全部是两截列表。键盘看的是拼起来的下标，不要两套 cursor。
- 关键字变了必须把 cursor 置 0。旧下标可能已经超出新结果。
- 导出当前页会骗人。导出筛选结果，并把上限写进提示。
- 转义只写一份。用户和角色各写一遍，漏掉公式前缀只是时间问题。
- 通知已读若改 persist，等于改第 47 轮的账本。重启 mock 变未读是故意的。

## 下一轮从哪里开始

核心可以停。若还要加快，把边角打包，不要再拆成单点 chrome：

1. 登录页改 antd Form / 页签右键 / 改密（收益仍小，继续不做除非点名）
2. 外链 / 操作日志 CSV、搜索 Home/End，仍是边角
3. i18n、第二套皮肤、`@core`、Turbo、Vue 3.6 —— 不做

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
