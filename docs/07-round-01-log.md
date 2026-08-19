# 07 · 第 1 轮执行记录

日期：2026-08-19。

## 做了什么

1. 将仓库根上除 `.git`、`.omc` 以外的原 Vben 文件全部移入 `legacy/`。
2. 根目录新建 `.gitignore`，忽略整个 `legacy/`，以及常见的 `node_modules`、构建产物、编辑器与 agent 目录。
3. 新建本目录文档（00–07）和根 `README.md`。
4. **没有**执行 `pnpm install` / `bun install`，**没有**改 `legacy/` 内源码。

## 移动说明

`.vscode/` 与 `vben-admin.code-workspace` 第一次移动时被编辑器占用，随后用非沙箱权限移入 `legacy/`。若本机 Cursor 又在根目录生成 `.vscode`，那是编辑器行为，不要把它当成旧仓的一部分。

`.omc/` 是本地 agent 状态，留在根上，并已加入 ignore。

## 当前根目录应该长这样

```text
.
├── .git/
├── .gitignore
├── README.md
├── docs/
│   ├── README.md
│   ├── 00-overview.md
│   ├── 01-legacy-inventory.md
│   ├── 02-architecture.md
│   ├── 03-migration-roadmap.md
│   ├── 04-learn-bun.md
│   ├── 05-learn-vue-ts.md
│   ├── 06-command-mapping.md
│   └── 07-round-01-log.md
└── legacy/          ← 仅本机，Git 不跟踪
```

## Git 上会看到什么

对 Git 而言，原先被跟踪的 Vben 文件全部变成「删除」，同时新增 `docs/`、`README.md`、新的 `.gitignore`。这是预期结果：旧源码不再进版本库。

`legacy/` 出现在 `git status` 的 untracked 里也不应被 `git add`。若 status 里完全不提 `legacy/`，说明 ignore 已生效。

## 下一轮从哪里开始

打开 [03-migration-roadmap.md](./03-migration-roadmap.md) 的「第 2 轮」，按顺序：

1. 确认本机 `bun --version` ≥ 1.3
2. `bun x create-vue@latest apps/web`（官方脚手架，勾选 TS / Router / Pinia）
3. 根目录补 Bun workspace，`bun install`，提交 `bun.lock`
4. 跑通 `dev` / `build` / 类型检查
5. 新增 `docs/08-round-02-scaffold.md`，记下勾选和真实版本号

第 2 轮开始前建议先把第 1 轮文档过一遍，尤其是 [02-architecture.md](./02-architecture.md) 的启动链，避免脚手架做成和旧仓完全对不上的结构。
