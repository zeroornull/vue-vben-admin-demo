import { describe, expect, it } from 'vitest'

import {
  auditSummary,
  matchesAuditAt,
  parseAuditListQuery,
  prependAudit,
  queryAudit,
  type AuditEntry,
} from '../query'

const row = (
  id: string,
  extra: Partial<AuditEntry> = {},
): AuditEntry => ({
  action: 'create',
  actor: 'vben',
  at: '2026-08-20 10:00:00',
  id,
  summary: '新建用户「Ada」',
  target: 'user',
  ...extra,
})

describe('audit query', () => {
  it('builds the summary and keeps only the newest 100 rows', () => {
    expect(auditSummary('delete', 'role', ' 编辑 ')).toBe('删除角色「编辑」')
    const next = prependAudit([row('a-1')], {
      action: 'update',
      actor: 'admin',
      at: '2026-08-20 11:00:00',
      summary: auditSummary('update', 'dept', '研发'),
      target: 'dept',
    }, 'a-2')
    expect(next[0]?.id).toBe('a-2')
    expect(prependAudit(Array.from({ length: 100 }, (_, i) => row(`old-${i}`)), {
      action: 'create',
      actor: 'vben',
      at: 'now',
      summary: 'x',
      target: 'user',
    }, 'new').map((item) => item.id)).toHaveLength(100)
    expect(prependAudit(Array.from({ length: 100 }, (_, i) => row(`old-${i}`)), {
      action: 'create',
      actor: 'vben',
      at: 'now',
      summary: 'x',
      target: 'user',
    }, 'new')[0]?.id).toBe('new')
  })

  it('filters by actor and target, then pages', () => {
    const items = [
      row('1', { actor: 'vben', target: 'user' }),
      row('2', { actor: 'admin', target: 'dept' }),
      row('3', { actor: 'vben', target: 'role' }),
    ]
    const search = new URLSearchParams('actor=vb&target=user&page=1&pageSize=10')
    expect(parseAuditListQuery(search)).toEqual({
      actor: 'vb',
      from: '',
      page: 1,
      pageSize: 10,
      sortField: '',
      sortOrder: '',
      target: 'user',
      to: '',
    })
    expect(queryAudit(items, parseAuditListQuery(search)).items.map((item) => item.id)).toEqual(['1'])
  })

  it('filters by calendar day and sorts the remaining rows', () => {
    expect(matchesAuditAt('2026-08-19 18:00:00', '2026-08-20', '')).toBe(false)
    expect(matchesAuditAt('2026-08-20 09:10:00', '2026-08-20', '2026-08-20')).toBe(true)
    expect(matchesAuditAt('2026-08-20 09:10:00', '2026-08-21', '2026-08-19')).toBe(true)
    const items = [
      row('1', { at: '2026-08-19 18:00:00', actor: 'admin' }),
      row('2', { at: '2026-08-20 09:10:00', actor: 'vben' }),
      row('3', { at: '2026-08-21 08:00:00', actor: 'ada' }),
    ]
    const search = new URLSearchParams(
      'from=2026-08-19&to=2026-08-20&sortField=actor&sortOrder=ascend&page=1&pageSize=10',
    )
    expect(parseAuditListQuery(search)).toMatchObject({
      from: '2026-08-19',
      sortField: 'actor',
      sortOrder: 'ascend',
      to: '2026-08-20',
    })
    expect(queryAudit(items, parseAuditListQuery(search)).items.map((item) => item.id)).toEqual(['1', '2'])
  })
})
