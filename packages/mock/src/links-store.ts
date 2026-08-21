import {
  isLinkCodeTaken,
  parseLinkListQuery,
  queryLinks,
  validateLinkForm,
  type EmbedLink,
  type LinkFormValues,
} from '../../../apps/web/src/views/links/query.ts'

const seed: EmbedLink[] = [
  {
    code: 'docs',
    createTime: '2026-08-20 10:00:00',
    id: 'l-1',
    iframeSrc: '/embed-demo.html',
    status: 1,
    title: '演示文档',
  },
]

let links: EmbedLink[] = seed.map((item) => ({ ...item }))
let nextId = 2

function nowStamp(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function listMockLinks(search: URLSearchParams) {
  return queryLinks(links, parseLinkListQuery(search))
}

export function mockLinkName(id: string) {
  return links.find((item) => item.id === id)?.title
}

export function createMockLink(input: LinkFormValues) {
  const checked = validateLinkForm(input)
  if (!checked.ok) return { error: checked.message }
  if (isLinkCodeTaken(links, checked.value.code)) return { error: '编码已存在' }
  const link: EmbedLink = {
    createTime: nowStamp(),
    id: `l-${nextId}`,
    ...checked.value,
  }
  nextId += 1
  links = [link, ...links]
  return { link }
}

export function updateMockLink(id: string, input: LinkFormValues) {
  const current = links.find((item) => item.id === id)
  if (!current) return { error: '外链不存在' }
  const checked = validateLinkForm({ ...input, code: current.code })
  if (!checked.ok) return { error: checked.message }
  const link: EmbedLink = { ...current, ...checked.value, code: current.code }
  links = links.map((item) => (item.id === id ? link : item))
  return { link }
}

export function deleteMockLink(id: string) {
  if (!links.some((item) => item.id === id)) return { error: '外链不存在' }
  links = links.filter((item) => item.id !== id)
  return { ok: true as const }
}
