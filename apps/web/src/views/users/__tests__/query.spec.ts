import { describe, expect, it } from 'vitest'

import {
  batchDeleteConfirmText,
  countUsersInDept,
  countUsersInRole,
  filterUsers,
  isUserNameTaken,
  matchesDeptScope,
  matchesRole,
  nextPageAfterDeletes,
  normalizeUserIds,
  paginateList,
  parseUserListQuery,
  queryUsers,
  validateUserForm,
} from '../query'
import type { SystemUser } from '../types'

const users: SystemUser[] = [
  { createTime: '2024-01-01 00:00:00', deptId: 'd-1', id: '1', name: 'Alice', remark: '', roleIds: ['r-1'], status: 1 },
  { createTime: '2024-01-02 00:00:00', deptId: 'd-2', id: '2', name: 'Bob', remark: '', roleIds: ['r-2'], status: 0 },
  { createTime: '2024-01-03 00:00:00', deptId: null, id: '3', name: 'alice-admin', remark: '', roleIds: [], status: 1 },
]

describe('parseUserListQuery', () => {
  it('falls back to page 1 and size 10', () => {
    expect(parseUserListQuery(new URLSearchParams())).toEqual({
      deptId: '',
      name: '',
      page: 1,
      pageSize: 10,
      roleId: '',
      status: '',
    })
  })

  it('clamps page size and reads status', () => {
    const search = new URLSearchParams('page=0&pageSize=500&name=%20Bob%20&status=0&deptId=d-4')
    expect(parseUserListQuery(search)).toEqual({
      deptId: 'd-4',
      name: 'Bob',
      page: 1,
      pageSize: 100,
      roleId: '',
      status: 0,
    })
  })
})

describe('filterUsers', () => {
  it('matches name case-insensitively', () => {
    expect(filterUsers(users, { deptId: '', name: 'ALI', roleId: '', status: '' }).map((item) => item.id)).toEqual([
      '1',
      '3',
    ])
  })

  it('filters by status', () => {
    expect(filterUsers(users, { deptId: '', name: '', roleId: '', status: 0 }).map((item) => item.id)).toEqual(['2'])
  })

  it('filters a dept and its descendants', () => {
    expect(
      filterUsers(users, { deptId: 'd-1', name: '', roleId: '', status: '' }, ['d-2']).map((item) => item.id),
    ).toEqual(['1', '2'])
  })

  it('filters by role', () => {
    expect(filterUsers(users, { deptId: '', name: '', roleId: 'r-2', status: '' }).map((item) => item.id)).toEqual([
      '2',
    ])
  })
})

describe('matchesDeptScope / countUsersInDept', () => {
  it('treats empty selection as all, and unassigned as out of scope', () => {
    expect(matchesDeptScope(null, '')).toBe(true)
    expect(matchesDeptScope(null, 'd-1')).toBe(false)
    expect(matchesDeptScope('d-2', 'd-1', ['d-2'])).toBe(true)
  })

  it('counts only the exact department', () => {
    expect(countUsersInDept(users, 'd-1')).toBe(1)
    expect(countUsersInDept(users, 'missing')).toBe(0)
    expect(matchesRole(['r-1'], '')).toBe(true)
    expect(matchesRole(['r-1'], 'r-2')).toBe(false)
    expect(countUsersInRole(users, 'r-1')).toBe(1)
  })
})

describe('paginateList / queryUsers', () => {
  it('slices the current page', () => {
    expect(paginateList(['a', 'b', 'c'], 2, 2)).toEqual({
      items: ['c'],
      page: 2,
      pageSize: 2,
      total: 3,
    })
  })

  it('filters then paginates', () => {
    expect(queryUsers(users, { deptId: '', name: 'a', page: 1, pageSize: 1, roleId: '', status: 1 })).toEqual({
      items: [users[0]],
      total: 2,
    })
  })
})

describe('validateUserForm', () => {
  it('requires a trimmed name', () => {
    expect(validateUserForm({ deptId: null, name: '  ', remark: 'x', roleIds: [], status: 1 })).toEqual({
      message: '请输入用户名',
      ok: false,
    })
  })

  it('rejects long names and normalizes the rest', () => {
    expect(validateUserForm({ deptId: null, name: 'a'.repeat(33), remark: '', roleIds: [], status: 1 }).ok).toBe(false)
    expect(
      validateUserForm({ deptId: 'd-4', name: '  Pat  ', remark: '  hi  ', roleIds: ['r-2', 'r-2'], status: 0 }),
    ).toEqual({
      ok: true,
      value: { deptId: 'd-4', name: 'Pat', remark: 'hi', roleIds: ['r-2'], status: 0 },
    })
  })
})

describe('isUserNameTaken', () => {
  it('ignores the current row when editing', () => {
    expect(isUserNameTaken(users, 'Alice')).toBe(true)
    expect(isUserNameTaken(users, 'Alice', '1')).toBe(false)
  })
})

describe('normalizeUserIds / nextPageAfterDeletes', () => {
  it('dedupes ids and steps back when the page is emptied', () => {
    expect(normalizeUserIds(['u-1', ' u-1 ', '', 'u-2'])).toEqual(['u-1', 'u-2'])
    expect(batchDeleteConfirmText(3)).toContain('3')
    expect(nextPageAfterDeletes(2, 1, 1)).toBe(1)
    expect(nextPageAfterDeletes(2, 3, 1)).toBe(2)
    expect(nextPageAfterDeletes(1, 1, 1)).toBe(1)
  })
})
