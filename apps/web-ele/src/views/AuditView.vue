<script setup lang="ts">
defineOptions({ name: 'AuditView' })

import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  vLoading,
} from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import { getAuditList, importAudit } from '@/api/system/audit'
import ElePage from '@/components/ElePage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import { useDisplayTitle } from '@/i18n/display'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import { elementSortOrder, nextElementPage, nextElementTableQuery } from '@/tables/element-sort'
import { csvFileName } from '@app/tables/csv'
import { TABLE_PAGE_SIZES } from '@app/tables/page-size'
import { TABLE_SORT_FIELDS } from '@app/tables/sort'
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
const defaultSort = computed(() => {
  if (!sort.value) return undefined
  return { prop: sort.value.field, order: elementSortOrder(sort.value.order) }
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
      ElMessage.warning(`只导出了前 ${result.items.length} 条，筛选共 ${result.total} 条`)
    } else {
      ElMessage.success(`已导出 ${result.items.length} 条`)
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
    if (failed.length) ElMessage.warning(importCsvSummary(created, failed))
    else ElMessage.success(importCsvSummary(created, failed))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导入失败')
  } finally {
    importing.value = false
  }
}

function onPageChange(nextPage: number) {
  const paging = nextElementPage(page.value, pageSize.value, nextPage, pageSize.value)
  page.value = paging.page
  void load()
}

function onSizeChange(nextSize: number) {
  const paging = nextElementPage(page.value, pageSize.value, page.value, nextSize)
  page.value = paging.page
  tablePage.setPageSize('audit', paging.pageSize)
  void load()
}

function onSortChange(payload: { order: string | null; prop: string | null }) {
  const next = nextElementTableQuery(
    page.value,
    pageSize.value,
    sort.value,
    { current: page.value, pageSize: pageSize.value },
    payload,
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
  <ElePage>
    <p class="hint">
      只记用户 / 部门 / 角色 / 外链的写操作，以及改显示名和改密。不能删、不能改单条。导入走导出格式，写进内存环形缓冲，不是业务新建。最多 100 条，重启 mock 会回到种子。
    </p>
    <ElForm inline @submit.prevent="onSearch">
      <ElFormItem label="操作者">
        <ElInput v-model="query.actor" clearable placeholder="登录账号" />
      </ElFormItem>
      <ElFormItem label="对象">
        <ElSelect v-model="query.target" clearable placeholder="全部" style="width: 8rem">
          <ElOption
            v-for="value in auditTargets"
            :key="value"
            :label="auditTargetLabels[value]"
            :value="value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="从">
        <input v-model="query.from" class="date-input" type="date" />
      </ElFormItem>
      <ElFormItem label="到">
        <input v-model="query.to" class="date-input" type="date" />
      </ElFormItem>
      <ElFormItem>
        <ElButton native-type="submit" type="primary">查询</ElButton>
        <ElButton @click="onReset">重置</ElButton>
        <ElButton :loading="exporting" @click="onExport">导出</ElButton>
        <ElButton :loading="importing" @click="pickImportFile">导入</ElButton>
        <TableColumnPicker table="audit" />
      </ElFormItem>
    </ElForm>

    <ElTable
      v-loading="loading"
      :data="items"
      :default-sort="defaultSort"
      row-key="id"
      @sort-change="onSortChange"
    >
      <ElTableColumn
        v-if="tableColumns.isVisible('audit', 'at')"
        :label="columnTitle('audit', 'at')"
        prop="at"
        sortable="custom"
        width="180"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('audit', 'actor')"
        :label="columnTitle('audit', 'actor')"
        prop="actor"
        sortable="custom"
        width="120"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('audit', 'target')"
        :label="columnTitle('audit', 'target')"
        prop="target"
        width="100"
      >
        <template #default="{ row }">{{ auditTargetLabels[toEntry(row).target] }}</template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('audit', 'action')"
        :label="columnTitle('audit', 'action')"
        prop="action"
        width="90"
      >
        <template #default="{ row }">{{ auditActionLabels[toEntry(row).action] }}</template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('audit', 'summary')"
        :label="columnTitle('audit', 'summary')"
        prop="summary"
      />
    </ElTable>

    <ElPagination
      :current-page="page"
      layout="total, sizes, prev, pager, next"
      :page-size="pageSize"
      :page-sizes="[...TABLE_PAGE_SIZES]"
      :total="total"
      @current-change="onPageChange"
      @size-change="onSizeChange"
    />

    <input
      ref="fileInput"
      accept=".csv,text/csv"
      hidden
      type="file"
      @change="onImportFile"
    />
  </ElePage>
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
