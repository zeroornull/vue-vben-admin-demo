<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { EChartsType } from 'echarts/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { echarts } from '@/lib/echarts'
import { useTheme } from '@/preferences/use-theme'

const props = withDefaults(
  defineProps<{
    height?: string
    options: EChartsOption
  }>(),
  { height: '18rem' },
)

const { resolved } = useTheme()
const el = ref<HTMLDivElement>()
let chart: EChartsType | null = null
let observer: ResizeObserver | null = null

function chartTheme(): string | undefined {
  return resolved.value === 'dark' ? 'dark' : undefined
}

function render() {
  if (!el.value) return
  if (!chart) {
    chart = echarts.init(el.value, chartTheme())
  }
  chart.setOption(props.options, true)
}

function remount() {
  chart?.dispose()
  chart = null
  render()
}

function resize() {
  chart?.resize()
}

onMounted(() => {
  render()
  observer = new ResizeObserver(resize)
  if (el.value) observer.observe(el.value)
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  observer?.disconnect()
  observer = null
  chart?.dispose()
  chart = null
})

watch(() => props.options, render, { deep: true })
watch(resolved, remount)
</script>

<template>
  <div ref="el" class="chart" :style="{ height }" />
</template>

<style scoped>
.chart {
  width: 100%;
}
</style>
