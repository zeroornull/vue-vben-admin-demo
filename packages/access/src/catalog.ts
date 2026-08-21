export type MenuCode =
  | 'workspace'
  | 'analytics'
  | 'users'
  | 'depts'
  | 'roles'
  | 'audit'
  | 'links'
  | 'about'
  | 'embed'

export type ActionCode =
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'dept:create'
  | 'dept:update'
  | 'dept:delete'
  | 'role:create'
  | 'role:update'
  | 'role:delete'
  | 'link:create'
  | 'link:update'
  | 'link:delete'

export type MenuNode = {
  code: MenuCode
  group?: string
  title: string
}

export type ActionNode = {
  code: ActionCode
  menuCode: MenuCode
  title: string
}

export const menuCatalog: MenuNode[] = [
  { code: 'workspace', title: '工作区' },
  { code: 'analytics', title: '分析' },
  { code: 'users', group: '系统', title: '用户' },
  { code: 'depts', group: '系统', title: '部门' },
  { code: 'roles', group: '系统', title: '角色' },
  { code: 'audit', group: '系统', title: '操作日志' },
  { code: 'links', group: '系统', title: '外链' },
  { code: 'about', title: '关于' },
  { code: 'embed', title: '内嵌页' },
]

export const actionCatalog: ActionNode[] = [
  { code: 'user:create', menuCode: 'users', title: '新建' },
  { code: 'user:update', menuCode: 'users', title: '编辑' },
  { code: 'user:delete', menuCode: 'users', title: '删除' },
  { code: 'dept:create', menuCode: 'depts', title: '新建' },
  { code: 'dept:update', menuCode: 'depts', title: '编辑' },
  { code: 'dept:delete', menuCode: 'depts', title: '删除' },
  { code: 'role:create', menuCode: 'roles', title: '新建' },
  { code: 'role:update', menuCode: 'roles', title: '编辑' },
  { code: 'role:delete', menuCode: 'roles', title: '删除' },
  { code: 'link:create', menuCode: 'links', title: '新建' },
  { code: 'link:update', menuCode: 'links', title: '编辑' },
  { code: 'link:delete', menuCode: 'links', title: '删除' },
]

export const allMenuCodes: MenuCode[] = menuCatalog.map((item) => item.code)
export const allActionCodes: ActionCode[] = actionCatalog.map((item) => item.code)

const menuCodeSet = new Set<string>(allMenuCodes)
const actionCodeSet = new Set<string>(allActionCodes)

export function isMenuCode(value: string): value is MenuCode {
  return menuCodeSet.has(value)
}

export function isActionCode(value: string): value is ActionCode {
  return actionCodeSet.has(value)
}

export function menuTitleByCode(code: string): string {
  return menuCatalog.find((item) => item.code === code)?.title ?? code
}

export function actionTitleByCode(code: string): string {
  return actionCatalog.find((item) => item.code === code)?.title ?? code
}

export function parentMenuOfAction(code: string): MenuCode | undefined {
  return actionCatalog.find((item) => item.code === code)?.menuCode
}

export function actionsForMenu(menuCode: string): ActionNode[] {
  return actionCatalog.filter((item) => item.menuCode === menuCode)
}

export function groupMenuCatalog(): { items: MenuNode[]; title: string | null }[] {
  const groups: { items: MenuNode[]; title: string | null }[] = []
  for (const item of menuCatalog) {
    const title = item.group ?? null
    const current = groups.at(-1)
    if (current && current.title === title) {
      current.items.push(item)
      continue
    }
    groups.push({ items: [item], title })
  }
  return groups
}

export function formatActionCodes(codes: string[]): string {
  const groups = new Map<string, string[]>()
  for (const code of codes) {
    const action = actionCatalog.find((item) => item.code === code)
    if (!action) continue
    const title = menuTitleByCode(action.menuCode)
    const list = groups.get(title) ?? []
    list.push(action.title)
    groups.set(title, list)
  }
  if (!groups.size) return '无'
  return [...groups.entries()]
    .map(([menu, acts]) => `${menu}：${acts.join('/')}`)
    .join('；')
}

/** 种子角色的默认菜单；新建角色从空勾选开始 */
export function seedMenuCodes(roleCode: string): MenuCode[] {
  if (roleCode === 'biz-admin') return [...allMenuCodes]
  if (roleCode === 'editor') return ['workspace', 'analytics', 'users', 'depts', 'embed']
  if (roleCode === 'viewer') return ['workspace', 'analytics', 'embed']
  return []
}

/** 业务管理员全按钮；编辑不能删、不能管角色；访客只有看 */
export function seedActionCodes(roleCode: string): ActionCode[] {
  if (roleCode === 'biz-admin') return [...allActionCodes]
  if (roleCode === 'editor') {
    return ['user:create', 'user:update', 'dept:create', 'dept:update']
  }
  return []
}
