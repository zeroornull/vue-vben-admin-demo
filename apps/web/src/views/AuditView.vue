<script setup lang="ts">
defineOptions({ name: 'AuditView' })

import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import { Button, Form, FormItem, Input, Select, Space, Table, message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'

import { getAuditList, importAudit } from '@/api/system/audit'
import AntdPage from '@/components/AntdPage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import { tableColumnKey } from '@app/tables/columns'
import { useDisplayTitle } from '@/i18n/display'
import { csvFileName } from '@app/tables/csv'
import { TABLE_PAGE_SIZE_OPTIONS } from '@app/tables/page-size'
import { nextTableQuery, TABLE_SORT_FIELDS, tableColumnSort } from '@app/tables/sort'
import {
  AUDIT_CSV_MAX_ROWS,
  auditCsvRow,
  auditToCsv,
  importCsvSummary,
  parseAuditCsv,
} from '@/views/audit/csv'
import {
  auditActionLabels,
  auditTargetLabels,
  auditTargets,
  type AuditEntry,
  type AuditTarget,
} from '@/views/audit/query'

const { columnTitle } = useDisplayTitle()
const loading = ref(false)
const exporting = ref(false)
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const items = ref<AuditEntry[]>([])
const total = ref(0)
const page = ref(1)
const tablePage = useTablePageStore()
const tableSort = useTableSortStore()
const tableColumns = useTableColumnsStore()
const pageSize = computed(() => tablePage.pageSizeOf('audit'))
const sort = computed(() => tableSort.sortOf('audit'))
const query = reactive<{ actor: string; from: string; target: AuditTarget | undefined; to: string }>({
  actor: '',
  from: '',
  target: undefined,
  to: '',
})

const columns = computed<TableColumnsType<AuditEntry>>(() => {
  const allowed = TABLE_SORT_FIELDS.audit
  const current = sort.value
  return [
    { dataIndex: 'at', title: columnTitle('audit', 'at'), width: 180, ...tableColumnSort('at', allowed, current) },
    { dataIndex: 'actor', title: columnTitle('audit', 'actor'), width: 120, ...tableColumnSort('actor', allowed, current) },
    { dataIndex: 'target', title: columnTitle('audit', 'target'), width: 100 },
    { dataIndex: 'action', title: columnTitle('audit', 'action'), width: 90 },
    { dataIndex: 'summary', title: columnTitle('audit', 'summary') },
  ].filter((column) => tableColumns.isVisible('audit', tableColumnKey(column)))
})

async function load() {
  loading.value = true
  try {
    const result = await getAuditList({
      actor: query.actor.trim(),
      from: query.from,
      page: page.value,
      pageSize: pageSize.value,
      sortField: sort.value?.field ?? '',
      sortOrder: sort.value?.order ?? '',
      target: query.target ?? '',
      to: query.to,
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
  query.from = ''
  query.target = undefined
  query.to = ''
  onSearch()
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function onExport() {
  exporting.value = true
  try {
    const result = await getAuditList({
      actor: query.actor.trim(),
      from: query.from,
      page: 1,
      pageSize: AUDIT_CSV_MAX_ROWS,
      sortField: sort.value?.field ?? '',
      sortOrder: sort.value?.order ?? '',
      target: query.target ?? '',
      to: query.to,
    })
    downloadCsv(auditToCsv(result.items.map(auditCsvRow)), csvFileName('audit', new Date()))
    if (result.total > result.items.length) {
      message.warning(`只导出了前 ${result.items.length} 条，筛选共 ${result.total} 条`)
    } else {
      message.success(`已导出 ${result.items.length} 条`)
    }
  } catch {
    // 失败由全局错误条提示
  } finally {
    exporting.value = false
  }
}

function pickImportFile() {
  fileInput.value?.click()
}

async function onImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  importing.value = true
  try {
    const parsed = parseAuditCsv(await file.text())
    let created = 0
    const failed = [...parsed.rejected]
    if (parsed.accepted.length) {
      const result = await importAudit(
        parsed.accepted.map((row) => row.value),
        { skipErrorToast: true, skipLoadingBar: true },
      )
      created = result.created
      if (result.skipped) {
        failed.push({ line: 0, message: `服务端跳过 ${result.skipped} 条` })
      }
    }
    if (created) await load()
    if (failed.length) message.warning(importCsvSummary(created, failed))
    else message.success(importCsvSummary(created, failed))
  } catch (error) {
    message.error(error instanceof Error ? error.message : '导入失败')
  } finally {
    importing.value = false
  }
}

function onTableChange(pagination: TablePaginationConfig, _filters: unknown, sorter: unknown) {
  const next = nextTableQuery(
    page.value,
    pageSize.value,
    sort.value,
    pagination,
    sorter,
    TABLE_SORT_FIELDS.audit,
  )
  page.value = next.page
  tablePage.setPageSize('audit', next.pageSize)
  tableSort.setSort('audit', next.sort)
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
      只记用户 / 部门 / 角色 / 外链的写操作，以及改显示名和改密。不能删、不能改单条。导入走导出格式，写进内存环形缓冲，不是业务新建。最多 100 条，重启 mock 会回到种子。
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
      <FormItem label="从">
        <input v-model="query.from" class="date-input" type="date" />
      </FormItem>
      <FormItem label="到">
        <input v-model="query.to" class="date-input" type="date" />
      </FormItem>
      <FormItem>
        <Space>
          <Button html-type="submit" type="primary">查询</Button>
          <Button @click="onReset">重置</Button>
          <Button :loading="exporting" @click="onExport">导出</Button>
          <Button :loading="importing" @click="pickImportFile">导入</Button>
          <TableColumnPicker table="audit" />
        </Space>
      </FormItem>
    </Form>
    <Table
      :columns="columns"
      :data-source="items"
      :loading="loading"
      :pagination="{
        current: page,
        pageSize,
        pageSizeOptions: TABLE_PAGE_SIZE_OPTIONS,
        showSizeChanger: true,
        total,
      }"
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
    <input
      ref="fileInput"
      accept=".csv,text/csv"
      hidden
      type="file"
      @change="onImportFile"
    />
  </AntdPage>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  opacity: 0.75;
}

.date-input {
  box-sizing: border-box;
  width: 10.5rem;
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: inherit;
}
</style>
