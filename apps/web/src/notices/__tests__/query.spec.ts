import { describe, expect, it } from 'vitest'

import {
  layoutRoutePath,
  markAllNoticesRead,
  markNoticeRead,
  noticeBadge,
  noticeHref,
  noticeMatchesRoute,
  noticeTimeLabel,
  sortNotices,
  unreadCount,
} from '../query'

describe('notice href and badge', () => {
  it('keeps relative paths and drops protocol-relative or script urls', () => {
    expect(noticeHref('/users')).toBe('/users')
    expect(noticeHref('/users?status=1')).toBe('/users?status=1')
    expect(noticeHref('//evil.com')).toBeNull()
    expect(noticeHref('javascript:alert(1)')).toBeNull()
    expect(noticeHref('https://example.com')).toBeNull()
    expect(noticeMatchesRoute('/profile', 'profile')).toBe(true)
    expect(layoutRoutePath('')).toBe('/')
  })

  it('counts unread, caps the badge, and sorts newest first', () => {
    const items = [
      { body: '', createdAt: '2026-08-20T10:00:00.000Z', href: null, id: 'a', title: 'a' },
      { body: '', createdAt: '2026-08-20T12:00:00.000Z', href: null, id: 'b', title: 'b' },
    ]
    expect(unreadCount(items, [])).toBe(2)
    expect(unreadCount(items, markNoticeRead([], 'a'))).toBe(1)
    expect(unreadCount(items, markAllNoticesRead(['a'], items))).toBe(0)
    expect(noticeBadge(0)).toBe('')
    expect(noticeBadge(3)).toBe('3')
    expect(noticeBadge(12)).toBe('9+')
    expect(sortNotices(items).map((item) => item.id)).toEqual(['b', 'a'])
    expect(noticeTimeLabel('2026-08-20T12:00:00.000Z')).toBe('2026-08-20')
  })
})
