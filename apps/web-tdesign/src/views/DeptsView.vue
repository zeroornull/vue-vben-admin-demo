<script setup lang="ts">
defineOptions({ name: 'DeptsView' })

import type { PrimaryTableCol, TableRowData } from 'tdesign-vue-next'
import { Button, Form, FormItem, Input, Select, Space, Table, Tag } from 'tdesign-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { useAccess } from '@/access/use-access'
import { tdesignDialog, tdesignMessage } from '@/adapter/tdesign'
import { createDept, deleteDept, deleteDepts, getDeptList, updateDept } from '@/api/system/dept'
import TdPage from '@/components/TdPage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useDisplayTitle } from '@/i18n/display'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTableExpandStore } from '@/stores/table-expand'
import { batchDeleteDoneText, normalizeIds } from '@app/tables/batch'
import { csvFileName } from '@app/tables/csv'

import {
  addDeptToLookup,
  DEPT_CSV_MAX_ROWS,
  deptLookupFromCatalog,
  deptsForCsv,
  deptsToCsv,
  importCsvSummary,
  orderDeptDraftsForImport,
  parseDeptCsv,
  resolveDeptDraft,
} from './depts/csv'
import DeptFormModal from './depts/DeptFormModal.vue'
import {
  batchDeleteDeptsConfirmText,
  DEPT_BATCH_DELETE_MAX,
  filterDeptTree,
  flattenDepts,
  orderDeptIdsForDelete,
} from './depts/query'
import type { DeptFormValues, SystemDept, UserStatus } from './depts/types'

const { t } = useI18n()
const { columnTitle } = useDisplayTitle()
const loading = ref(false)
const exporting = ref(false)
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const catalog = ref<SystemDept[]>([])
const modalOpen = ref(false)
const formModal = ref<UnsavedFormHandle | null>(null)
const editing = ref<SystemDept | null>(null)
const createParentId = ref<string | null>(null)
const query = reactive<{ name: string; status: UserStatus | undefined }>({
  name: '',
  status: undefined,
})

const { hasAnyAction } = useAccess()
const tableColumns = useTableColumnsStore()
const tableExpand = useTableExpandStore()
const selectedKeys = ref<string[]>([])

const tree = computed(() =>
  filterDeptTree(catalog.value, {
    name: query.name,
    status: query.status === 0 || query.status === 1 ? query.status : '',
  }),
)

const flat = computed(() => flattenDepts(catalog.value))
const allIds = computed(() => flat.value.map((item) => item.id))
const visibleIds = computed(() => flattenDepts(tree.value).map((item) => item.id))
const expandedKeys = computed(() => tableExpand.keysOf('depts', allIds.value))

const columns = computed<PrimaryTableCol<TableRowData>[]>(() => {
  const cols: PrimaryTableCol<TableRowData>[] = []
  if (hasAnyAction('dept:delete')) {
    cols.push({ colKey: 'row-select', type: 'multiple', width: 48 })
  }
  if (tableColumns.isVisible('depts', 'name')) {
    cols.push({ colKey: 'name', title: columnTitle('depts', 'name') })
  }
  if (tableColumns.isVisible('depts', 'userCount')) {
    cols.push({ colKey: 'userCount', title: columnTitle('depts', 'userCount'), width: 80 })
  }
  if (tableColumns.isVisible('depts', 'status')) {
    cols.push({ colKey: 'status', title: columnTitle('depts', 'status'), width: 100 })
  }
  if (tableColumns.isVisible('depts', 'remark')) {
    cols.push({ colKey: 'remark', title: columnTitle('depts', 'remark') })
  }
  if (tableColumns.isVisible('depts', 'createTime')) {
    cols.push({ colKey: 'createTime', title: columnTitle('depts', 'createTime'), width: 180 })
  }
  if (hasAnyAction('dept:create', 'dept:update', 'dept:delete')) {
    cols.push({ colKey: 'actions', title: t('column.actions'), width: 220 })
  }
  return cols
})

function onSelectChange(keys: Array<string | number>) {
  selectedKeys.value = normalizeIds(keys).slice(0, DEPT_BATCH_DELETE_MAX)
}

function onExpandedChange(keys: Array<string | number>) {
  tableExpand.setKeys(
    'depts',
    keys.map((key) => String(key)),
    visibleIds.value,
    allIds.value,
  )
}

async function load() {
  loading.value = true
  try {
    catalog.value = await getDeptList({ name: '', status: '' })
  } catch {
    // 失败由全局错误条提示
  } finally {
    loading.value = false
  }
}

