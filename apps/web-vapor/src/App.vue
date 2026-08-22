<script setup lang="ts" vapor>
import { computed } from 'vue'

import { sparkBars, totalOf, WEEK_VISITS } from '@/workspace/query.ts'

const bars = computed(() => sparkBars(WEEK_VISITS))
const total = computed(() => totalOf(WEEK_VISITS))
</script>

<template>
  <main class="page">
    <p class="kicker">Vue 3.6 · Vapor 实验</p>
    <h1>工作区</h1>
    <p class="lead">这一页没有 UI 库。默认皮肤仍是 Vue 3.5 + ant-design-vue。</p>

    <section class="card">
      <header>
        <h2>本周访问</h2>
        <strong>{{ total }}</strong>
      </header>
      <ul class="bars">
        <li v-for="(bar, index) in bars" :key="index">
          <span class="bar" :style="{ height: `${bar.percent}%` }" />
          <span class="label">{{ bar.value }}</span>
        </li>
      </ul>
    </section>
  </main>
</template>
