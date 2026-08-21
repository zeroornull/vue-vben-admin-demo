<script setup lang="ts">
defineOptions({ name: 'UsersView' })

import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  TreeSelect,
  message,
} from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { getDeptList } from '@/api/system/dept'
import { getRoleList } from '@/api/system/role'
import { useAccess } from '@/access/use-access'
import { createUser, deleteUser, deleteUsers, getUserList, updateUser } from '@/api/system/user'
import AntdPage from '@/components/AntdPage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import { TABLE_PAGE_SIZE_OPTIONS } from '@app/tables/page-size'
import { nextTableQuery, TABLE_SORT_FIELDS, tableColumnSort } from '@app/tables/sort'
import { deptNameById, flattenDepts, toParentOptions } from '@/views/depts/query'
import type { SystemDept } from '@/views/depts/types'
import { roleNameById } from '@/views/roles/query'
import type { SystemRole } from '@/views/roles/types'

import { tableColumnKey } from '@app/tables/columns'
import { useDisplayTitle } from '@/i18n/display'

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
const rowSelection = computed(() => {
  if (!hasAnyAction('user:delete')) return undefined
  return {
    selectedRowKeys: selectedKeys.value,
    onChange(keys: (string | number)[]) {
      selectedKeys.value = normalizeUserIds(keys).slice(0, USER_BATCH_DELETE_MAX)
    },
  }
})
const tableColumns = useTableColumnsStore()
const names = computed(() => deptNameById(flattenDepts(catalog.value)))
const roleNames = computed(() => roleNameById(roleCatalog.value))

