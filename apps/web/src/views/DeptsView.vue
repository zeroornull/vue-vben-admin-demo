<script setup lang="ts">
defineOptions({ name: 'DeptsView' })

import type { TableColumnsType } from 'ant-design-vue'
import { Button, Form, FormItem, Input, Modal, Select, Space, Table, Tag, message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { useAccess } from '@/access/use-access'
import { createDept, deleteDept, deleteDepts, getDeptList, updateDept } from '@/api/system/dept'
import AntdPage from '@/components/AntdPage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'

import { useTableColumnsStore } from '@/stores/table-columns'
import { useTableExpandStore } from '@/stores/table-expand'
import { batchDeleteDoneText, normalizeIds } from '@app/tables/batch'
import { tableColumnKey } from '@app/tables/columns'
import { useDisplayTitle } from '@/i18n/display'
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
const rowSelection = computed(() => {
  if (!hasAnyAction('dept:delete')) return undefined
  return {
    checkStrictly: true,
    selectedRowKeys: selectedKeys.value,
    onChange(keys: (string | number)[]) {
      selectedKeys.value = normalizeIds(keys).slice(0, DEPT_BATCH_DELETE_MAX)
    },
  }
})

const tree = computed(() =>
  filterDeptTree(catalog.value, {
    name: query.name,
    status: query.status === 0 || query.status === 1 ? query.status : '',
  }),
)

const columns = computed<TableColumnsType<SystemDept>>(() => {
  const base: TableColumnsType<SystemDept> = [
    { dataIndex: 'name', title: columnTitle('depts', 'name') },
    { dataIndex: 'userCount', title: columnTitle('depts', 'userCount'), width: 80 },
    { dataIndex: 'status', title: columnTitle('depts', 'status'), width: 100 },
    { dataIndex: 'remark', title: columnTitle('depts', 'remark') },
    { dataIndex: 'createTime', title: columnTitle('depts', 'createTime'), width: 180 },
  ]
  const visible = base.filter((column) => tableColumns.isVisible('depts', tableColumnKey(column)))
  if (!hasAnyAction('dept:create', 'dept:update', 'dept:delete')) return visible
  return [...visible, { key: 'actions', title: t('column.actions'), width: 220 }]
})

const flat = computed(() => flattenDepts(catalog.value))
const allIds = computed(() => flat.value.map((item) => item.id))
const visibleIds = computed(() => flattenDepts(tree.value).map((item) => item.id))
const expandedKeys = computed(() => tableExpand.keysOf('depts', allIds.value))

function onExpandedRowsChange(keys: (string | number)[]) {
  tableExpand.setKeys('depts', keys, visibleIds.value, allIds.value)
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
      message.warning(`只导出了前 ${result.rows.length} 条，筛选共 ${result.total} 条`)
    } else {
      message.success(`已导出 ${result.rows.length} 条`)
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
    if (failed.length) message.warning(importCsvSummary(created, failed))
    else message.success(importCsvSummary(created, failed))
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
    message.success('已保存')
  } else {
    await createDept(values)
    message.success('已创建')
  }
  modalOpen.value = false
  await load()
}

function toDept(record: object): SystemDept {
  return record as SystemDept
}

function onBatchDelete() {
  const ids = orderDeptIdsForDelete(selectedKeys.value, flat.value)
  if (!ids.length) return
  Modal.confirm({
    content: batchDeleteDeptsConfirmText(ids.length),
    okText: '删除',
    okType: 'danger',
    title: t('confirm.batchDelete'),
    async onOk() {
      const result = await deleteDepts(ids)
      message.success(batchDeleteDoneText(result.deleted, '个部门', result.skipped))
      selectedKeys.value = []
      await load()
    },
  })
}

function onDelete(row: SystemDept) {
  if (flat.value.some((item) => item.parentId === row.id)) {
    message.warning('请先删除下级部门')
    return
  }
  if ((row.userCount ?? 0) > 0) {
    message.warning('请先移走该部门下的用户')
    return
  }
  Modal.confirm({
    content: `确定删除 ${row.name}？内存 mock，刷新页面后种子数据会回来。`,
    okText: '删除',
    okType: 'danger',
    title: t('confirm.deleteDept'),
    async onOk() {
      await deleteDept(row.id)
      message.success('已删除')
      selectedKeys.value = selectedKeys.value.filter((id) => id !== row.id)
      await load()
    },
  })
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
  <AntdPage>
    <Form layout="inline">
      <FormItem label="部门名称">
        <Input v-model:value="query.name" allow-clear placeholder="模糊匹配，保留祖先" />
      </FormItem>
      <FormItem label="状态">
        <Select
          v-model:value="query.status"
          allow-clear
          placeholder="全部"
          style="width: 8rem"
          :options="[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]"
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
            danger
            @click="onBatchDelete"
          >
            删除选中{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
          </Button>
          <Button v-access="'dept:create'" type="primary" @click="onCreate">新建</Button>
        </Space>
      </FormItem>
    </Form>

    <Table
      :key="flat.length"
      :columns="columns"
      :data-source="tree"
      :loading="loading"
      :pagination="false"
      :expanded-row-keys="expandedKeys"
      row-key="id"
      @expandedRowsChange="onExpandedRowsChange"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userCount'">
          {{ toDept(record).userCount ?? 0 }}
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Tag :color="toDept(record).status === 1 ? 'success' : 'default'">
            {{ toDept(record).status === 1 ? '启用' : '禁用' }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button v-access="'dept:create'" type="link" @click="onAppend(toDept(record))">下级</Button>
            <Button v-access="'dept:update'" type="link" @click="onEdit(toDept(record))">编辑</Button>
            <Button v-access="'dept:delete'" danger type="link" @click="onDelete(toDept(record))">删除</Button>
          </Space>
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

    <DeptFormModal
      ref="formModal"
      v-model:open="modalOpen"
      :parent-id="createParentId"
      :record="editing"
      :tree="catalog"
      @submit="onSubmit"
    />
  </AntdPage>
</template>
