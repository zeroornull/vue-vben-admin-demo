<script setup lang="ts">
defineOptions({ name: 'UsersView' })

import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTreeSelect,
  vLoading,
} from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { getDeptList } from '@/api/system/dept'
import { getRoleList } from '@/api/system/role'
import { createUser, deleteUser, deleteUsers, getUserList, updateUser } from '@/api/system/user'
import { useAccess } from '@/access/use-access'
import ElePage from '@/components/ElePage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useDisplayTitle } from '@/i18n/display'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import { elementSortOrder, nextElementPage, nextElementTableQuery } from '@/tables/element-sort'
import { TABLE_PAGE_SIZES } from '@app/tables/page-size'
import { TABLE_SORT_FIELDS } from '@app/tables/sort'
import { toElementTree } from '@/views/depts/element-tree'
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
const deptTree = computed(() => toElementTree(toParentOptions(catalog.value)))
const defaultSort = computed(() => {
  if (!sort.value) return undefined
  return { prop: sort.value.field, order: elementSortOrder(sort.value.order) }
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
    if (failed.length) ElMessage.warning(importCsvSummary(created, failed))
    else ElMessage.success(importCsvSummary(created, failed))
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
  const paging = nextElementPage(page.value, pageSize.value, nextPage, pageSize.value)
  page.value = paging.page
  void load()
}

function onSizeChange(nextSize: number) {
  const paging = nextElementPage(page.value, pageSize.value, page.value, nextSize)
  page.value = paging.page
  tablePage.setPageSize('users', paging.pageSize)
  void load()
}

function onSortChange(payload: { order: string | null; prop: string | null }) {
  const next = nextElementTableQuery(
    page.value,
    pageSize.value,
    sort.value,
    { current: page.value, pageSize: pageSize.value },
    payload,
    TABLE_SORT_FIELDS.users,
  )
  page.value = next.page
  tablePage.setPageSize('users', next.pageSize)
  tableSort.setSort('users', next.sort)
  void load()
}

function onSelectionChange(rows: SystemUser[]) {
  selectedKeys.value = normalizeUserIds(rows.map((row) => row.id)).slice(0, USER_BATCH_DELETE_MAX)
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
    ElMessage.success('已保存')
  } else {
    await createUser(values)
    ElMessage.success('已创建')
  }
  modalOpen.value = false
  await load()
}

function toUser(row: object): SystemUser {
  return row as SystemUser
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
    await ElMessageBox.confirm(batchDeleteConfirmText(ids.length), t('confirm.batchDelete'), {
      confirmButtonText: t('confirm.delete'),
      type: 'warning',
    })
  } catch {
    return
  }
  const result = await deleteUsers(ids)
  ElMessage.success(t('toast.deletedPeople', { count: result.deleted }))
  const deletedOnPage = items.value.filter((item) => ids.includes(item.id)).length
  page.value = nextPageAfterDeletes(page.value, items.value.length, deletedOnPage)
  selectedKeys.value = []
  await load()
}

async function onDelete(row: SystemUser) {
  try {
    await ElMessageBox.confirm(t('confirm.deleteUserNamed', { name: row.name }), t('confirm.deleteUser'), {
      confirmButtonText: t('confirm.delete'),
      type: 'warning',
    })
  } catch {
    return
  }
  await deleteUser(row.id)
  ElMessage.success(t('toast.deleted'))
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
  <ElePage>
    <ElForm inline @submit.prevent="onSearch">
      <ElFormItem :label="t('users.name')">
        <ElInput v-model="query.name" clearable :placeholder="t('filter.fuzzy')" />
      </ElFormItem>
      <ElFormItem :label="t('users.dept')">
        <ElTreeSelect
          v-model="query.deptId"
          check-strictly
          clearable
          default-expand-all
          :data="deptTree"
          :placeholder="t('filter.includeChildren')"
          style="width: 12rem"
        />
      </ElFormItem>
      <ElFormItem :label="t('users.role')">
        <ElSelect v-model="query.roleId" clearable :placeholder="t('filter.all')" style="width: 10rem">
          <ElOption
            v-for="item in roleCatalog"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('filter.status')">
        <ElSelect v-model="query.status" clearable :placeholder="t('filter.all')" style="width: 8rem">
          <ElOption :value="1" :label="t('filter.enabled')" />
          <ElOption :value="0" :label="t('filter.disabled')" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton native-type="submit" type="primary">{{ t('action.query') }}</ElButton>
        <ElButton @click="onReset">{{ t('action.reset') }}</ElButton>
        <ElButton :loading="exporting" @click="onExport">{{ t('action.export') }}</ElButton>
        <TableColumnPicker table="users" />
        <ElButton
          v-access="'user:delete'"
          :disabled="!selectedKeys.length"
          type="danger"
          @click="onBatchDelete"
        >
          {{ t('action.deleteSelected') }}{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
        </ElButton>
        <ElButton v-access="'user:create'" :loading="importing" @click="pickImportFile">
          {{ t('action.import') }}
        </ElButton>
        <ElButton v-access="'user:create'" type="primary" @click="onCreate">
          {{ t('action.create') }}
        </ElButton>
      </ElFormItem>
    </ElForm>

    <ElTable
      v-loading="loading"
      :data="items"
      :default-sort="defaultSort"
      row-key="id"
      @selection-change="onSelectionChange"
      @sort-change="onSortChange"
    >
      <ElTableColumn v-if="hasAnyAction('user:delete')" type="selection" width="48" />
      <ElTableColumn
        v-if="tableColumns.isVisible('users', 'name')"
        :label="columnTitle('users', 'name')"
        prop="name"
        sortable="custom"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('users', 'deptId')"
        :label="columnTitle('users', 'deptId')"
        prop="deptId"
        width="140"
      >
        <template #default="{ row }">{{ deptLabel(row.deptId) }}</template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('users', 'roleIds')"
        :label="columnTitle('users', 'roleIds')"
        prop="roleIds"
        width="180"
      >
        <template #default="{ row }">{{ roleLabel(row.roleIds) }}</template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('users', 'status')"
        :label="columnTitle('users', 'status')"
        prop="status"
        sortable="custom"
        width="100"
      >
        <template #default="{ row }">
          <ElTag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? t('filter.enabled') : t('filter.disabled') }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('users', 'remark')"
        :label="columnTitle('users', 'remark')"
        prop="remark"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('users', 'createTime')"
        :label="columnTitle('users', 'createTime')"
        prop="createTime"
        sortable="custom"
        width="180"
      />
      <ElTableColumn
        v-if="hasAnyAction('user:update', 'user:delete')"
        :label="t('column.actions')"
        width="160"
      >
        <template #default="{ row }">
          <ElButton v-access="'user:update'" link type="primary" @click="onEdit(toUser(row))">编辑</ElButton>
          <ElButton v-access="'user:delete'" link type="danger" @click="onDelete(toUser(row))">删除</ElButton>
        </template>
      </ElTableColumn>
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

    <UserFormModal
      ref="formModal"
      v-model:open="modalOpen"
      :record="editing"
      :roles="roleCatalog"
      :tree="catalog"
      @submit="onSubmit"
    />
  </ElePage>
</template>