function onReset() {
  query.name = ''
  query.status = undefined
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

function onExport() {
  exporting.value = true
  try {
    const result = deptsForCsv(tree.value, catalog.value, DEPT_CSV_MAX_ROWS)
    downloadCsv(deptsToCsv(result.rows), csvFileName('depts', new Date()))
    if (result.total > result.rows.length) {
      void tdesignMessage.warning(`只导出了前 ${result.rows.length} 条，筛选共 ${result.total} 条`)
    } else {
      void tdesignMessage.success(`已导出 ${result.rows.length} 条`)
    }
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
  if (!file || !hasAnyAction('dept:create')) return
  importing.value = true
  try {
    const parsed = parseDeptCsv(await file.text())
    const lookup = deptLookupFromCatalog(catalog.value)
    let created = 0
    const failed = [...parsed.rejected]
    for (const draft of orderDeptDraftsForImport(parsed.drafts)) {
      const resolved = resolveDeptDraft(draft, lookup)
      if (!resolved.ok) {
        failed.push({ line: draft.line, message: resolved.message })
        continue
      }
      try {
        const dept = await createDept(resolved.value, {
          skipErrorToast: true,
          skipLoadingBar: true,
        })
        created += 1
        addDeptToLookup(lookup, dept)
      } catch (error) {
        failed.push({
          line: draft.line,
          message: error instanceof Error ? error.message : '创建失败',
        })
      }
    }
    if (created) await load()
    if (failed.length) void tdesignMessage.warning(importCsvSummary(created, failed))
    else void tdesignMessage.success(importCsvSummary(created, failed))
  } catch {
    // 读文件失败少见；接口失败已记进 failed
  } finally {
    importing.value = false
  }
}

function onCreate() {
  editing.value = null
  createParentId.value = null
  modalOpen.value = true
}

function onAppend(row: SystemDept) {
  editing.value = null
  createParentId.value = row.id
  modalOpen.value = true
}

function onEdit(row: SystemDept) {
  editing.value = row
  createParentId.value = row.parentId
  modalOpen.value = true
}

async function onSubmit(values: DeptFormValues) {
  if (editing.value) {
    await updateDept(editing.value.id, values)
    void tdesignMessage.success('已保存')
  } else {
    await createDept(values)
    void tdesignMessage.success('已创建')
  }
  modalOpen.value = false
  await load()
}

async function onBatchDelete() {
  const ids = orderDeptIdsForDelete(selectedKeys.value, flat.value)
  if (!ids.length) return
  try {
    await tdesignDialog.confirm({
      body: batchDeleteDeptsConfirmText(ids.length),
      confirmBtn: '删除',
      header: t('confirm.batchDelete'),
      theme: 'warning',
    })
  } catch {
    return
  }
  const result = await deleteDepts(ids)
  void tdesignMessage.success(batchDeleteDoneText(result.deleted, '个部门', result.skipped))
  selectedKeys.value = []
  await load()
}

async function onDelete(row: SystemDept) {
  if (flat.value.some((item) => item.parentId === row.id)) {
    void tdesignMessage.warning('请先删除下级部门')
    return
  }
  if ((row.userCount ?? 0) > 0) {
    void tdesignMessage.warning('请先移走该部门下的用户')
    return
  }
  try {
    await tdesignDialog.confirm({
      body: `确定删除 ${row.name}？内存 mock，刷新页面后种子数据会回来。`,
      confirmBtn: '删除',
      header: t('confirm.deleteDept'),
      theme: 'warning',
    })
  } catch {
    return
  }
  await deleteDept(row.id)
  void tdesignMessage.success('已删除')
  selectedKeys.value = selectedKeys.value.filter((id) => id !== row.id)
  await load()
}

onBeforeRouteLeave(() => {
  if (!formModal.value?.confirmDiscard()) return false
  modalOpen.value = false
  return true
})

onMounted(() => {
  void load()
})
</script>

<template>
  <TdPage>
    <Form layout="inline">
      <FormItem label="部门名称">
        <Input v-model="query.name" clearable placeholder="模糊匹配，保留祖先" />
      </FormItem>
      <FormItem label="状态">
        <Select
          v-model="query.status"
          clearable
          :options="[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]"
          placeholder="全部"
          style="width: 8rem"
        />
      </FormItem>
      <FormItem>
        <Space>
          <Button @click="onReset">重置</Button>
          <Button :loading="exporting" @click="onExport">导出</Button>
          <Button v-access="'dept:create'" :loading="importing" @click="pickImportFile">导入</Button>
          <TableColumnPicker table="depts" />
          <Button
            v-access="'dept:delete'"
            :disabled="!selectedKeys.length"
            theme="danger"
            @click="onBatchDelete"
          >
            删除选中{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
          </Button>
          <Button v-access="'dept:create'" theme="primary" @click="onCreate">新建</Button>
        </Space>
      </FormItem>
    </Form>

    <Table
      :columns="columns"
      :data="tree"
      :expanded-row-keys="expandedKeys"
      :loading="loading"
      row-key="id"
      :selected-row-keys="selectedKeys"
      :tree="{ childrenKey: 'children' }"
      @expanded-row-keys-change="onExpandedChange"
      @select-change="onSelectChange"
    >
      <template #userCount="{ row }">{{ row.userCount ?? 0 }}</template>
      <template #status="{ row }">
        <Tag :theme="row.status === 1 ? 'success' : 'default'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </Tag>
      </template>
      <template #actions="{ row }">
        <Space>
          <Button
            v-if="hasAnyAction('dept:create')"
            theme="primary"
            variant="text"
            @click="onAppend(row)"
          >
            下级
          </Button>
          <Button v-if="hasAnyAction('dept:update')" theme="primary" variant="text" @click="onEdit(row)">
            编辑
          </Button>
          <Button v-if="hasAnyAction('dept:delete')" theme="danger" variant="text" @click="onDelete(row)">
            删除
          </Button>
        </Space>
      </template>
    </Table>

    <input
      ref="fileInput"
      accept=".csv,text/csv"
      hidden
      type="file"
      @change="onImportFile"
    />

    <DeptFormModal
      ref="formModal"
      v-model:open="modalOpen"
      :parent-id="createParentId"
      :record="editing"
      :tree="catalog"
      @submit="onSubmit"
    />
  </TdPage>
</template>