const columns = computed<TableColumnsType<SystemUser>>(() => {
  const allowed = TABLE_SORT_FIELDS.users
  const current = sort.value
  const base: TableColumnsType<SystemUser> = [
    { dataIndex: 'name', title: columnTitle('users', 'name'), ...tableColumnSort('name', allowed, current) },
    { dataIndex: 'deptId', title: columnTitle('users', 'deptId'), width: 140 },
    { dataIndex: 'roleIds', title: columnTitle('users', 'roleIds'), width: 180 },
    { dataIndex: 'status', title: columnTitle('users', 'status'), width: 100, ...tableColumnSort('status', allowed, current) },
    { dataIndex: 'remark', title: columnTitle('users', 'remark') },
    { dataIndex: 'createTime', title: columnTitle('users', 'createTime'), width: 180, ...tableColumnSort('createTime', allowed, current) },
  ]
  const visible = base.filter((column) => tableColumns.isVisible('users', tableColumnKey(column)))
  if (!hasAnyAction('user:update', 'user:delete')) return visible
  return [...visible, { key: 'actions', title: t('column.actions'), width: 160 }]
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
    if (failed.length) message.warning(importCsvSummary(created, failed))
    else message.success(importCsvSummary(created, failed))
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

function onTableChange(pagination: TablePaginationConfig, _filters: unknown, sorter: unknown) {
  const next = nextTableQuery(
    page.value,
    pageSize.value,
    sort.value,
    pagination,
    sorter,
    TABLE_SORT_FIELDS.users,
  )
  page.value = next.page
  tablePage.setPageSize('users', next.pageSize)
  tableSort.setSort('users', next.sort)
  void load()
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
    message.success('已保存')
  } else {
    await createUser(values)
    message.success('已创建')
  }
  modalOpen.value = false
  await load()
}

function toUser(record: object): SystemUser {
  return record as SystemUser
}

function deptLabel(deptId: string | null) {
  if (!deptId) return t('filter.unassigned')
  return names.value.get(deptId) ?? deptId
}

function roleLabel(roleIds: string[]) {
  if (!roleIds.length) return t('filter.unassigned')
  return roleIds.map((id) => roleNames.value.get(id) ?? id).join('、')
}

function onBatchDelete() {
  const ids = normalizeUserIds(selectedKeys.value)
  if (!ids.length) return
  Modal.confirm({
    content: batchDeleteConfirmText(ids.length),
    okText: t('confirm.delete'),
    okType: 'danger',
    title: t('confirm.batchDelete'),
    async onOk() {
      const result = await deleteUsers(ids)
      message.success(t('toast.deletedPeople', { count: result.deleted }))
      const deletedOnPage = items.value.filter((item) => ids.includes(item.id)).length
      page.value = nextPageAfterDeletes(page.value, items.value.length, deletedOnPage)
      selectedKeys.value = []
      await load()
    },
  })
}

function onDelete(row: SystemUser) {
  Modal.confirm({
    content: t('confirm.deleteUserNamed', { name: row.name }),
    okText: t('confirm.delete'),
    okType: 'danger',
    title: t('confirm.deleteUser'),
    async onOk() {
      await deleteUser(row.id)
      message.success(t('toast.deleted'))
      selectedKeys.value = selectedKeys.value.filter((id) => id !== row.id)
      page.value = nextPageAfterDeletes(page.value, items.value.length, 1)
      await load()
    },
  })
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
  <AntdPage>
    <Form layout="inline" @finish="onSearch">
      <FormItem :label="t('users.name')">
        <Input v-model:value="query.name" allow-clear :placeholder="t('filter.fuzzy')" />
      </FormItem>
      <FormItem :label="t('users.dept')">
        <TreeSelect
          v-model:value="query.deptId"
          allow-clear
          :tree-data="toParentOptions(catalog)"
          :placeholder="t('filter.includeChildren')"
          style="width: 12rem"
          tree-default-expand-all
        />
      </FormItem>
      <FormItem :label="t('users.role')">
        <Select
          v-model:value="query.roleId"
          allow-clear
          :placeholder="t('filter.all')"
          style="width: 10rem"
          :options="roleCatalog.map((item) => ({ label: item.name, value: item.id }))"
        />
      </FormItem>
      <FormItem :label="t('filter.status')">
        <Select
          v-model:value="query.status"
          allow-clear
          :placeholder="t('filter.all')"
          style="width: 8rem"
          :options="[
            { label: t('filter.enabled'), value: 1 },
            { label: t('filter.disabled'), value: 0 },
          ]"
        />
      </FormItem>
      <FormItem>
        <Space>
          <Button html-type="submit" type="primary">{{ t('action.query') }}</Button>
          <Button @click="onReset">{{ t('action.reset') }}</Button>
          <Button :loading="exporting" @click="onExport">{{ t('action.export') }}</Button>
          <TableColumnPicker table="users" />
          <Button
            v-access="'user:delete'"
            :disabled="!selectedKeys.length"
            danger
            @click="onBatchDelete"
          >
            {{ t('action.deleteSelected') }}{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
          </Button>
          <Button v-access="'user:create'" :loading="importing" @click="pickImportFile">{{ t('action.import') }}</Button>
          <Button v-access="'user:create'" type="primary" @click="onCreate">{{ t('action.create') }}</Button>
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
        showTotal: (count) => t('table.total', { count }),
        total,
      }"
      :row-selection="rowSelection"
      row-key="id"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'deptId'">
          {{ deptLabel(toUser(record).deptId) }}
        </template>
        <template v-else-if="column.dataIndex === 'roleIds'">
          {{ roleLabel(toUser(record).roleIds) }}
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Tag :color="toUser(record).status === 1 ? 'success' : 'default'">
            {{ toUser(record).status === 1 ? t('filter.enabled') : t('filter.disabled') }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button v-access="'user:update'" type="link" @click="onEdit(toUser(record))">编辑</Button>
            <Button v-access="'user:delete'" danger type="link" @click="onDelete(toUser(record))">删除</Button>
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

    <UserFormModal
      ref="formModal"
      v-model:open="modalOpen"
      :record="editing"
      :roles="roleCatalog"
      :tree="catalog"
      @submit="onSubmit"
    />
  </AntdPage>
</template>

