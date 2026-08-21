import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 不登录也可访问（登录页、404） */
    public?: boolean
    /** 前端角色；缺省表示登录即可 */
    roles?: string[]
    /** 侧栏 / 页签 / 浏览器标签标题；不设则不进菜单 */
    title?: string
    /** 显式不进侧栏 */
    hideInMenu?: boolean
    /** 菜单排序，越小越靠前 */
    order?: number
    /** 侧栏分组标题；相同值收成一组 */
    group?: string
    /** 业务角色可勾选的菜单码；不设表示登录即可（工作台） */
    menuCode?: string
    /** KeepAlive 用的组件 name，必须和 defineOptions 一致 */
    viewName?: string
    /** 页签不可关闭（工作台） */
    affixTab?: boolean
    /** 侧栏图标登记名，见 menuIcons；不是 Iconify 任意 id */
    icon?: string
    /** iframe 地址；只认 http(s) 或同源路径，见 safeIframeSrc */
    iframeSrc?: string
  }
}
