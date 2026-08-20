# 16 · 第 10 轮：用户挂部门

日期：2026-08-20。

## 本轮结论

把第 8 轮的用户表和第 9 轮的部门树接上。用户有可选 `deptId`；列表按部门筛时**含下级**；部门表多一列「人数」；叶子部门若还有人，删不掉。

旧 playground 用户页左侧有部门树，点中只按**精确** `deptId` 过滤。本轮筛「研发」会带上前端/后端的人。精确匹配对树来说几乎总是漏人。

没有新 npm 包，也没有搬角色页。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 用户列表左侧部门树 | 查询区一个 TreeSelect，占位更小 |
| 精确 `deptId` | **含下级**（`deptId` + `collectDescendantIds`） |
| 部门删除只拦子节点 | 再加上「该节点上的用户数」 |
| 新 npm 包 | **零** |

## 和旧页的差别

- 部门可选。Oscar 种子数据是未分配
- 筛选含下级；人数只统计**直接**挂在该节点上的用户（集团有 Judy 则为 1，不含子孙）
- 删部门：先子节点，再直接用户。mock 和页面都拦
- 用户表用部门名称，不用再显示 id

## 关键文件

```text
apps/web/src/views/users/query.ts     # matchesDeptScope / countUsersInDept
apps/web/src/views/depts/query.ts     # deptDeleteBlocker / deptNameById
apps/web/src/views/UsersView.vue
apps/web/src/views/users/UserFormModal.vue
apps/web/src/views/DeptsView.vue      # 人数列
apps/web/vite/users-store.ts
apps/web/vite/depts-store.ts
apps/web/vite/mock-api.ts             # 列表挂 userCount
```

两个 mock store **单向**依赖：`users-store` 问部门在不在；删部门时由 `mock-api` 去数用户，避免循环 import。

## 怎么验收

```bash
bun run dev
```

1. 「用户」表有部门列；Alice 在产品，Oscar 未分配
2. 部门筛「研发」，能看到 Eve / Grace，以及前端 Carol、后端 Dave
3. 新建用户可选部门；保存后名称对得上
4. 「部门」表「设计」人数是 1（Bob）
5. 删「设计」会提示先移走用户；把 Bob 改走或删掉后才能删设计
6. 有下级的「集团」仍是先删下级

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 两张表一旦有外键，删除约束要写成纯函数（`deptDeleteBlocker`），页面和 mock 共用同一句话。
- 「筛选范围」和「人数」可以不是同一口径：筛含下级，人数只计本节点。把两种规则拆开测，比揉进一个 `query` 好懂。
- Vite mock 里 store 互相引用很容易成环。让其中一个只读对方，写操作放到中间件编排。

## 下一轮从哪里开始

业务角色见 [17-round-11-roles.md](./17-round-11-roles.md)。
