import { describe, expect, it } from 'vitest'

import { linkCsvRow, linksToCsv, parseLinkCsv } from '../csv'
import type { EmbedLink } from '../query'

const docs: EmbedLink = {
  code: 'docs',
  createTime: '2026-08-20 10:00:00',
  id: 'l-1',
  iframeSrc: '/embed-demo.html',
  status: 1,
  title: '演示, 文档',
}

describe('linksToCsv', () => {
  it('adds a BOM and quotes commas in the title', () => {
    const csv = linksToCsv([linkCsvRow(docs)])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('名称,编码,地址,状态,创建时间')
    expect(csv).toContain('"演示, 文档",docs,/embed-demo.html,启用,2026-08-20 10:00:00')
  })
})

describe('parseLinkCsv', () => {
  it('round-trips an exported row', () => {
    const result = parseLinkCsv(linksToCsv([linkCsvRow(docs)]))
    expect(result.rejected).toEqual([])
    expect(result.accepted[0]?.value).toEqual({
      code: 'docs',
      iframeSrc: '/embed-demo.html',
      status: 1,
      title: '演示, 文档',
    })
  })

  it('rejects reserved codes, bad urls, and bad headers', () => {
    expect(parseLinkCsv('').rejected[0]?.message).toBe('文件是空的')
    expect(parseLinkCsv('a,b\n1,2').rejected[0]?.message).toBe('表头必须是导出时的那一行')
    expect(
      parseLinkCsv(linksToCsv([linkCsvRow({ ...docs, code: 'users' })])).rejected[0]?.message,
    ).toBe('编码和现有路由或菜单冲突，请换一个')
    expect(
      parseLinkCsv(linksToCsv([linkCsvRow({ ...docs, iframeSrc: 'javascript:alert(1)' })])).rejected[0]
        ?.message,
    ).toBe('地址只认站内路径或 http(s)，不要带账号密码')
  })
})
