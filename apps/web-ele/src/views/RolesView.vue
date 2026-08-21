<script setup lang="ts">
defineOptions({ name: 'RolesView' })

import { formatActionCodes, menuTitleByCode } from '@app/access/catalog'
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
  vLoading,
} from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

import { useAccess } from '@/access/use-access'
import { createRole, deleteRole, deleteRoles, getRoleList, updateRole } from '@/api/system/role'
import ElePage from '@/components/ElePage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import { HOME_PATH } from '@/constants/auth'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useDisplayTitle } from '@/i18n/display'
import { syncAccessRoutes } from '@/router/dynamic-access'
import { useAuthStore } from '@/stores/auth'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import { elementSortOrder, nextElementPage, nextElementTableQuery } from '@/tables/element-sort'
import { batchDeleteDoneText, nextPageAfterDeletes, normalizeIds } from '@app/tables/batch'
import { csvFileName } from '@app/tables/csv'
import { TABLE_PAGE_SIZES } from '@app/tables/page-size'
import { TABLE_SORT_FIELDS } from '@app/tables/sort'

import RoleFormModal from './roles/RoleFormModal.vue'
import { importCsvSummary, parseRoleCsv, ROLE_CSV_MAX_ROWS, roleCsvRow, rolesToCsv } from './roles/csv'
import { batchDeleteRolesConfirmText, ROLE_BATCH_DELETE_MAX } from './roles/query'
import type { RoleFormValues, SystemRole, UserStatus } from './roles/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()
const { columnTitle } = useDisplayTitle()
const loading = ref(false)
const exporting = ref(false)
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const items = ref<SystemRole[]>([])
const total = ref(0)
const page = ref(1)
const tablePage = useTablePageStore()
const tableSort = useTableSortStore()
const tableColumns = useTableColumnsStore()
const pageSize = computed(() => tablePage.pageSizeOf('roles'))
const sort = computed(() => tableSort.sortOf('roles'))
const modalOpen = ref(false)
const formModal = ref<UnsavedFormHandle | null>(null)
const editing = ref<SystemRole | null>(null)
const { hasAnyAction } = useAccess()
const selectedKeys = ref<string[]>([])
const query = reactive<{ code: string; name: string; status: UserStatus | undefined }>({
  code: '',
  name: '',
  status: undefined,
})
const defaultSort = computed(() => {
  if (!sort.value) return undefined
  return { prop: sort.value.field, order: elementSortOrder(sort.value.order) }
})

