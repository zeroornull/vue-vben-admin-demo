<script setup lang="ts">
defineOptions({ name: 'DeptsView' })

import type { DataTableColumns } from 'naive-ui'
import { NButton, NDataTable, NForm, NFormItem, NInput, NSelect, NSpace, NTag } from 'naive-ui'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { useAccess } from '@/access/use-access'
import { naiveDialog, naiveMessage } from '@/adapter/naive'
import { createDept, deleteDept, deleteDepts, getDeptList, updateDept } from '@/api/system/dept'
import NaivePage from '@/components/NaivePage.vue'
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

const columns = computed<DataTableColumns<SystemDept>>(() => {
  const cols: DataTableColumns<SystemDept> = []
  if (hasAnyAction('dept:delete')) {
    cols.push({ type: 'selection', width: 48 })
  }
  if (tableColumns.isVisible('depts', 'name')) {
    cols.push({ key: 'name', title: columnTitle('depts', 'name') })
  }
  if (tableColumns.isVisible('depts', 'userCount')) {
    cols.push({
      key: 'userCount',
      render: (row) => String(row.userCount ?? 0),
      title: columnTitle('depts', 'userCount'),
      width: 80,
    })
  }
  if (tableColumns.isVisible('depts', 'status')) {
    cols.push({
      key: 'status',
      render: (row) =>
        h(NTag, { type: row.status === 1 ? 'success' : 'default' }, () =>
          row.status === 1 ? '启用' : '禁用',
        ),
      title: columnTitle('depts', 'status'),
      width: 100,
    })
  }
  if (tableColumns.isVisible('depts', 'remark')) {
    cols.push({ key: 'remark', title: columnTitle('depts', 'remark') })
  }
  if (tableColumns.isVisible('depts', 'createTime')) {
    cols.push({ key: 'createTime', title: columnTitle('depts', 'createTime'), width: 180 })
  }
  if (hasAnyAction('dept:create', 'dept:update', 'dept:delete')) {
    cols.push({
      key: 'actions',
      render: (row) =>
        h(NSpace, null, () => [
          hasAnyAction('dept:create')
            ? h(NButton, { text: true, type: 'primary', onClick: () => onAppend(row) }, () => '下级')
            : null,
          hasAnyAction('dept:update')
            ? h(NButton, { text: true, type: 'primary', onClick: () => onEdit(row) }, () => '编辑')
            : null,
          hasAnyAction('dept:delete')
            ? h(NButton, { text: true, type: 'error', onClick: () => void onDelete(row) }, () => '删除')
            : null,
        ]),
      title: t('column.actions'),
      width: 220,
    })
  }
  return cols
})

function onChecked(keys: Array<string | number>) {
  selectedKeys.value = normalizeIds(keys).slice(0, DEPT_BATCH_DELETE_MAX)
}

function onExpand(keys: Array<string | number>) {
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
      naiveMessage.warning(`只导出了前 ${result.rows.length} 条，筛选共 ${result.total} 条`)
    } else {
      naiveMessage.success(`已导出 ${result.rows.length} 条`)
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
    if (failed.length) naiveMessage.warning(importCsvSummary(created, failed))
    else naiveMessage.success(importCsvSummary(created, failed))
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
    naiveMessage.success('已保存')
  } else {
    await createDept(values)
    naiveMessage.success('已创建')
  }
  modalOpen.value = false
  await load()
}

async function onBatchDelete() {
  const ids = orderDeptIdsForDelete(selectedKeys.value, flat.value)
  if (!ids.length) return
  try {
    await naiveDialog.warning({
      content: batchDeleteDeptsConfirmText(ids.length),
      positiveText: '删除',
      title: t('confirm.batchDelete'),
    })
  } catch {
    return
  }
  const result = await deleteDepts(ids)
  naiveMessage.success(batchDeleteDoneText(result.deleted, '个部门', result.skipped))
  selectedKeys.value = []
  await load()
}

async function onDelete(row: SystemDept) {
  if (flat.value.some((item) => item.parentId === row.id)) {
    naiveMessage.warning('请先删除下级部门')
    return
  }
  if ((row.userCount ?? 0) > 0) {
    naiveMessage.warning('请先移走该部门下的用户')
    return
  }
  try {
    await naiveDialog.warning({
      content: `确定删除 ${row.name}？内存 mock，刷新页面后种子数据会回来。`,
      positiveText: '删除',
      title: t('confirm.deleteDept'),
    })
  } catch {
    return
  }
  await deleteDept(row.id)
  naiveMessage.success('已删除')
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
  <NaivePage>
    <NForm inline>
      <NFormItem label="部门名称">
        <NInput v-model:value="query.name" clearable placeholder="模糊匹配，保留祖先" />
      </NFormItem>
      <NFormItem label="状态">
        <NSelect
          v-model:value="query.status"
          clearable
          :options="[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]"
          placeholder="全部"
          style="width: 8rem"
        />
      </NFormItem>
      <NFormItem>
        <NSpace>
          <NButton @click="onReset">重置</NButton>
          <NButton :loading="exporting" @click="onExport">导出</NButton>
          <NButton v-access="'dept:create'" :loading="importing" @click="pickImportFile">导入</NButton>
          <TableColumnPicker table="depts" />
          <NButton
            v-access="'dept:delete'"
            :disabled="!selectedKeys.length"
            type="error"
            @click="onBatchDelete"
          >
            删除选中{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
          </NButton>
          <NButton v-access="'dept:create'" type="primary" @click="onCreate">新建</NButton>
        </NSpace>
      </NFormItem>
    </NForm>

    <NDataTable
      :checked-row-keys="selectedKeys"
      :columns="columns"
      :data="tree"
      :expanded-row-keys="expandedKeys"
      :loading="loading"
      :row-key="(row) => row.id"
      @update:checked-row-keys="onChecked"
      @update:expanded-row-keys="onExpand"
    />

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
  </NaivePage>
</template>
