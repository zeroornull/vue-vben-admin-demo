<script setup lang="ts">
defineOptions({ name: 'UsersView' })

import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import {
  Button,
  Checkbox,
  Form,
  FormItem,
  Input,
  Modal,
  Popover,
  Select,
  Space,
  Table,
  Tag,
  TreeSelect,
  message,
} from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { storeToRefs } from 'pinia'

import { getDeptList } from '@/api/system/dept'
import { getRoleList } from '@/api/system/role'
import { useAccess } from '@/access/use-access'
import { createUser, deleteUser, getUserList, updateUser } from '@/api/system/user'
import AntdPage from '@/components/AntdPage.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useTableColumnsStore } from '@/stores/table-columns'
import { deptNameById, flattenDepts, toParentOptions } from '@/views/depts/query'
import type { SystemDept } from '@/views/depts/types'
import { roleNameById } from '@/views/roles/query'
import type { SystemRole } from '@/views/roles/types'

import {
  USER_COLUMN_LABELS,
  USER_OPTIONAL_COLUMNS,
  isUserColumnVisible,
  userColumnKey,
} from './users/columns'
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
import type { SystemUser, UserFormValues, UserStatus } from './users/types'

const loading = ref(false)
const exporting = ref(false)
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const items = ref<SystemUser[]>([])
const catalog = ref<SystemDept[]>([])
const roleCatalog = ref<SystemRole[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const modalOpen = ref(false)
const formModal = ref<UnsavedFormHandle | null>(null)
const editing = ref<SystemUser | null>(null)
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
const { userColumns } = storeToRefs(tableColumns)
const names = computed(() => deptNameById(flattenDepts(catalog.value)))
const roleNames = computed(() => roleNameById(roleCatalog.value))

const columns = computed<TableColumnsType<SystemUser>>(() => {
  const base: TableColumnsType<SystemUser> = [
    { dataIndex: 'name', title: '用户名' },
    { dataIndex: 'deptId', title: '部门', width: 140 },
    { dataIndex: 'roleIds', title: '业务角色', width: 180 },
    { dataIndex: 'status', title: '状态', width: 100 },
    { dataIndex: 'remark', title: '备注' },
    { dataIndex: 'createTime', title: '创建时间', width: 180 },
  ]
  const visible = base.filter((column) =>
    isUserColumnVisible(userColumns.value, userColumnKey(column)),
  )
  if (!hasAnyAction('user:update', 'user:delete')) return visible
  return [...visible, { key: 'actions', title: '操作', width: 160 }]
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

function onTableChange(pagination: TablePaginationConfig) {
  page.value = pagination.current ?? 1
  pageSize.value = pagination.pageSize ?? 10
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
  if (!deptId) return '未分配'
  return names.value.get(deptId) ?? deptId
}

function roleLabel(roleIds: string[]) {
  if (!roleIds.length) return '未分配'
  return roleIds.map((id) => roleNames.value.get(id) ?? id).join('、')
}

function onDelete(row: SystemUser) {
  Modal.confirm({
    content: `确定删除 ${row.name}？内存 mock，刷新页面后种子数据会回来。`,
    okText: '删除',
    okType: 'danger',
    title: '删除用户',
    async onOk() {
      await deleteUser(row.id)
      message.success('已删除')
      if (items.value.length === 1 && page.value > 1) {
        page.value -= 1
      }
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
      <FormItem label="用户名">
        <Input v-model:value="query.name" allow-clear placeholder="模糊匹配" />
      </FormItem>
      <FormItem label="部门">
        <TreeSelect
          v-model:value="query.deptId"
          allow-clear
          :tree-data="toParentOptions(catalog)"
          placeholder="含下级"
          style="width: 12rem"
          tree-default-expand-all
        />
      </FormItem>
      <FormItem label="业务角色">
        <Select
          v-model:value="query.roleId"
          allow-clear
          placeholder="全部"
          style="width: 10rem"
          :options="roleCatalog.map((item) => ({ label: item.name, value: item.id }))"
        />
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
          <Popover placement="bottomLeft" trigger="click">
            <template #content>
              <div class="col-panel">
                <Checkbox
                  v-for="key in USER_OPTIONAL_COLUMNS"
                  :key="key"
                  :checked="isUserColumnVisible(userColumns, key)"
                  @change="tableColumns.toggleUser(key)"
                >
                  {{ USER_COLUMN_LABELS[key] }}
                </Checkbox>
                <Button type="link" @click="tableColumns.resetUsers">恢复默认</Button>
              </div>
            </template>
            <Button>列</Button>
          </Popover>
          <Button v-access="'user:create'" :loading="importing" @click="pickImportFile">导入</Button>
          <Button v-access="'user:create'" type="primary" @click="onCreate">新建</Button>
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
        showSizeChanger: true,
        showTotal: (count) => `共 ${count} 条`,
        total,
      }"
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
            {{ toUser(record).status === 1 ? '启用' : '禁用' }}
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

<style scoped>
.col-panel {
  display: grid;
  gap: 0.35rem;
  min-width: 8rem;
}
</style>
