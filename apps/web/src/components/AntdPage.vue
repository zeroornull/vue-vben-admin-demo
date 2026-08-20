<script setup lang="ts">
import 'ant-design-vue/dist/reset.css'
import { computed } from 'vue'
import { ConfigProvider, theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

import { useTheme } from '@/preferences/use-theme'

const { resolved } = useTheme()
const algorithm = computed(() =>
  resolved.value === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
)
</script>

<template>
  <ConfigProvider :locale="zhCN" :theme="{ algorithm }">
    <div class="antd-page">
      <slot />
    </div>
  </ConfigProvider>
</template>

<style scoped>
.antd-page {
  display: grid;
  gap: 1rem;
}
</style>
