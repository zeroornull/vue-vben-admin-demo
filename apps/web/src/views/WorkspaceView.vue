<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'

import {
  projectItems,
  quickNavItems,
  todoItems as initialTodos,
  trendItems,
  visitSourceItems,
} from './workspace/data'
import { openWorkbenchUrl } from './workspace/open-url'
import type { WorkbenchProjectItem, WorkbenchQuickNavItem } from './workspace/types'
import WorkspaceCard from './workspace/WorkspaceCard.vue'
import WorkspaceHeader from './workspace/WorkspaceHeader.vue'

const router = useRouter()
const { userInfo } = storeToRefs(useAuthStore())
const todos = ref(initialTodos.map((item) => ({ ...item })))

const visibleQuickNav = computed(() => {
  const roles = userInfo.value?.roles ?? []
  return quickNavItems.filter(
    (item) => !item.roles?.length || item.roles.some((role) => roles.includes(role)),
  )
})

const todoDone = computed(() => todos.value.filter((item) => item.completed).length)
const visitTotal = computed(() =>
  visitSourceItems.reduce((sum, item) => sum + item.value, 0),
)

function navTo(item: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  openWorkbenchUrl(router, item.url)
}
</script>

<template>
  <div class="workspace">
    <WorkspaceHeader
      :description="'今日晴，20℃ - 32℃。数据是静态示例，尚未接接口。'"
      :real-name="userInfo?.realName ?? '同事'"
      :todo-done="todoDone"
      :todo-total="todos.length"
    />

    <div class="columns">
      <div class="primary">
        <WorkspaceCard title="项目">
          <div class="projects">
            <button
              v-for="item in projectItems"
              :key="item.title"
              type="button"
              @click="navTo(item)"
            >
              <span class="mark" :style="{ background: item.color }">{{ item.mark }}</span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.content }}</p>
              <small>{{ item.group }} · {{ item.date }}</small>
            </button>
          </div>
        </WorkspaceCard>

        <WorkspaceCard title="最新动态">
          <ul class="list">
            <li v-for="item in trendItems" :key="`${item.title}-${item.date}`">
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.content }}</p>
              </div>
              <time>{{ item.date }}</time>
            </li>
          </ul>
        </WorkspaceCard>
      </div>

      <div class="side">
        <WorkspaceCard title="快捷导航">
          <div class="nav">
            <button
              v-for="item in visibleQuickNav"
              :key="item.title"
              type="button"
              @click="navTo(item)"
            >
              <span class="mark" :style="{ background: item.color }">{{ item.mark }}</span>
              {{ item.title }}
            </button>
          </div>
        </WorkspaceCard>

        <WorkspaceCard title="待办事项">
          <ul class="todos">
            <li v-for="item in todos" :key="item.title" :class="{ done: item.completed }">
              <label>
                <input v-model="item.completed" type="checkbox" />
                <span>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.content }}</p>
                </span>
              </label>
              <time>{{ item.date }}</time>
            </li>
          </ul>
        </WorkspaceCard>

        <WorkspaceCard title="访问来源">
          <p class="hint">旧仓这里是 ECharts 饼图。本轮用数字列表占位，不引入图表依赖。</p>
          <ul class="sources">
            <li v-for="item in visitSourceItems" :key="item.name">
              <span>{{ item.name }}</span>
              <strong>{{ item.value }}</strong>
              <small>{{ Math.round((item.value / visitTotal) * 100) }}%</small>
            </li>
          </ul>
        </WorkspaceCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workspace {
  display: grid;
  gap: 1rem;
}

.columns {
  display: grid;
  gap: 1rem;
}

@media (min-width: 960px) {
  .columns {
    grid-template-columns: 1.4fr 1fr;
    align-items: start;
  }
}

.primary,
.side {
  display: grid;
  gap: 1rem;
}

.projects {
  display: grid;
  gap: 0.6rem;
}

@media (min-width: 720px) {
  .projects {
    grid-template-columns: 1fr 1fr;
  }
}

.projects button,
.nav button {
  border: 1px solid var(--color-border);
  border-radius: 0.6rem;
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.75rem;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.projects button {
  display: grid;
  gap: 0.35rem;
}

.nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.nav button {
  display: grid;
  justify-items: center;
  gap: 0.4rem;
}

.mark {
  display: inline-grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.4rem;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
}

.projects .mark {
  width: 2rem;
  height: 2rem;
}

.list,
.todos,
.sources {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
}

.list li,
.todos li,
.sources li {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0;
  border-top: 1px solid var(--color-border);
}

.list li:first-child,
.todos li:first-child,
.sources li:first-child {
  border-top: 0;
  padding-top: 0;
}

time,
.hint,
p,
small {
  opacity: 0.72;
  font-size: 0.85rem;
}

.todos label {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}

.todos.done,
.todos li.done {
  opacity: 0.55;
}

.todos li.done strong {
  text-decoration: line-through;
}

.hint {
  margin-bottom: 0.5rem;
}

.sources li {
  align-items: baseline;
}
</style>
