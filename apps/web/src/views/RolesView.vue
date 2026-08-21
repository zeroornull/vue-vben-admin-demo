<script setup lang="ts">
defineOptions({ name: 'RolesView' })

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
  message,
} from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

import { formatActionCodes, menuTitleByCode } from '@app/access/catalog'
import { useDisplayTitle } from '@/i18n/display'
import { useAccess } from '@/access/use-access'
import { createRole, deleteRole, deleteRoles, getRoleList, updateRole } from '@/api/system/role'
import AntdPage from '@/components/AntdPage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { HOME_PATH } from '@/constants/auth'
import { syncAccessRoutes } from '@/router/dynamic-access'
import { useAuthStore } from '@/stores/auth'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import { tableColumnKey } from '@app/tables/columns'
import { batchDeleteDoneText, nextPageAfterDeletes, normalizeIds } from '@app/tables/batch'
import { csvFileName } from '@app/tables/csv'
import { TABLE_PAGE_SIZE_OPTIONS } from '@app/tables/page-size'
import { nextTableQuery, TABLE_SORT_FIELDS, tableColumnSort } from '@app/tables/sort'

import RoleFormModal from './roles/RoleFormModal.vue'
import { importCsvSummary, parseRoleCsv, ROLE_CSV_MAX_ROWS, roleCsvRow, rolesToCsv } from './roles/csv'
import {
  batchDeleteRolesConfirmText,
  ROLE_BATCH_DELETE_MAX,
} from './roles/query'
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
const rowSelection = computed(() => {
  if (!hasAnyAction('role:delete')) return undefined
  return {
    selectedRowKeys: selectedKeys.value,
    onChange(keys: (string | number)[]) {
      selectedKeys.value = normalizeIds(keys).slice(0, ROLE_BATCH_DELETE_MAX)
    },
  }
})
const query = reactive<{ code: string; name: string; status: UserStatus | undefined }>({
  code: '',
  name: '',
  status: undefined,
})

const columns = computed<TableColumnsType<SystemRole>>(() => {
  const allowed = TABLE_SORT_FIELDS.roles
  const current = sort.value
  const base: TableColumnsType<SystemRole> = [
    { dataIndex: 'name', title: columnTitle('roles', 'name'), ...tableColumnSort('name', allowed, current) },
    { dataIndex: 'code', title: columnTitle('roles', 'code'), width: 140, ...tableColumnSort('code', allowed, current) },
    { dataIndex: 'menuCodes', title: columnTitle('roles', 'menuCodes'), width: 200 },
    { dataIndex: 'actionCodes', title: columnTitle('roles', 'actionCodes'), width: 240 },
    { dataIndex: 'userCount', title: columnTitle('roles', 'userCount'), width: 80 },
    { dataIndex: 'status', title: columnTitle('roles', 'status'), width: 100, ...tableColumnSort('status', allowed, current) },
    { dataIndex: 'remark', title: columnTitle('roles', 'remark') },
    { dataIndex: 'createTime', title: columnTitle('roles', 'createTime'), width: 180, ...tableColumnSort('createTime', allowed, current) },
  ]
  const visible = base.filter((column) => tableColumns.isVisible('roles', tableColumnKey(column)))
  if (!hasAnyAction('role:update', 'role:delete')) return visible
  return [...visible, { key: 'actions', title: t('column.actions'), width: 160 }]
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
    if (failed.length) message.warning(importCsvSummary(created, failed))
    else message.success(importCsvSummary(created, failed))
  } catch {
    // 读文件失败少见；接口失败已记进 failed
  } finally {
    importing.value = false
  }
}

