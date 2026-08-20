# 73 · 第 67 轮：部门树展开 + iframe 重载

日期：2026-08-20。

点名不做的仍没做。还剩两件说得通的边角：树记住展开，内嵌页能重来一次。

## 本轮结论

部门树默认仍是全展开。收起某一支后写进 `table-expand` persist，刷新还在。筛「前端」时只动看得见的节点，藏着的分支不丢。没点过展开条之前不写自定义列表，还是全开。

这不是列开关。部门树仍然没有分页、没有排序、没有「列」。

内嵌页加了「重新加载」和「新窗口打开」。重载靠换 `key`，不是改 sandbox。新窗口只接受已经过 `safeIframeSrc` 的站内路径或 http(s)。登录页 Form、页签右键、改密、日志导入仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 部门树列显隐 | **否**。和第 66 轮同一条 |
| iframe 跟着页签缓存多实例 | **否**。还是当前这一页 |
| `allow-top-navigation` | **否**。新窗口是 `window.open`，不给 iframe 顶掉壳 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/tables/expand.ts
apps/web/src/stores/table-expand.ts
apps/web/src/views/DeptsView.vue
apps/web/src/views/iframe/src.ts
apps/web/src/views/IframeView.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 部门页收起「研发」，刷新后研发仍收着，集团还开着
2. 名称筛「前端」，再收起集团；清筛选后「支持」不该被这次折叠带掉
3. 打开内嵌页或演示文档，点重新加载，框里的页会再进一次
4. 点新窗口打开，浏览器多一个标签，地址是过滤后的 src

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 受控的 `expandedRowKeys` 和 `defaultExpandAllRows` 不要一起用。一个说「听我的」，一个说「第一次全开」，会打架。
- 筛选后的树若直接把 `expandedRowsChange` 写进 persist，看不见的节点会被当成「收起」。合并时要留下不在当前树里的旧 key。
- 重载 iframe 换 `key` 比改 `src` 加时间戳干净。地址栏不变，只是拆掉再挂一棵节点。

## 下一轮从哪里开始

有意义的表能力和壳边角也差不多齐了。再说「继续」还能扫，但下面这些仍不做，除非点名：

1. 登录页改 antd Form / 页签右键 / 改密
2. 操作日志导入、部门树列开关
3. i18n、第二套皮肤、`@core`、Turbo、Vue 3.6

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
