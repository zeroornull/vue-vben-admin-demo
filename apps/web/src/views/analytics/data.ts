import type { NamedValue, OverviewItem } from './types'

export const overviewItems: OverviewItem[] = [
  { current: 2000, currentLabel: '用户量', total: 120_000, totalLabel: '总用户量' },
  { current: 20_000, currentLabel: '访问量', total: 500_000, totalLabel: '总访问量' },
  { current: 8000, currentLabel: '下载量', total: 120_000, totalLabel: '总下载量' },
  { current: 5000, currentLabel: '使用量', total: 50_000, totalLabel: '总使用量' },
]

export const trendHours = Array.from({ length: 18 }, (_, index) => `${index + 6}:00`)

export const trendPrimary = [
  111, 2000, 6000, 16_000, 33_333, 55_555, 64_000, 33_333, 18_000, 36_000, 70_000,
  42_444, 23_222, 13_000, 8000, 4000, 1200, 333,
]

export const trendSecondary = [
  33, 66, 88, 333, 3333, 6200, 20_000, 3000, 1200, 13_000, 22_000, 11_000, 2221, 1201,
  390, 198, 60, 30,
]

export const monthLabels = Array.from({ length: 12 }, (_, index) => `${index + 1}月`)

export const monthlyVisits = [
  3000, 2000, 3333, 5000, 3200, 4200, 3200, 2100, 3000, 5100, 6000, 3200,
]

export const visitChannels = {
  current: [90, 50, 86, 40, 50, 20],
  indicators: ['网页', '移动端', 'Ipad', '客户端', '第三方', '其它'],
  trend: [70, 75, 70, 76, 20, 85],
}

export const visitSources: NamedValue[] = [
  { name: '搜索引擎', value: 1048 },
  { name: '直接访问', value: 735 },
  { name: '邮件营销', value: 580 },
  { name: '联盟广告', value: 484 },
]

export const salesShares: NamedValue[] = [
  { name: '外包', value: 500 },
  { name: '定制', value: 310 },
  { name: '技术支持', value: 274 },
  { name: '远程', value: 400 },
]

export function formatCount(value: number): string {
  return value.toLocaleString('zh-CN')
}

export function sortByValueAsc(items: NamedValue[]): NamedValue[] {
  return [...items].sort((a, b) => a.value - b.value)
}