function onTableChange(pagination: TablePaginationConfig, _filters: unknown, sorter: unknown) {
  const next = nextTableQuery(
    page.value,
    pageSize.value,
    sort.value,
    pagination,
    sorter,
    TABLE_SORT_FIELDS.roles,
  )
  page.value = next.page
  tablePage.setPageSize('roles', next.pageSize)
  tableSort.setSort('roles', next.sort)
  void load()
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
    message.success('已保存')
  } else {
    await createRole(values)
    message.success('已创建')
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

function onBatchDelete() {
  const ids = normalizeIds(selectedKeys.value)
  if (!ids.length) return
  Modal.confirm({
    content: batchDeleteRolesConfirmText(ids.length),
    okText: '删除',
    okType: 'danger',
    title: t('confirm.batchDelete'),
    async onOk() {
      const result = await deleteRoles(ids)
      message.success(batchDeleteDoneText(result.deleted, '个角色', result.skipped))
      const deletedOnPage = items.value.filter((item) => ids.includes(item.id)).length
      page.value = nextPageAfterDeletes(page.value, items.value.length, deletedOnPage)
      selectedKeys.value = []
      await load()
      await refreshSessionAccess()
    },
  })
}

function onDelete(row: SystemRole) {
  if ((row.userCount ?? 0) > 0) {
    message.warning('请先移走拥有该角色的用户')
    return
  }
  Modal.confirm({
    content: `确定删除 ${row.name}？编码 ${row.code} 会一起去掉。`,
    okText: '删除',
    okType: 'danger',
    title: t('confirm.deleteRole'),
    async onOk() {
      await deleteRole(row.id)
      message.success('已删除')
      selectedKeys.value = selectedKeys.value.filter((id) => id !== row.id)
      page.value = nextPageAfterDeletes(page.value, items.value.length, 1)
      await load()
      await refreshSessionAccess()
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
    <p class="hint">
      菜单决定能不能进页面，操作码决定新建/编辑/删除。勾了操作会自动带上对应菜单。<code>vben</code> / <code>admin</code> 走 <code>biz-admin</code>，<code>user</code> 走 <code>viewer</code>。
    </p>
    <Form layout="inline" @finish="onSearch">
      <FormItem label="名称">
        <Input v-model:value="query.name" allow-clear placeholder="模糊匹配" />
      </FormItem>
      <FormItem label="编码">
        <Input v-model:value="query.code" allow-clear placeholder="如 editor" />
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
          <Button html-type="submit" type="primary">查询</Button>
          <Button @click="onReset">重置</Button>
          <Button :loading="exporting" @click="onExport">导出</Button>
          <TableColumnPicker table="roles" />
          <Button v-access="'role:create'" :loading="importing" @click="pickImportFile">导入</Button>
          <Button
            v-access="'role:delete'"
            :disabled="!selectedKeys.length"
            danger
            @click="onBatchDelete"
          >
            删除选中{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
          </Button>
          <Button v-access="'role:create'" type="primary" @click="onCreate">新建</Button>
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
        showTotal: (count) => `共 ${count} 条`,
        total,
      }"
      row-key="id"
      :row-selection="rowSelection"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'menuCodes'">
          {{ menuLabels(toRole(record).menuCodes) }}
        </template>
        <template v-else-if="column.dataIndex === 'actionCodes'">
          {{ formatActionCodes(toRole(record).actionCodes) }}
        </template>
        <template v-else-if="column.dataIndex === 'userCount'">
          {{ toRole(record).userCount ?? 0 }}
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Tag :color="toRole(record).status === 1 ? 'success' : 'default'">
            {{ toRole(record).status === 1 ? '启用' : '禁用' }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button v-access="'role:update'" type="link" @click="onEdit(toRole(record))">编辑</Button>
            <Button v-access="'role:delete'" danger type="link" @click="onDelete(toRole(record))">删除</Button>
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

    <RoleFormModal ref="formModal" v-model:open="modalOpen" :record="editing" @submit="onSubmit" />
  </AntdPage>
</template>

<style scoped>
.hint {
  margin: 0;
  opacity: 0.72;
  font-size: 0.9rem;
}
</style>
