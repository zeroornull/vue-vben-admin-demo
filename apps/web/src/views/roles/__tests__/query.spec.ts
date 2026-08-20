import { describe, expect, it } from 'vitest'

import {
  filterRoles,
  isRoleCodeTaken,
  parseRoleListQuery,
  queryRoles,
  reservedRoleCodes,
  roleDeleteBlocker,
  validateRoleForm,
  batchDeleteRolesConfirmText,
} from '../query'
import type { SystemRole } from '../types'

const roles: SystemRole[] = [
  { actionCodes: [], code: 'biz-admin', createTime: '2024-01-01 00:00:00', id: 'r-1', menuCodes: ['users'], name: '业务管理员', remark: '', status: 1 },
  { actionCodes: ['user:update'], code: 'editor', createTime: '2024-01-02 00:00:00', id: 'r-2', menuCodes: ['users', 'depts'], name: '编辑', remark: '', status: 1 },
  { actionCodes: [], code: 'viewer', createTime: '2024-01-03 00:00:00', id: 'r-3', menuCodes: ['analytics'], name: '访客', remark: '', status: 0 },
]

describe('parseRoleListQuery', () => {
  it('reads code and name', () => {
    expect(parseRoleListQuery(new URLSearchParams('code=ed&name=%20编%20&status=1'))).toEqual({
      code: 'ed',
      name: '编',
      page: 1,
      pageSize: 10,
      sortField: '',
      sortOrder: '',
      status: 1,
    })
  })
})

describe('filterRoles / queryRoles', () => {
  it('filters by code fragment', () => {
    expect(filterRoles(roles, { code: 'ED', name: '', status: '' }).map((item) => item.id)).toEqual([
      'r-2',
    ])
  })

  it('paginates after filter', () => {
    expect(queryRoles(roles, { code: '', name: '', page: 2, pageSize: 2, status: '' })).toEqual({
      items: [roles[2]],
      total: 3,
    })
  })

  it('sorts then pages', () => {
    expect(
      queryRoles(roles, {
        code: '',
        name: '',
        page: 1,
        pageSize: 2,
        sortField: 'createTime',
        sortOrder: 'descend',
        status: '',
      }).items.map((item) => item.id),
    ).toEqual(['r-3', 'r-2'])
  })
})

describe('validateRoleForm', () => {
  it('rejects reserved login codes', () => {
    expect(reservedRoleCodes).toEqual(['admin', 'user'])
    expect(validateRoleForm({ actionCodes: [], code: 'Admin', menuCodes: [], name: '超管', remark: '', status: 1 })).toEqual({
      message: '编码 admin / user 留给登录权限，请换一个',
      ok: false,
    })
  })

  it('normalizes code and requires a name', () => {
    expect(validateRoleForm({ actionCodes: [], code: 'ok', menuCodes: [], name: '  ', remark: '', status: 1 }).ok).toBe(false)
    expect(
      validateRoleForm({
        actionCodes: ['user:create', 'user:create'],
        code: '  Biz-Lead  ',
        menuCodes: ['users', 'users'],
        name: '  负责人  ',
        remark: ' x ',
        status: 0,
      }),
    ).toEqual({
      ok: true,
      value: {
        actionCodes: ['user:create'],
        code: 'biz-lead',
        menuCodes: ['users'],
        name: '负责人',
        remark: 'x',
        status: 0,
      },
    })
  })

  it('rejects illegal codes and unknown menus', () => {
    expect(validateRoleForm({ actionCodes: [], code: '1bad', menuCodes: [], name: 'X', remark: '', status: 1 }).ok).toBe(false)
    expect(validateRoleForm({ actionCodes: [], code: 'Has_Underscore', menuCodes: [], name: 'X', remark: '', status: 1 }).ok).toBe(false)
    expect(validateRoleForm({ actionCodes: [], code: 'ok', menuCodes: ['nope'], name: 'X', remark: '', status: 1 })).toEqual({
      message: '含有未知菜单权限',
      ok: false,
    })
  })

  it('rejects unknown actions and grants the parent menu', () => {
    expect(
      validateRoleForm({ actionCodes: ['user:explode'], code: 'ok', menuCodes: [], name: 'X', remark: '', status: 1 }),
    ).toEqual({
      message: '含有未知操作权限',
      ok: false,
    })
    expect(
      validateRoleForm({ actionCodes: ['user:delete'], code: 'ok', menuCodes: [], name: 'X', remark: '', status: 1 }),
    ).toEqual({
      ok: true,
      value: {
        actionCodes: ['user:delete'],
        code: 'ok',
        menuCodes: ['users'],
        name: 'X',
        remark: '',
        status: 1,
      },
    })
  })
})

describe('isRoleCodeTaken / roleDeleteBlocker', () => {
  it('treats codes as unique', () => {
    expect(isRoleCodeTaken(roles, 'editor')).toBe(true)
    expect(isRoleCodeTaken(roles, 'editor', 'r-2')).toBe(false)
  })

  it('blocks delete when users still hold the role', () => {
    expect(roleDeleteBlocker(2)).toBe('请先移走拥有该角色的用户')
    expect(roleDeleteBlocker(0)).toBeNull()
    expect(batchDeleteRolesConfirmText(2)).toContain('2')
  })
})
