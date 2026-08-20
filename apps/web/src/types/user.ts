export interface UserInfo {
  /** 按钮级操作码，如 user:create */
  actionCodes: string[]
  homePath: string
  /** 业务角色勾选的菜单码，决定侧栏和 addRoute */
  menuCodes: string[]
  realName: string
  /** 登录账号映射到的业务角色编码 */
  roleCodes: string[]
  /** 登录权限：admin / user，只管 meta.roles */
  roles: string[]
  userId: string
  username: string
}
