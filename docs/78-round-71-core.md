# 78 · 第 71 轮：`@app/core` 薄核

日期：2026-08-21。

二期第三刀。开口子，不搬旧仓 ui-kit。实现仍只有 antd 一份。

## 本轮结论

`@app/core` 只装两样：

1. **主题 token**：`html[data-theme]` / `data-density` / `data-filter` 的类型、归一化、写 dataset
2. **adapter 类型 + 注册表**：`Form` / `Input` / `Modal` / `message` / `confirm` / `controlSize`

第一份实现在 `apps/web/src/adapter/antd.ts`。`main.ts` 里 `initAntdSkin()`。核包的 `package.json` 没有 `ant-design-vue`，也没有 `vue`。

`AntdPage` 仍叫这个名字，仍包 antd 的 `ConfigProvider`，但控件尺寸改走已注册皮肤的 `controlSize`。页面里的 Form / Table / `message.success` **没改**，视觉不变。

没有复制 `legacy/packages/@core`。没有给 Element / Naive 建空目录。

## 依赖清单（先列再决定）

| 项 | 决定 |
| --- | --- |
| 主题 token 进核 | **是** |
| adapter 类型进核 | **是** |
| 核依赖 UI 库或 vue | **否**。组件位写成 `object` |
| 页面改走 `requireSkin().message` | **否**。一改就会动视觉和测试 |
| 抽 BasicLayout | **否** |
| 新 npm | **零** |

## 关键文件

```text
packages/core/src/theme.ts
packages/core/src/density.ts
packages/core/src/color-filter.ts
packages/core/src/adapter.ts
apps/web/src/adapter/antd.ts
apps/web/src/components/AntdPage.vue
apps/web/src/main.ts
```

## 怎么验收

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

1. `packages/core/package.json` 的 dependencies 是空的
2. 切深色 / 紧凑 / 色弱，dataset 和以前一样
3. 登录、用户表、弹窗、`message` 看起来没变
4. `bun run --filter @app/core test` 单独绿

## 学习笔记

- 旧仓 [02](./02-architecture.md) 第 6 节写过：第二套皮肤出现之前不要抽 adapter。这一轮只把注册表和类型放到核里，实现还在 app。第 75 轮换 Element 时，再写第二份 `adapter/ele.ts` 调 `registerSkin`。
- `controlSize` 回 `string`，不回 antd 的 `'small' | 'middle'`。核不能认识某一套皮肤的尺寸枚举。
- `clearSkin` 只给测试用。产品代码用 `registerSkin` / `getSkin` / `requireSkin`。

## 下一轮从哪里开始

第 72 轮已做，见 [79-round-72-turbo.md](./79-round-72-turbo.md)。下一轮是第 73 轮 i18n。
