<script setup lang="ts">
defineOptions({ name: 'AnalyticsView' })

import { computed, ref } from 'vue'

import ChartPanel from '@/components/ChartPanel.vue'

import {
  buildMonthlyVisitsOptions,
  buildSalesShareOptions,
  buildTrendOptions,
  buildVisitChannelOptions,
  buildVisitSourceOptions,
} from './analytics/chart-options'
import { formatCount, overviewItems } from './analytics/data'
import WorkspaceCard from './workspace/WorkspaceCard.vue'

type ChartTab = 'trends' | 'visits'

const activeTab = ref<ChartTab>('trends')
const trendOptions = computed(() => buildTrendOptions())
const monthlyOptions = computed(() => buildMonthlyVisitsOptions())
const channelOptions = computed(() => buildVisitChannelOptions())
const sourceOptions = computed(() => buildVisitSourceOptions())
const salesOptions = computed(() => buildSalesShareOptions())
</script>

<template>
  <div class="analytics">
    <div class="overview">
      <article v-for="item in overviewItems" :key="item.currentLabel">
        <p>{{ item.currentLabel }}</p>
        <strong>{{ formatCount(item.current) }}</strong>
        <small>{{ item.totalLabel }} {{ formatCount(item.total) }}</small>
      </article>
    </div>

    <WorkspaceCard title="流量">
      <div class="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'trends'"
          @click="activeTab = 'trends'"
        >
          流量趋势
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'visits'"
          @click="activeTab = 'visits'"
        >
          月访问量
        </button>
      </div>
      <ChartPanel v-if="activeTab === 'trends'" :options="trendOptions" height="22rem" />
      <ChartPanel v-else :options="monthlyOptions" height="22rem" />
    </WorkspaceCard>

    <div class="charts">
      <WorkspaceCard title="访问数量">
        <ChartPanel :options="channelOptions" />
      </WorkspaceCard>
      <WorkspaceCard title="访问来源">
        <ChartPanel :options="sourceOptions" />
      </WorkspaceCard>
      <WorkspaceCard title="商业占比">
        <ChartPanel :options="salesOptions" />
      </WorkspaceCard>
    </div>
  </div>
</template>

<style scoped>
.analytics {
  display: grid;
  gap: 1rem;
}

.overview {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 720px) {
  .overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1100px) {
  .overview {
    grid-template-columns: repeat(4, 1fr);
  }
}

.overview article {
  display: grid;
  gap: 0.2rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  padding: 1rem 1.1rem;
}

.overview strong {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-heading);
}

.overview p,
.overview small {
  opacity: 0.72;
}

.tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.tabs button {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.3rem 0.85rem;
  font: inherit;
  cursor: pointer;
}

.tabs button[aria-selected='true'] {
  border-color: transparent;
  background: var(--color-heading);
  color: var(--color-background);
}

.charts {
  display: grid;
  gap: 1rem;
}

@media (min-width: 960px) {
  .charts {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
