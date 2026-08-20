import { noticeHref, sortNotices, type Notice, type NoticeInbox } from '../src/notices/query.ts'

const ITEMS: Notice[] = [
  {
    body: '外观里可以切侧栏 / 顶栏。窄屏仍是抽屉。',
    createdAt: '2026-08-20T12:00:00.000Z',
    href: noticeHref('/'),
    id: 'n-layout',
    title: '可以切顶栏导航',
  },
  {
    body: '筛选结果会一起带走。没有用户菜单权限的账号点了不会跳转。',
    createdAt: '2026-08-20T11:00:00.000Z',
    href: noticeHref('/users'),
    id: 'n-users',
    title: '用户表可以导出 CSV',
  },
  {
    body: '个人中心可以改显示名。',
    createdAt: '2026-08-20T10:00:00.000Z',
    href: noticeHref('/profile'),
    id: 'n-welcome',
    title: '欢迎使用 Vue Admin',
  },
]

const readByUser = new Map<string, Set<string>>()

export function listMockNotices(username: string): NoticeInbox {
  return {
    items: sortNotices(ITEMS),
    readIds: [...(readByUser.get(username) ?? [])],
  }
}

export function markMockNoticeRead(username: string, id?: string): NoticeInbox {
  const known = new Set(ITEMS.map((item) => item.id))
  const read = readByUser.get(username) ?? new Set<string>()
  if (id) {
    if (known.has(id)) read.add(id)
  } else {
    for (const item of ITEMS) read.add(item.id)
  }
  readByUser.set(username, read)
  return listMockNotices(username)
}
