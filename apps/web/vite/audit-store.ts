import {
  parseAuditListQuery,
  prependAudit,
  queryAudit,
  type AuditEntry,
} from '../src/views/audit/query.ts'

const seed: AuditEntry[] = [
  {
    action: 'update',
    actor: 'vben',
    at: '2026-08-20 09:10:00',
    id: 'a-2',
    summary: '修改用户「Alice」',
    target: 'user',
  },
  {
    action: 'create',
    actor: 'admin',
    at: '2026-08-19 18:00:00',
    id: 'a-1',
    summary: '新建部门「演示」',
    target: 'dept',
  },
]

let entries: AuditEntry[] = seed.map((item) => ({ ...item }))
let nextId = 3

function nowStamp(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function listMockAudit(search: URLSearchParams) {
  return queryAudit(entries, parseAuditListQuery(search))
}

export function appendMockAudit(entry: Omit<AuditEntry, 'at' | 'id'> & { at?: string }) {
  const id = `a-${nextId}`
  nextId += 1
  entries = prependAudit(entries, {
    ...entry,
    at: entry.at ?? nowStamp(),
  }, id)
  return entries[0]
}
