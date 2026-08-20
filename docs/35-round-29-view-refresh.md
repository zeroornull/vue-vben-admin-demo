# 35 · 第 29 轮：刷新当前页

日期：2026-08-20。

## 本轮结论

顶栏加了「刷新」。只拆掉当前页的 KeepAlive 实例再挂一次。页签还在，别的页缓存不动。用户页改过筛选，点刷新后筛选回到初始，列表会再请求。

这不是 `location.reload()`，也不是 F5。壳、token、主题、水印开关都还在。全屏时右上角也有「刷新」。

不要上页签右键菜单。登录页 Form、改密仍不做。

## 依赖清单（先列再决定）

| 旧仓依赖 | 决定 |
| --- | --- |
| 页签右键「刷新」 | **否**。顶栏一颗按钮够用 |
| `window.location.reload` | **否**。那是整站重载 |
| 新 npm 包 | **零** |

## 关键文件

```text
apps/web/src/layouts/view-refresh.ts
apps/web/src/layouts/BasicLayout.vue
```

做法：

1. 把当前 `meta.viewName` 临时移出 `KeepAlive` 的 `include`，否则同名实例会留在缓存里
2. 把 `:key` 从 `users:0` 改成 `users:1`，强迫出一份新 vnode
3. `nextTick` 后再把名字放回 `include`，之后切走再切回仍会缓存

## 怎么验收

```bash
bun run dev
```

1. 打开用户，写点筛选，切到部门再回来：筛选还在
2. 再点「刷新」：筛选没了，页签还在
3. 部门页的状态不应被这次刷新清掉
4. F5：页签还在，所有页的内存状态都没了（和以前一样）
5. 全屏时右上角也能刷新

```bash
bun run lint
bun run test
bun run typecheck
bun run build
```

## 学习笔记

- KeepAlive 认的是组件 `name`。只改 `key` 不改 `include`，旧实例可能还占着坑，越刷越多。
- `include` 要先拿掉再改 key，等渲染过一轮再放回去。同一轮里又拿又放，等于没拿。
- 路由 `name` 当 key 是为了查询变化共用实例。刷新需要第二个数字（epoch），两者不要搅在一起。
- 浏览器刷新和应用刷新是两层。用户说「刷新」时要问清楚是哪一种。

## 下一轮从哪里开始

第 30 轮做了请求错误条，见 [36-round-30-error-toast.md](./36-round-30-error-toast.md)。

不要把 `@core`、五套皮肤、VitePress、Turbo 或 Vue 3.6 默认栈搬进来。