async function load() {
  loading.value = true
  try {
    const result = await getRoleList({
      code: query.code.trim(),
      name: query.name.trim(),
      page: page.value,
      pageSize: pageSize.value,
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

function onSearch() {
  page.value = 1
  void load()
}

function onReset() {
  query.code = ''
  query.name = ''
  query.status = undefined
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
    const result = await getRoleList({
      code: query.code.trim(),
      name: query.name.trim(),
      page: 1,
      pageSize: ROLE_CSV_MAX_ROWS,
      sortField: sort.value?.field ?? '',
      sortOrder: sort.value?.order ?? '',
      status: query.status === 0 || query.status === 1 ? query.status : '',
    })
    const csv = rolesToCsv(
      result.items.map((role) =>
        roleCsvRow(role, menuLabels(role.menuCodes), formatActionCodes(role.actionCodes)),
      ),
    )
    downloadCsv(csv, csvFileName('roles', new Date()))
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
  if (!file || !hasAnyAction('role:create')) return
  importing.value = true
  try {
    const parsed = parseRoleCsv(await file.text())
    let created = 0
    const failed = [...parsed.rejected]
    for (const row of parsed.accepted) {
      try {
        await createRole(row.value, { skipErrorToast: true, skipLoadingBar: true })
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

function onPageChange(nextPage: number) {
  const paging = nextElementPage(page.value, pageSize.value, nextPage, pageSize.value)
  page.value = paging.page
  void load()
}

function onSizeChange(nextSize: number) {
  const paging = nextElementPage(page.value, pageSize.value, page.value, nextSize)
  page.value = paging.page
  tablePage.setPageSize('roles', paging.pageSize)
  void load()
}

function onSortChange(payload: { order: string | null; prop: string | null }) {
  const next = nextElementTableQuery(
    page.value,
    pageSize.value,
    sort.value,
    { current: page.value, pageSize: pageSize.value },
    payload,
    TABLE_SORT_FIELDS.roles,
  )
  page.value = next.page
  tablePage.setPageSize('roles', next.pageSize)
  tableSort.setSort('roles', next.sort)
  void load()
}

function onSelectionChange(rows: SystemRole[]) {
  selectedKeys.value = normalizeIds(rows.map((row) => row.id)).slice(0, ROLE_BATCH_DELETE_MAX)
}

function onCreate() {
  editing.value = null
  modalOpen.value = true
}

function onEdit(row: SystemRole) {
  editing.value = row
  modalOpen.value = true
}

async function onSubmit(values: RoleFormValues) {
  if (editing.value) {
    await updateRole(editing.value.id, values)
    ElMessage.success('已保存')
  } else {
    await createRole(values)
    ElMessage.success('已创建')
  }
  modalOpen.value = false
  await load()
  await refreshSessionAccess()
}

async function refreshSessionAccess() {
  try {
    await authStore.fetchUserInfo()
    syncAccessRoutes(router)
    const current = route.name
    if (typeof current === 'string' && current !== 'home' && current !== 'root' && !router.hasRoute(current)) {
      await router.replace(HOME_PATH)
    }
  } catch {
    // 改的是别人的角色时，当前会话刷新失败不必挡保存
  }
}

function menuLabels(codes: string[]) {
  return codes.map((code) => menuTitleByCode(code)).join('、') || '无'
}

function toRole(record: object): SystemRole {
  return record as SystemRole
}

async function onBatchDelete() {
  const ids = normalizeIds(selectedKeys.value)
  if (!ids.length) return
  try {
    await ElMessageBox.confirm(batchDeleteRolesConfirmText(ids.length), t('confirm.batchDelete'), {
      confirmButtonText: '删除',
      type: 'warning',
    })
  } catch {
    return
  }
  const result = await deleteRoles(ids)
  ElMessage.success(batchDeleteDoneText(result.deleted, '个角色', result.skipped))
  const deletedOnPage = items.value.filter((item) => ids.includes(item.id)).length
  page.value = nextPageAfterDeletes(page.value, items.value.length, deletedOnPage)
  selectedKeys.value = []
  await load()
  await refreshSessionAccess()
}

async function onDelete(row: SystemRole) {
  if ((row.userCount ?? 0) > 0) {
    ElMessage.warning('请先移走拥有该角色的用户')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定删除 ${row.name}？编码 ${row.code} 会一起去掉。`,
      t('confirm.deleteRole'),
      { confirmButtonText: '删除', type: 'warning' },
    )
  } catch {
    return
  }
  await deleteRole(row.id)
  ElMessage.success('已删除')
  selectedKeys.value = selectedKeys.value.filter((id) => id !== row.id)
  page.value = nextPageAfterDeletes(page.value, items.value.length, 1)
  await load()
  await refreshSessionAccess()
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
    <p class="hint">
      菜单决定能不能进页面，操作码决定新建/编辑/删除。勾了操作会自动带上对应菜单。<code>vben</code> / <code>admin</code> 走 <code>biz-admin</code>，<code>user</code> 走 <code>viewer</code>。
    </p>
    <ElForm inline @submit.prevent="onSearch">
      <ElFormItem label="名称">
        <ElInput v-model="query.name" clearable placeholder="模糊匹配" />
      </ElFormItem>
      <ElFormItem label="编码">
        <ElInput v-model="query.code" clearable placeholder="如 editor" />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSelect v-model="query.status" clearable placeholder="全部" style="width: 8rem">
          <ElOption :value="1" label="启用" />
          <ElOption :value="0" label="禁用" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton native-type="submit" type="primary">查询</ElButton>
        <ElButton @click="onReset">重置</ElButton>
        <ElButton :loading="exporting" @click="onExport">导出</ElButton>
        <TableColumnPicker table="roles" />
        <ElButton v-access="'role:create'" :loading="importing" @click="pickImportFile">导入</ElButton>
        <ElButton
          v-access="'role:delete'"
          :disabled="!selectedKeys.length"
          type="danger"
          @click="onBatchDelete"
        >
          删除选中{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
        </ElButton>
        <ElButton v-access="'role:create'" type="primary" @click="onCreate">新建</ElButton>
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
      <ElTableColumn v-if="hasAnyAction('role:delete')" type="selection" width="48" />
      <ElTableColumn
        v-if="tableColumns.isVisible('roles', 'name')"
        :label="columnTitle('roles', 'name')"
        prop="name"
        sortable="custom"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('roles', 'code')"
        :label="columnTitle('roles', 'code')"
        prop="code"
        sortable="custom"
        width="140"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('roles', 'menuCodes')"
        :label="columnTitle('roles', 'menuCodes')"
        prop="menuCodes"
        width="200"
      >
        <template #default="{ row }">{{ menuLabels(toRole(row).menuCodes) }}</template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('roles', 'actionCodes')"
        :label="columnTitle('roles', 'actionCodes')"
        prop="actionCodes"
        width="240"
      >
        <template #default="{ row }">{{ formatActionCodes(toRole(row).actionCodes) }}</template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('roles', 'userCount')"
        :label="columnTitle('roles', 'userCount')"
        prop="userCount"
        width="80"
      >
        <template #default="{ row }">{{ toRole(row).userCount ?? 0 }}</template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('roles', 'status')"
        :label="columnTitle('roles', 'status')"
        prop="status"
        sortable="custom"
        width="100"
      >
        <template #default="{ row }">
          <ElTag :type="toRole(row).status === 1 ? 'success' : 'info'">
            {{ toRole(row).status === 1 ? '启用' : '禁用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('roles', 'remark')"
        :label="columnTitle('roles', 'remark')"
        prop="remark"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('roles', 'createTime')"
        :label="columnTitle('roles', 'createTime')"
        prop="createTime"
        sortable="custom"
        width="180"
      />
      <ElTableColumn
        v-if="hasAnyAction('role:update', 'role:delete')"
        :label="t('column.actions')"
        width="160"
      >
        <template #default="{ row }">
          <ElButton v-access="'role:update'" link type="primary" @click="onEdit(toRole(row))">编辑</ElButton>
          <ElButton v-access="'role:delete'" link type="danger" @click="onDelete(toRole(row))">删除</ElButton>
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

    <RoleFormModal ref="formModal" v-model:open="modalOpen" :record="editing" @submit="onSubmit" />
  </ElePage>
</template>

<style scoped>
.hint {
  margin: 0;
  opacity: 0.72;
  font-size: 0.9rem;
}
</style>
