<script setup lang="ts">
defineOptions({ name: 'UsersView' })

import type { PageInfo, PrimaryTableCol, TableRowData } from 'tdesign-vue-next'
import { Button, Form, FormItem, Input, Select, Space, Table, Tag, TreeSelect } from 'tdesign-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { getDeptList } from '@/api/system/dept'
import { getRoleList } from '@/api/system/role'
import { createUser, deleteUser, deleteUsers, getUserList, updateUser } from '@/api/system/user'
import { useAccess } from '@/access/use-access'
import { tdesignDialog, tdesignMessage } from '@/adapter/tdesign'
import TdPage from '@/components/TdPage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useDisplayTitle } from '@/i18n/display'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import {
  nextTdesignPage,
  nextTdesignTableQuery,
  toTdesignSort,
  type TdesignSort,
} from '@/tables/tdesign-sort'
import { TABLE_PAGE_SIZES } from '@app/tables/page-size'
import { TABLE_SORT_FIELDS } from '@app/tables/sort'
import { toTdesignTree } from '@/views/depts/tdesign-tree'
import { deptNameById, flattenDepts, toParentOptions } from '@/views/depts/query'
import type { SystemDept } from '@/views/depts/types'
import { roleNameById } from '@/views/roles/query'
import type { SystemRole } from '@/views/roles/types'

import UserFormModal from './users/UserFormModal.vue'
import {
  csvFileName,
  importCsvSummary,
  invertNameMap,
  parseUserCsv,
  USER_CSV_MAX_ROWS,
  userCsvRow,
  usersToCsv,
} from './users/csv'
import {
  batchDeleteConfirmText,
  nextPageAfterDeletes,
  normalizeUserIds,
  USER_BATCH_DELETE_MAX,
} from './users/query'
import type { SystemUser, UserFormValues, UserStatus } from './users/types'

const { t } = useI18n()
const { columnTitle } = useDisplayTitle()
const loading = ref(false)
const exporting = ref(false)
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const items = ref<SystemUser[]>([])
const catalog = ref<SystemDept[]>([])
const roleCatalog = ref<SystemRole[]>([])
const total = ref(0)
const page = ref(1)
const tablePage = useTablePageStore()
const tableSort = useTableSortStore()
const pageSize = computed(() => tablePage.pageSizeOf('users'))
const sort = computed(() => tableSort.sortOf('users'))
const modalOpen = ref(false)
const formModal = ref<UnsavedFormHandle | null>(null)
const editing = ref<SystemUser | null>(null)
const selectedKeys = ref<string[]>([])
const query = reactive<{
  deptId: string | undefined
  name: string
  roleId: string | undefined
  status: UserStatus | undefined
}>({
  deptId: undefined,
  name: '',
  roleId: undefined,
  status: undefined,
})

const { hasAnyAction } = useAccess()
const tableColumns = useTableColumnsStore()
const names = computed(() => deptNameById(flattenDepts(catalog.value)))
const roleNames = computed(() => roleNameById(roleCatalog.value))
const deptTree = computed(() => toTdesignTree(toParentOptions(catalog.value)))
const pagination = computed(() => ({
  current: page.value,
  pageSize: pageSize.value,
  pageSizeOptions: [...TABLE_PAGE_SIZES],
  total: total.value,
}))
const tableSortValue = computed(() => toTdesignSort(sort.value))

const columns = computed<PrimaryTableCol<TableRowData>[]>(() => {
  const allowed = TABLE_SORT_FIELDS.users
  const cols: PrimaryTableCol<TableRowData>[] = []
  if (hasAnyAction('user:delete')) {
    cols.push({ colKey: 'row-select', type: 'multiple', width: 48 })
  }
  if (tableColumns.isVisible('users', 'name')) {
    cols.push({
      colKey: 'name',
      sorter: allowed.includes('name'),
      title: columnTitle('users', 'name'),
    })
  }
  if (tableColumns.isVisible('users', 'deptId')) {
    cols.push({ colKey: 'deptId', title: columnTitle('users', 'deptId'), width: 140 })
  }
  if (tableColumns.isVisible('users', 'roleIds')) {
    cols.push({ colKey: 'roleIds', title: columnTitle('users', 'roleIds'), width: 180 })
  }
  if (tableColumns.isVisible('users', 'status')) {
    cols.push({
      colKey: 'status',
      sorter: allowed.includes('status'),
      title: columnTitle('users', 'status'),
      width: 100,
    })
  }
  if (tableColumns.isVisible('users', 'remark')) {
    cols.push({ colKey: 'remark', title: columnTitle('users', 'remark') })
  }
  if (tableColumns.isVisible('users', 'createTime')) {
    cols.push({
      colKey: 'createTime',
      sorter: allowed.includes('createTime'),
      title: columnTitle('users', 'createTime'),
      width: 180,
    })
  }
  if (hasAnyAction('user:update', 'user:delete')) {
    cols.push({ colKey: 'actions', title: t('column.actions'), width: 160 })
  }
  return cols
})

