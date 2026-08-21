import { describe, expect, it } from 'vitest'

import { formatActionCodes } from '@app/access/catalog'
import { parseActionLabels, parseMenuLabels, parseRoleCsv, roleCsvRow, rolesToCsv } from '../csv'
import type { SystemRole } from '../types'

const editor: SystemRole = {
  actionCodes: ['user:update'],
  code: 'editor',
  createTime: '2024-01-03 10:00:00',
  id: 'r-2',
  menuCodes: ['users'],
  name: '编辑',
  remark: '系统, 备注',
  status: 1,
}

describe('rolesToCsv', () => {
  it('adds a BOM and keeps labeled rows', () => {
    const csv = rolesToCsv([roleCsvRow(editor, '用户', '用户：编辑')])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('角色名称,编码,菜单,操作权限,状态,备注,创建时间')
    expect(csv).toContain('编辑,editor,用户,用户：编辑,启用,"系统, 备注",2024-01-03 10:00:00')
  })
})

describe('parseRoleCsv', () => {
  it('round-trips an exported row and reads 无', () => {
    const csv = rolesToCsv([roleCsvRow(editor, '用户', formatActionCodes(editor.actionCodes))])
    const result = parseRoleCsv(csv)
    expect(result.rejected).toEqual([])
    expect(result.accepted[0]?.value).toEqual({
      actionCodes: ['user:update'],
      code: 'editor',
      menuCodes: ['users'],
      name: '编辑',
      remark: '系统, 备注',
      status: 1,
    })
    const empty = rolesToCsv([roleCsvRow({ ...editor, code: 'ops', name: '运维', actionCodes: [], menuCodes: [] }, '无', '无')])
    expect(parseRoleCsv(empty).accepted[0]?.value).toMatchObject({
      actionCodes: [],
      code: 'ops',
      menuCodes: [],
    })
  })

  it('rejects unknown labels, reserved codes, and bad headers', () => {
    expect(parseMenuLabels('幽灵')).toEqual({ ok: false, message: '没有菜单「幽灵」' })
    expect(parseActionLabels('用户：爆炸')).toEqual({
      ok: false,
      message: '菜单「用户」没有操作「爆炸」',
    })
    expect(parseRoleCsv('').rejected[0]?.message).toBe('文件是空的')
    expect(parseRoleCsv('a,b\n1,2').rejected[0]?.message).toBe('表头必须是导出时的那一行')
    const reserved = rolesToCsv([roleCsvRow({ ...editor, code: 'admin', name: '超管' }, '无', '无')])
    expect(parseRoleCsv(reserved).rejected[0]?.message).toBe('编码 admin / user 留给登录权限，请换一个')
  })
})
