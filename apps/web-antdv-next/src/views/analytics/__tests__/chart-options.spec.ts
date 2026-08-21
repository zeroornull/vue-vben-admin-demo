import { describe, expect, it } from 'vitest'

import {
  buildMonthlyVisitsOptions,
  buildSalesShareOptions,
  buildTrendOptions,
  buildVisitSourceOptions,
} from '../chart-options'
import {
  formatCount,
  monthLabels,
  salesShares,
  sortByValueAsc,
  trendHours,
  visitSources,
} from '../data'

describe('analytics data', () => {
  it('labels traffic hours from 6:00', () => {
    expect(trendHours).toHaveLength(18)
    expect(trendHours[0]).toBe('6:00')
    expect(trendHours.at(-1)).toBe('23:00')
  })

  it('labels twelve months', () => {
    expect(monthLabels).toEqual([
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ])
  })

  it('formats overview counts in zh-CN', () => {
    expect(formatCount(120_000)).toBe('120,000')
  })

  it('sorts sales shares by value', () => {
    expect(sortByValueAsc(salesShares).map((item) => item.name)).toEqual([
      '技术支持',
      '定制',
      '远程',
      '外包',
    ])
  })
})

describe('analytics chart options', () => {
  it('builds a dual line trend', () => {
    const options = buildTrendOptions()
    expect(options.series).toHaveLength(2)
    expect(options.series?.[0]).toMatchObject({ type: 'line' })
    expect(options.xAxis).toMatchObject({ data: trendHours })
  })

  it('builds monthly bars', () => {
    expect(buildMonthlyVisitsOptions().series?.[0]).toMatchObject({ type: 'bar' })
  })

  it('keeps visit source names', () => {
    const series = buildVisitSourceOptions().series?.[0]
    expect(series).toMatchObject({ type: 'pie', data: visitSources })
  })

  it('uses a rose pie for sorted sales', () => {
    const series = buildSalesShareOptions().series?.[0]
    expect(series).toMatchObject({ roseType: 'radius', type: 'pie' })
    expect(series && 'data' in series ? series.data : []).toEqual(
      sortByValueAsc(salesShares),
    )
  })
})
