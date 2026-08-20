<script setup lang="ts">
import 'ant-design-vue/dist/reset.css'
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<template>
  <ConfigProvider :locale="zhCN">
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
