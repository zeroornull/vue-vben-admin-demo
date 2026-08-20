import { del, get, post, put } from '@/api/request'
import type { EmbedLink, LinkFormValues, LinkListQuery, LinkListResult } from '@/views/links/query'

export function getLinkList(params: LinkListQuery) {
  return get<LinkListResult>('/system/link/list', { params })
}

export function createLink(data: LinkFormValues) {
  return post<EmbedLink>('/system/link', data)
}

export function updateLink(id: string, data: LinkFormValues) {
  return put<EmbedLink>(`/system/link/${id}`, data)
}

export function deleteLink(id: string) {
  return del<null>(`/system/link/${id}`)
}
