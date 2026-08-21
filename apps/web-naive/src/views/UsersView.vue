<script setup lang="ts">
defineOptions({ name: 'UsersView' })

import type { DataTableColumns, DataTableSortState } from 'naive-ui'
import {
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NTag,
  NTreeSelect,
} from 'naive-ui'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { getDeptList } from '@/api/system/dept'
import { getRoleList } from '@/api/system/role'
import { createUser, deleteUser, deleteUsers, getUserList, updateUser } from '@/api/system/user'
import { useAccess } from '@/access/use-access'
import { naiveDialog, naiveMessage } from '@/adapter/naive'
import NaivePage from '@/components/NaivePage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useDisplayTitle } from '@/i18n/display'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import { nextNaivePage, nextNaiveTableQuery } from '@/tables/naive-sort'
import { TABLE_PAGE_SIZES } from '@app/tables/page-size'
import { TABLE_SORT_FIELDS } from '@app/tables/sort'
import { toNaiveTree } from '@/views/depts/naive-tree'
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
const deptTree = computed(() => toNaiveTree(toParentOptions(catalog.value)))
const pagination = computed(() => ({
  itemCount: total.value,
  page: page.value,
  pageSize: pageSize.value,
  pageSizes: [...TABLE_PAGE_SIZES],
  prefix: ({ itemCount }: { itemCount?: number }) => t('table.total', { count: itemCount ?? 0 }),
  showSizePicker: true,
}))

function sortOrderOf(field: string) {
  return sort.value?.field === field ? sort.value.order : false
}

