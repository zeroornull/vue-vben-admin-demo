import { allMenuCodes } from '../../access/catalog'
import { BATCH_DELETE_MAX, batchDeleteConfirmText } from '../../tables/batch'
import { parseSortParams, sortListByQuery, TABLE_SORT_FIELDS } from '../../tables/sort'
import { safeIframeSrc } from '../iframe/src'

export type EmbedLink = {
  code: string
  createTime: string
  id: string
  iframeSrc: string
  status: 0 | 1
  title: string
}

export type LinkFormValues = {
  code: string
  iframeSrc: string
  status: 0 | 1
  title: string
}

export type LinkListQuery = {
  code: string
  name: string
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: string
  status: 0 | 1 | ''
}

export type LinkListResult = {
  items: EmbedLink[]
  total: number
}

export type FormValidation =
  | { message: string; ok: false }
  | { ok: true; value: LinkFormValues }

const codePattern = /^[a-z][a-z0-9-]{1,31}$/

export const reservedLinkCodes = [
  ...allMenuCodes,
  'embed-link',
  'forbidden',
  'home',
  'login',
  'not-found',
  'profile',
  'root',
] as const

export function emptyLinkForm(): LinkFormValues {
  return { code: '', iframeSrc: '/embed-demo.html', status: 1, title: '' }
}

export function formFromLink(link: EmbedLink): LinkFormValues {
  return {
    code: link.code,
    iframeSrc: link.iframeSrc,
    status: link.status,
    title: link.title,
  }
}

export function isReservedLinkCode(code: string): boolean {
  return (reservedLinkCodes as readonly string[]).includes(code)
}

export function isLinkCodeTaken(list: EmbedLink[], code: string, exceptId?: string): boolean {
  return list.some((item) => item.code === code && item.id !== exceptId)
}

export function validateLinkForm(values: LinkFormValues): FormValidation {
  const title = values.title.trim()
  const code = values.code.trim().toLowerCase()
  const iframeSrc = safeIframeSrc(values.iframeSrc)
  if (!title) return { message: '请输入名称', ok: false }
  if (title.length > 16) return { message: '名称最多 16 个字', ok: false }
  if (!codePattern.test(code)) {
    return { message: '编码以小写字母开头，只含小写字母、数字和连字符', ok: false }
  }
  if (isReservedLinkCode(code)) {
    return { message: '编码和现有路由或菜单冲突，请换一个', ok: false }
  }
  if (!iframeSrc) return { message: '地址只认站内路径或 http(s)，不要带账号密码', ok: false }
  return {
    ok: true,
    value: {
      code,
      iframeSrc,
      status: values.status === 0 ? 0 : 1,
      title,
    },
  }
}

export function parseLinkListQuery(search: URLSearchParams): LinkListQuery {
  const page = Math.max(1, Number.parseInt(search.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(search.get('pageSize') ?? '10', 10) || 10),
  )
  const name = (search.get('name') ?? '').trim()
  const code = (search.get('code') ?? '').trim()
  const statusRaw = search.get('status')
  const status = statusRaw === '0' || statusRaw === '1' ? (Number(statusRaw) as 0 | 1) : ''
  return { code, name, page, pageSize, status, ...parseSortParams(search, TABLE_SORT_FIELDS.links) }
}

export function queryLinks(items: EmbedLink[], query: LinkListQuery): LinkListResult {
  const name = query.name.toLowerCase()
  const code = query.code.toLowerCase()
  const filtered = items.filter((item) => {
    if (name && !item.title.toLowerCase().includes(name)) return false
    if (code && !item.code.toLowerCase().includes(code)) return false
    if (query.status !== '' && item.status !== query.status) return false
    return true
  })
  const sorted = sortListByQuery(filtered, query, TABLE_SORT_FIELDS.links)
  const start = (query.page - 1) * query.pageSize
  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
  }
}

export function extraLinkMenuItems(
  links: EmbedLink[],
  hasEmbed: boolean,
): { icon: string; name: string; order: number; path: string; title: string }[] {
  if (!hasEmbed) return []
  return links
    .filter((item) => item.status === 1)
    .map((item, index) => ({
      icon: 'embed',
      name: 'embed-link',
      order: 9.1 + index * 0.01,
      path: `/embed/${item.code}`,
      title: item.title,
    }))
}

export function linkTitleFor(links: EmbedLink[], code: string): string {
  return links.find((item) => item.code === code && item.status === 1)?.title ?? ''
}

export const LINK_BATCH_DELETE_MAX = BATCH_DELETE_MAX

export function batchDeleteLinksConfirmText(count: number): string {
  return batchDeleteConfirmText(count, '条外链')
}

export function linkSrcFor(links: EmbedLink[], code: string): string | null {
  const item = links.find((row) => row.code === code)
  if (!item || item.status !== 1) return null
  return safeIframeSrc(item.iframeSrc)
}
