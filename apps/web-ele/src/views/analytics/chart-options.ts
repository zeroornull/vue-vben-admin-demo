import type { EChartsOption } from 'echarts'

import {
  monthLabels,
  monthlyVisits,
  salesShares,
  sortByValueAsc,
  trendHours,
  trendPrimary,
  trendSecondary,
  visitChannels,
  visitSources,
} from './data'

const palette = ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9']

export function buildTrendOptions(): EChartsOption {
  return {
    grid: { bottom: 8, containLabel: true, left: 8, right: 8, top: 16 },
    series: [
      {
        areaStyle: {},
        data: trendPrimary,
        itemStyle: { color: '#5ab1ef' },
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: {},
        data: trendSecondary,
        itemStyle: { color: '#019680' },
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: { trigger: 'axis' },
    xAxis: {
      boundaryGap: false,
      data: trendHours,
      type: 'category',
    },
    yAxis: { max: 80_000, splitNumber: 4, type: 'value' },
  }
}

export function buildMonthlyVisitsOptions(): EChartsOption {
  return {
    grid: { bottom: 8, containLabel: true, left: 8, right: 8, top: 16 },
    series: [{ barMaxWidth: 48, data: monthlyVisits, type: 'bar' }],
    tooltip: { trigger: 'axis' },
    xAxis: { data: monthLabels, type: 'category' },
    yAxis: { max: 8000, splitNumber: 4, type: 'value' },
  }
}

export function buildVisitChannelOptions(): EChartsOption {
  return {
    legend: { bottom: 0, data: ['访问', '趋势'] },
    radar: {
      indicator: visitChannels.indicators.map((name) => ({ name })),
      radius: '60%',
      splitNumber: 8,
    },
    series: [
      {
        data: [
          { name: '访问', value: visitChannels.current },
          { name: '趋势', value: visitChannels.trend },
        ],
        symbolSize: 0,
        type: 'radar',
      },
    ],
    tooltip: {},
  }
}

export function buildVisitSourceOptions(): EChartsOption {
  return {
    legend: { bottom: '2%', left: 'center' },
    series: [
      {
        color: palette,
        data: visitSources,
        name: '访问来源',
        radius: ['40%', '65%'],
        type: 'pie',
      },
    ],
    tooltip: { trigger: 'item' },
  }
}

export function buildSalesShareOptions(): EChartsOption {
  return {
    series: [
      {
        center: ['50%', '50%'],
        color: palette,
        data: sortByValueAsc(salesShares),
        name: '商业占比',
        radius: '80%',
        roseType: 'radius',
        type: 'pie',
      },
    ],
    tooltip: { trigger: 'item' },
  }
}