const columns = computed<DataTableColumns<SystemUser>>(() => {
  const allowed = TABLE_SORT_FIELDS.users
  const cols: DataTableColumns<SystemUser> = []
  if (hasAnyAction('user:delete')) {
    cols.push({ type: 'selection', width: 48 })
  }
  if (tableColumns.isVisible('users', 'name')) {
    cols.push({
      key: 'name',
      sorter: allowed.includes('name'),
      sortOrder: sortOrderOf('name'),
      title: columnTitle('users', 'name'),
    })
  }
  if (tableColumns.isVisible('users', 'deptId')) {
    cols.push({
      key: 'deptId',
      render: (row) => deptLabel(row.deptId),
      title: columnTitle('users', 'deptId'),
      width: 140,
    })
  }
  if (tableColumns.isVisible('users', 'roleIds')) {
    cols.push({
      key: 'roleIds',
      render: (row) => roleLabel(row.roleIds),
      title: columnTitle('users', 'roleIds'),
      width: 180,
    })
  }
  if (tableColumns.isVisible('users', 'status')) {
    cols.push({
      key: 'status',
      render: (row) =>
        h(NTag, { type: row.status === 1 ? 'success' : 'default' }, () =>
          row.status === 1 ? t('filter.enabled') : t('filter.disabled'),
        ),
      sorter: allowed.includes('status'),
      sortOrder: sortOrderOf('status'),
      title: columnTitle('users', 'status'),
      width: 100,
    })
  }
  if (tableColumns.isVisible('users', 'remark')) {
    cols.push({ key: 'remark', title: columnTitle('users', 'remark') })
  }
  if (tableColumns.isVisible('users', 'createTime')) {
    cols.push({
      key: 'createTime',
      sorter: allowed.includes('createTime'),
      sortOrder: sortOrderOf('createTime'),
      title: columnTitle('users', 'createTime'),
      width: 180,
    })
  }
  if (hasAnyAction('user:update', 'user:delete')) {
    cols.push({
      key: 'actions',
      render: (row) =>
        h(NSpace, null, () => [
          hasAnyAction('user:update')
            ? h(NButton, { text: true, type: 'primary', onClick: () => onEdit(row) }, () => '编辑')
            : null,
          hasAnyAction('user:delete')
            ? h(NButton, { text: true, type: 'error', onClick: () => void onDelete(row) }, () => '删除')
            : null,
        ]),
      title: t('column.actions'),
      width: 160,
    })
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
      naiveMessage.warning(`只导出了前 ${result.items.length} 条，筛选共 ${result.total} 条`)
    } else {
      naiveMessage.success(`已导出 ${result.items.length} 条`)
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
    if (failed.length) naiveMessage.warning(importCsvSummary(created, failed))
    else naiveMessage.success(importCsvSummary(created, failed))
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

function onPageChange(nextPage: number) {
  const paging = nextNaivePage(page.value, pageSize.value, nextPage, pageSize.value)
  page.value = paging.page
  void load()
}

function onSizeChange(nextSize: number) {
  const paging = nextNaivePage(page.value, pageSize.value, page.value, nextSize)
  page.value = paging.page
  tablePage.setPageSize('users', paging.pageSize)
  void load()
}

function onSortChange(sorter: DataTableSortState | DataTableSortState[] | null) {
  const first = Array.isArray(sorter) ? sorter[0] : sorter
  const next = nextNaiveTableQuery(
    page.value,
    pageSize.value,
    sort.value,
    { current: page.value, pageSize: pageSize.value },
    first ?? {},
    TABLE_SORT_FIELDS.users,
  )
  page.value = next.page
  tablePage.setPageSize('users', next.pageSize)
  tableSort.setSort('users', next.sort)
  void load()
}

function onChecked(keys: Array<string | number>) {
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
    naiveMessage.success('已保存')
  } else {
    await createUser(values)
    naiveMessage.success('已创建')
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
    await naiveDialog.warning({
      content: batchDeleteConfirmText(ids.length),
      positiveText: t('confirm.delete'),
      title: t('confirm.batchDelete'),
    })
  } catch {
    return
  }
  const result = await deleteUsers(ids)
  naiveMessage.success(t('toast.deletedPeople', { count: result.deleted }))
  const deletedOnPage = items.value.filter((item) => ids.includes(item.id)).length
  page.value = nextPageAfterDeletes(page.value, items.value.length, deletedOnPage)
  selectedKeys.value = []
  await load()
}

async function onDelete(row: SystemUser) {
  try {
    await naiveDialog.warning({
      content: t('confirm.deleteUserNamed', { name: row.name }),
      positiveText: t('confirm.delete'),
      title: t('confirm.deleteUser'),
    })
  } catch {
    return
  }
  await deleteUser(row.id)
  naiveMessage.success(t('toast.deleted'))
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
  <NaivePage>
    <NForm inline @submit.prevent="onSearch">
      <NFormItem :label="t('users.name')">
        <NInput v-model:value="query.name" clearable :placeholder="t('filter.fuzzy')" />
      </NFormItem>
      <NFormItem :label="t('users.dept')">
        <NTreeSelect
          v-model:value="query.deptId"
          clearable
          default-expand-all
          :options="deptTree"
          :placeholder="t('filter.includeChildren')"
          style="width: 12rem"
        />
      </NFormItem>
      <NFormItem :label="t('users.role')">
        <NSelect
          v-model:value="query.roleId"
          clearable
          :options="roleCatalog.map((item) => ({ label: item.name, value: item.id }))"
          :placeholder="t('filter.all')"
          style="width: 10rem"
        />
      </NFormItem>
      <NFormItem :label="t('filter.status')">
        <NSelect
          v-model:value="query.status"
          clearable
          :options="[
            { label: t('filter.enabled'), value: 1 },
            { label: t('filter.disabled'), value: 0 },
          ]"
          :placeholder="t('filter.all')"
          style="width: 8rem"
        />
      </NFormItem>
      <NFormItem>
        <NSpace>
          <NButton attr-type="submit" type="primary">{{ t('action.query') }}</NButton>
          <NButton @click="onReset">{{ t('action.reset') }}</NButton>
          <NButton :loading="exporting" @click="onExport">{{ t('action.export') }}</NButton>
          <TableColumnPicker table="users" />
          <NButton
            v-access="'user:delete'"
            :disabled="!selectedKeys.length"
            type="error"
            @click="onBatchDelete"
          >
            {{ t('action.deleteSelected') }}{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
          </NButton>
          <NButton v-access="'user:create'" :loading="importing" @click="pickImportFile">
            {{ t('action.import') }}
          </NButton>
          <NButton v-access="'user:create'" type="primary" @click="onCreate">
            {{ t('action.create') }}
          </NButton>
        </NSpace>
      </NFormItem>
    </NForm>

    <NDataTable
      :checked-row-keys="selectedKeys"
      :columns="columns"
      :data="items"
      :loading="loading"
      :pagination="pagination"
      remote
      :row-key="(row) => row.id"
      @update:checked-row-keys="onChecked"
      @update:page="onPageChange"
      @update:page-size="onSizeChange"
      @update:sorter="onSortChange"
    />

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
  </NaivePage>
</template>
