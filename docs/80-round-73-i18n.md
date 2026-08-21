# 80 · 第 73 轮：i18n

日期：2026-08-21。

## 做了什么

`vue-i18n` 进 `@app/web`。先 `zh-CN` + `en-US`。语言 token 放 `@app/core`（和主题 / 疏密同一层），文案在 app 的 `src/i18n/messages/`。语言写进 preferences persist。antd `ConfigProvider` 跟语言走 `zhCN` / `enUS`。

抽出壳和系统页上的中文：登录、侧栏、页签菜单、表格列名、确认框标题、错误条 aria。侧栏和页签按路由名翻译；外链菜单仍用用户写的标题。

## 刻意没做

- 不翻译 mock 种子（Alice、部门名、业务管理员）。
- 不上到 10 种语言。
- CSV 表头和 `@app/access` 目录里的中文 title 保持中文，导入仍按中文列名 / 菜单名对。
- 接口报错、`@app/request` 回退文案仍可以是中文。
- 工作区 / 分析页卡片、锁屏、快捷键全文、个人中心表单留到以后再抽。

## 怎么切

外观菜单里的「语言 / Language」在 `zh-CN` 和 `en-US` 之间轮。刷新后还在上次的语言。

## 验收

切到 English，侧栏和用户表表头是英文；刷新还在 English。点一条会失败的请求，错误条可以仍是中文。

## 下一轮从哪里开始

第 74 轮已做，见 [81-round-74-iconify.md](./81-round-74-iconify.md)。皮肤从第 75 轮起共三轮，见 [82-ele-split.md](./82-ele-split.md)。