async function loadCatalogs() {
  const [depts, roles] = await Promise.all([
    getDeptList({ name: '', status: '' }),
    getRoleList({ code: '', name: '', page: 1, pageSize: 100, status: '' }),
  ])
  catalog.value = depts
  roleCatalog.value = roles.items
}

async function load() {
  loading.value = true
  try {
    const result = await getUserList({
      deptId: query.deptId ?? '',
      name: query.name.trim(),
      page: page.value,
      pageSize: pageSize.value,
      roleId: query.roleId ?? '',
      sortField: sort.value?.field ?? '',
      sortOrder: sort.value?.order ?? '',
      status: query.status === 0 || query.status === 1 ? query.status : '',
    })
    items.value = result.items
    total.value = result.total
  } catch {
    // 失败由全局错误条提示
  } finally {
    loading.value = false
  }
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
    const result = await getUserList({
      deptId: query.deptId ?? '',
      name: query.name.trim(),
      page: 1,
      pageSize: USER_CSV_MAX_ROWS,
      roleId: query.roleId ?? '',
      sortField: sort.value?.field ?? '',
      sortOrder: sort.value?.order ?? '',
      status: query.status === 0 || query.status === 1 ? query.status : '',
    })
    const csv = usersToCsv(
      result.items.map((user) => userCsvRow(user, deptLabel(user.deptId), roleLabel(user.roleIds))),
    )
    downloadCsv(csv, csvFileName('users', new Date()))
    if (result.total > result.items.length) {
      void tdesignMessage.warning(`只导出了前 ${result.items.length} 条，筛选共 ${result.total} 条`)
    } else {
      void tdesignMessage.success(`已导出 ${result.items.length} 条`)
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
  if (!file || !hasAnyAction('user:create')) return
  importing.value = true
  try {
    const parsed = parseUserCsv(await file.text(), {
      deptIdByName: invertNameMap(names.value),
      roleIdByName: invertNameMap(roleNames.value),
    })
    let created = 0
    const failed = [...parsed.rejected]
    for (const row of parsed.accepted) {
      try {
        await createUser(row.value, { skipErrorToast: true, skipLoadingBar: true })
        created += 1
      } catch (error) {
        failed.push({
          line: row.line,
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

function onSearch() {
  page.value = 1
  void load()
}

function onReset() {
  query.deptId = undefined
  query.name = ''
  query.roleId = undefined
  query.status = undefined
  onSearch()
}

function onPageChange(pageInfo: PageInfo) {
  const paging = nextTdesignPage(page.value, pageSize.value, pageInfo.current, pageInfo.pageSize)
  page.value = paging.page
  tablePage.setPageSize('users', paging.pageSize)
  void load()
}

function onSortChange(sorter: Partial<TdesignSort> | Array<Partial<TdesignSort>>) {
  const next = nextTdesignTableQuery(
    page.value,
    pageSize.value,
    sort.value,
    { current: page.value, pageSize: pageSize.value },
    sorter,
    TABLE_SORT_FIELDS.users,
  )
  page.value = next.page
  tablePage.setPageSize('users', next.pageSize)
  tableSort.setSort('users', next.sort)
  void load()
}

function onSelectChange(keys: Array<string | number>) {
  selectedKeys.value = normalizeUserIds(keys).slice(0, USER_BATCH_DELETE_MAX)
}

function onCreate() {
  editing.value = null
  modalOpen.value = true
}

function onEdit(row: SystemUser) {
  editing.value = row
  modalOpen.value = true
}

async function onSubmit(values: UserFormValues) {
  if (editing.value) {
    await updateUser(editing.value.id, values)
    void tdesignMessage.success('已保存')
  } else {
    await createUser(values)
    void tdesignMessage.success('已创建')
  }
  modalOpen.value = false
  await load()
}

function deptLabel(deptId: string | null) {
  if (!deptId) return t('filter.unassigned')
  return names.value.get(deptId) ?? deptId
}

function roleLabel(roleIds: string[]) {
  if (!roleIds.length) return t('filter.unassigned')
  return roleIds.map((id) => roleNames.value.get(id) ?? id).join('、')
}

async function onBatchDelete() {
  const ids = normalizeUserIds(selectedKeys.value)
  if (!ids.length) return
  try {
    await tdesignDialog.confirm({
      body: batchDeleteConfirmText(ids.length),
      confirmBtn: t('confirm.delete'),
      header: t('confirm.batchDelete'),
      theme: 'warning',
    })
  } catch {
    return
  }
  const result = await deleteUsers(ids)
  void tdesignMessage.success(t('toast.deletedPeople', { count: result.deleted }))
  const deletedOnPage = items.value.filter((item) => ids.includes(item.id)).length
  page.value = nextPageAfterDeletes(page.value, items.value.length, deletedOnPage)
  selectedKeys.value = []
  await load()
}

async function onDelete(row: SystemUser) {
  try {
    await tdesignDialog.confirm({
      body: t('confirm.deleteUserNamed', { name: row.name }),
      confirmBtn: t('confirm.delete'),
      header: t('confirm.deleteUser'),
      theme: 'warning',
    })
  } catch {
    return
  }
  await deleteUser(row.id)
  void tdesignMessage.success(t('toast.deleted'))
  selectedKeys.value = selectedKeys.value.filter((id) => id !== row.id)
  page.value = nextPageAfterDeletes(page.value, items.value.length, 1)
  await load()
}

onBeforeRouteLeave(() => {
  if (!formModal.value?.confirmDiscard()) return false
  modalOpen.value = false
  return true
})

onMounted(async () => {
  try {
    await loadCatalogs()
  } catch {
    // 失败由全局错误条提示
  }
  await load()
})
</script>

<template>
  <TdPage>
    <Form layout="inline" @submit="onSearch">
      <FormItem :label="t('users.name')">
        <Input v-model="query.name" clearable :placeholder="t('filter.fuzzy')" />
      </FormItem>
      <FormItem :label="t('users.dept')">
        <TreeSelect
          v-model="query.deptId"
          clearable
          :data="deptTree"
          :placeholder="t('filter.includeChildren')"
          style="width: 12rem"
          :tree-props="{ expandAll: true }"
        />
      </FormItem>
      <FormItem :label="t('users.role')">
        <Select
          v-model="query.roleId"
          clearable
          :options="roleCatalog.map((item) => ({ label: item.name, value: item.id }))"
          :placeholder="t('filter.all')"
          style="width: 10rem"
        />
      </FormItem>
      <FormItem :label="t('filter.status')">
        <Select
          v-model="query.status"
          clearable
          :options="[
            { label: t('filter.enabled'), value: 1 },
            { label: t('filter.disabled'), value: 0 },
          ]"
          :placeholder="t('filter.all')"
          style="width: 8rem"
        />
      </FormItem>
      <FormItem>
        <Space>
          <Button theme="primary" type="submit">{{ t('action.query') }}</Button>
          <Button @click="onReset">{{ t('action.reset') }}</Button>
          <Button :loading="exporting" @click="onExport">{{ t('action.export') }}</Button>
          <TableColumnPicker table="users" />
          <Button
            v-access="'user:delete'"
            :disabled="!selectedKeys.length"
            theme="danger"
            @click="onBatchDelete"
          >
            {{ t('action.deleteSelected') }}{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
          </Button>
          <Button v-access="'user:create'" :loading="importing" @click="pickImportFile">
            {{ t('action.import') }}
          </Button>
          <Button v-access="'user:create'" theme="primary" @click="onCreate">
            {{ t('action.create') }}
          </Button>
        </Space>
      </FormItem>
    </Form>

    <Table
      :columns="columns"
      :data="items"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      :selected-row-keys="selectedKeys"
      :sort="tableSortValue"
      @page-change="onPageChange"
      @select-change="onSelectChange"
      @sort-change="onSortChange"
    >
      <template #deptId="{ row }">{{ deptLabel(row.deptId) }}</template>
      <template #roleIds="{ row }">{{ roleLabel(row.roleIds) }}</template>
      <template #status="{ row }">
        <Tag :theme="row.status === 1 ? 'success' : 'default'">
          {{ row.status === 1 ? t('filter.enabled') : t('filter.disabled') }}
        </Tag>
      </template>
      <template #actions="{ row }">
        <Space>
          <Button v-if="hasAnyAction('user:update')" theme="primary" variant="text" @click="onEdit(row)">
            编辑
          </Button>
          <Button
            v-if="hasAnyAction('user:delete')"
            theme="danger"
            variant="text"
            @click="onDelete(row)"
          >
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

    <UserFormModal
      ref="formModal"
      v-model:open="modalOpen"
      :record="editing"
      :roles="roleCatalog"
      :tree="catalog"
      @submit="onSubmit"
    />
  </TdPage>
</template>
