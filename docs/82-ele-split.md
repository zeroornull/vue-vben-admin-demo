# 82 · 第二套皮肤改成三轮

日期：2026-08-21。

原先想用 75 / 75b / 75c。本仓说「继续」只认整数轮次，字母号会被当成边角。已改成正式的第 75、76、77 轮。后面整段 +2，见 [75-phase-2-roadmap.md](./75-phase-2-roadmap.md)。

## 为什么是三轮，不是一轮

`apps/web` 里直接 `import` ant-design-vue 的页面有 11 个。adapter 没有 Table，页面也不走 `requireSkin()`。mock 还住在 `apps/web/vite/`。第一套第二皮肤的成本是「第二个 Vite app 怎么站住」，不是换按钮颜色。

不要为了共用把 antd 页改成万能 Table。Naive / TDesign 抄这三轮踩出来的路，可以仍是一轮一个 app。

## 三轮

### 第 75 轮 · ele 空壳 + 登录

新建 `apps/web-ele`。对照只看 `legacy/apps/web-ele` 的依赖和 adapter。`element-plus` + `ElePage` + Element adapter。mock 抽到两家能用。壳能复用就复用，不要从 `@app/web` 引 `.vue`。Element 登录。根脚本 `dev:ele`。默认仍是 `apps/web`。

允许把壳文件复制进 `web-ele`。不抽 `packages/app-shell`。

**验收：** `bun run dev:ele` 能登录，看到工作台和侧栏。`apps/web` 不回退。

### 第 76 轮 · ele 用户表 + 改密

Element 重写用户表、用户弹窗、个人中心改密。CSV / 权限 / mock 不动。不上 vxe（第 79 轮才动默认 app 的用户表）。

**验收：** 旧「第 75 轮」原文验收落在这里：登录、用户表、改密。

### 第 77 轮 · ele 其余系统页

部门树、角色、外链、操作日志。工作区 / 分析 / 关于 / iframe 几乎不绑 antd，能共用 query 就共用。

**验收：** `user` 在 ele 里仍只有工作区 / 分析 / 内嵌；`vben` 能改部门树和角色勾选。

## 编号怎么移

```text
旧 75 皮肤一轮     → 新 75 / 76 / 77
旧 76 VitePress    → 新 78
旧 77 vxe-table    → 新 79
旧 78–80 其余皮肤  → 新 80–82
旧 81 Playwright   → 新 83
旧 82 Vue 3.6      → 新 84
```

文档号（`82-ele-split.md`）不是轮次号。第 75 轮做完后写 `83-round-75-ele-shell.md`。

第 75–77 轮已做，见 [83](./83-round-75-ele-shell.md)、[84](./84-round-76-ele-users.md)、[85](./85-round-77-ele-system.md)。「继续」做第 78 轮 VitePress。
