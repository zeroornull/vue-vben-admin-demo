import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  CanvasRenderer,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  RadarChart,
  RadarComponent,
  TooltipComponent,
])

export { echarts }
