# 52 · 第 46 轮：闲置锁屏

日期：2026-08-20。

## 本轮结论

外观菜单加了闲置锁屏：关闭 → 1 分钟 → 15 分钟。默认关。到点只调现有 `lockStore.lock()`，不清 token，要输当前账号密码。登录页没有壳，所以不会在登录页锁。

切走标签页也算空闲（和第 41 轮版本轮询相反：轮询在隐藏时停，闲置计时不停）。不听 `mousemove`，避免鼠标微动永远不锁。登录页 Form、页签右键、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 闲置后直接登出 | **否**。只锁屏 |
| 把 lastActivity 写进 persist | **否**。刷新重新计时 |
| `@vueuse/core` useIdle | **否**。自己听事件 + 纯函数判断 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/preferences/idle-lock.ts
apps/web/src/layouts/use-idle-lock.ts
apps/web/src/components/IdleLockToggle.vue
apps/web/src/stores/preferences.ts
apps/web/src/layouts/BasicLayout.vue
```

## 怎么验收

```bash
bun run dev
```

1. `vben` 登录，外观点到「1 分钟」，手离开键鼠等一分钟，出现锁屏
2. 密码 `123456` 能解锁；刷新若当时已锁，还是锁着（第 22 轮就 persist 了 `locked`）
3. 再点回「闲置关」，等再久也不会自动锁
4. 用户菜单「锁定屏幕」仍然立刻锁

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- 闲置是「多久没活动」，锁屏是「现在挡一层」。前者是偏好，后者是会话态。不要把超时写进 lock store。
- 改档位时把 lastActivity 重置到现在。否则从「关」切到「1 分钟」会立刻锁。
- 自动锁也要收抽屉和内容全屏。手动锁已经走 `onLock`；闲置只调 `lock()`，所以用 `watch(locked)` 收口。
- 1 分钟是给本机演示用的。真系统常从 15 分钟起，但那不方便验收。

## 下一轮从哪里开始

还可以继续加，仍不要第二套库：

1. 登录页改 antd Form（收益仍小）
2. 页签右键 / 拖拽（旧仓有，本仓故意没搬）
3. 改密（三个账号共用 123456，收益小）

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
