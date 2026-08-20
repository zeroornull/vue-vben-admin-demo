import type { AxiosRequestConfig } from 'axios'

import { del, get, post, put } from '@/api/request'
import type { BatchDeleteResult } from '@/tables/batch'
import type { EmbedLink, LinkFormValues, LinkListQuery, LinkListResult } from '@/views/links/query'

export function getLinkList(params: LinkListQuery) {
  return get<LinkListResult>('/system/link/list', { params })
}

export function createLink(data: LinkFormValues, config?: AxiosRequestConfig) {
  return post<EmbedLink>('/system/link', data, config)
}

export function updateLink(id: string, data: LinkFormValues) {
  return put<EmbedLink>(`/system/link/${id}`, data)
}

export function deleteLink(id: string) {
  return del<null>(`/system/link/${id}`)
}

export function deleteLinks(ids: string[]) {
  return post<BatchDeleteResult>('/system/link/batch-delete', { ids })
}
