import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 不登录也可访问（登录页、404） */
    public?: boolean
    /** 前端角色；缺省表示登录即可 */
    roles?: string[]
    /** 侧栏标题；不设则不进菜单 */
    title?: string
    /** 显式不进侧栏 */
    hideInMenu?: boolean
    /** 菜单排序，越小越靠前 */
    order?: number
  }
}
