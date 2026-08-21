<script setup lang="ts">
defineOptions({ name: 'DeptsView' })

import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  vLoading,
} from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { useAccess } from '@/access/use-access'
import { createDept, deleteDept, deleteDepts, getDeptList, updateDept } from '@/api/system/dept'
import ElePage from '@/components/ElePage.vue'
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

function onSelectionChange(rows: SystemDept[]) {
  selectedKeys.value = normalizeIds(rows.map((row) => row.id)).slice(0, DEPT_BATCH_DELETE_MAX)
}

function onExpandChange(row: object, state: boolean | object[]) {
  if (Array.isArray(state)) {
    tableExpand.setKeys(
      'depts',
      state.map((item) => toDept(item).id),
      visibleIds.value,
      allIds.value,
    )
    return
  }
  const current = new Set(expandedKeys.value)
  const id = toDept(row).id
  if (state) current.add(id)
  else current.delete(id)
  tableExpand.setKeys('depts', [...current], visibleIds.value, allIds.value)
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
      ElMessage.warning(`只导出了前 ${result.rows.length} 条，筛选共 ${result.total} 条`)
    } else {
      ElMessage.success(`已导出 ${result.rows.length} 条`)
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
    if (failed.length) ElMessage.warning(importCsvSummary(created, failed))
    else ElMessage.success(importCsvSummary(created, failed))
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
    ElMessage.success('已保存')
  } else {
    await createDept(values)
    ElMessage.success('已创建')
  }
  modalOpen.value = false
  await load()
}

function toDept(record: object): SystemDept {
  return record as SystemDept
}

async function onBatchDelete() {
  const ids = orderDeptIdsForDelete(selectedKeys.value, flat.value)
  if (!ids.length) return
  try {
    await ElMessageBox.confirm(batchDeleteDeptsConfirmText(ids.length), t('confirm.batchDelete'), {
      confirmButtonText: '删除',
      type: 'warning',
    })
  } catch {
    return
  }
  const result = await deleteDepts(ids)
  ElMessage.success(batchDeleteDoneText(result.deleted, '个部门', result.skipped))
  selectedKeys.value = []
  await load()
}

async function onDelete(row: SystemDept) {
  if (flat.value.some((item) => item.parentId === row.id)) {
    ElMessage.warning('请先删除下级部门')
    return
  }
  if ((row.userCount ?? 0) > 0) {
    ElMessage.warning('请先移走该部门下的用户')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定删除 ${row.name}？内存 mock，刷新页面后种子数据会回来。`,
      t('confirm.deleteDept'),
      { confirmButtonText: '删除', type: 'warning' },
    )
  } catch {
    return
  }
  await deleteDept(row.id)
  ElMessage.success('已删除')
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
  <ElePage>
    <ElForm inline>
      <ElFormItem label="部门名称">
        <ElInput v-model="query.name" clearable placeholder="模糊匹配，保留祖先" />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSelect v-model="query.status" clearable placeholder="全部" style="width: 8rem">
          <ElOption :value="1" label="启用" />
          <ElOption :value="0" label="禁用" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton @click="onReset">重置</ElButton>
        <ElButton :loading="exporting" @click="onExport">导出</ElButton>
        <ElButton v-access="'dept:create'" :loading="importing" @click="pickImportFile">导入</ElButton>
        <TableColumnPicker table="depts" />
        <ElButton
          v-access="'dept:delete'"
          :disabled="!selectedKeys.length"
          type="danger"
          @click="onBatchDelete"
        >
          删除选中{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
        </ElButton>
        <ElButton v-access="'dept:create'" type="primary" @click="onCreate">新建</ElButton>
      </ElFormItem>
    </ElForm>

    <ElTable
      :key="flat.length"
      v-loading="loading"
      :data="tree"
      :expand-row-keys="expandedKeys"
      row-key="id"
      :tree-props="{ children: 'children' }"
      @expand-change="onExpandChange"
      @selection-change="onSelectionChange"
    >
      <ElTableColumn v-if="hasAnyAction('dept:delete')" type="selection" width="48" />
      <ElTableColumn
        v-if="tableColumns.isVisible('depts', 'name')"
        :label="columnTitle('depts', 'name')"
        prop="name"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('depts', 'userCount')"
        :label="columnTitle('depts', 'userCount')"
        prop="userCount"
        width="80"
      >
        <template #default="{ row }">{{ toDept(row).userCount ?? 0 }}</template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('depts', 'status')"
        :label="columnTitle('depts', 'status')"
        prop="status"
        width="100"
      >
        <template #default="{ row }">
          <ElTag :type="toDept(row).status === 1 ? 'success' : 'info'">
            {{ toDept(row).status === 1 ? '启用' : '禁用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('depts', 'remark')"
        :label="columnTitle('depts', 'remark')"
        prop="remark"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('depts', 'createTime')"
        :label="columnTitle('depts', 'createTime')"
        prop="createTime"
        width="180"
      />
      <ElTableColumn
        v-if="hasAnyAction('dept:create', 'dept:update', 'dept:delete')"
        :label="t('column.actions')"
        width="220"
      >
        <template #default="{ row }">
          <ElButton v-access="'dept:create'" link type="primary" @click="onAppend(toDept(row))">
            下级
          </ElButton>
          <ElButton v-access="'dept:update'" link type="primary" @click="onEdit(toDept(row))">
            编辑
          </ElButton>
          <ElButton v-access="'dept:delete'" link type="danger" @click="onDelete(toDept(row))">
            删除
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

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
  </ElePage>
</template>
