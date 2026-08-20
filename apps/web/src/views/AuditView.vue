<script setup lang="ts">
defineOptions({ name: 'AuditView' })

import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import { Button, Form, FormItem, Input, Select, Space, Table } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'

import { getAuditList } from '@/api/system/audit'
import AntdPage from '@/components/AntdPage.vue'
import {
  auditActionLabels,
  auditTargetLabels,
  auditTargets,
  type AuditEntry,
  type AuditTarget,
} from '@/views/audit/query'

const loading = ref(false)
const items = ref<AuditEntry[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const query = reactive<{ actor: string; target: AuditTarget | undefined }>({
  actor: '',
  target: undefined,
})

const columns: TableColumnsType<AuditEntry> = [
  { dataIndex: 'at', title: '时间', width: 180 },
  { dataIndex: 'actor', title: '操作者', width: 120 },
  { dataIndex: 'target', title: '对象', width: 100 },
  { dataIndex: 'action', title: '动作', width: 90 },
  { dataIndex: 'summary', title: '摘要' },
]

async function load() {
  loading.value = true
  try {
    const result = await getAuditList({
      actor: query.actor.trim(),
      page: page.value,
      pageSize: pageSize.value,
      target: query.target ?? '',
    })
    items.value = result.items
    total.value = result.total
  } catch {
    // 失败由全局错误条提示
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  void load()
}

function onReset() {
  query.actor = ''
  query.target = undefined
  onSearch()
}

function onTableChange(pagination: TablePaginationConfig) {
  page.value = pagination.current ?? 1
  pageSize.value = pagination.pageSize ?? 10
  void load()
}

function toEntry(record: object): AuditEntry {
  return record as AuditEntry
}

onMounted(() => {
  void load()
})
</script>

<template>
  <AntdPage>
    <p class="hint">
      只记用户 / 部门 / 角色的写操作，以及改显示名。不能删、不能改。最多 100 条，重启 mock 会回到种子。
    </p>
    <Form layout="inline" @finish="onSearch">
      <FormItem label="操作者">
        <Input v-model:value="query.actor" allow-clear placeholder="登录账号" />
      </FormItem>
      <FormItem label="对象">
        <Select
          v-model:value="query.target"
          allow-clear
          placeholder="全部"
          style="width: 8rem"
          :options="auditTargets.map((value) => ({ label: auditTargetLabels[value], value }))"
        />
      </FormItem>
      <FormItem>
        <Space>
          <Button html-type="submit" type="primary">查询</Button>
          <Button @click="onReset">重置</Button>
        </Space>
      </FormItem>
    </Form>
    <Table
      :columns="columns"
      :data-source="items"
      :loading="loading"
      :pagination="{ current: page, pageSize, total, showSizeChanger: true }"
      row-key="id"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'target'">
          {{ auditTargetLabels[toEntry(record).target] }}
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          {{ auditActionLabels[toEntry(record).action] }}
        </template>
      </template>
    </Table>
  </AntdPage>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  opacity: 0.75;
}
</style>
