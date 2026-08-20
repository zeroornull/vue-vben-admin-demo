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

import { getDeptList } from '@/api/system/dept'
import { getRoleList } from '@/api/system/role'
import { useAccess } from '@/access/use-access'
import { createUser, deleteUser, getUserList, updateUser } from '@/api/system/user'
import AntdPage from '@/components/AntdPage.vue'
import { deptNameById, flattenDepts, toParentOptions } from '@/views/depts/query'
import type { SystemDept } from '@/views/depts/types'
import { roleNameById } from '@/views/roles/query'
import type { SystemRole } from '@/views/roles/types'

import UserFormModal from './users/UserFormModal.vue'
import type { SystemUser, UserFormValues, UserStatus } from './users/types'

const loading = ref(false)
const items = ref<SystemUser[]>([])
const catalog = ref<SystemDept[]>([])
const roleCatalog = ref<SystemRole[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const modalOpen = ref(false)
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
  if (!hasAnyAction('user:update', 'user:delete')) return base
  return [...base, { key: 'actions', title: '操作', width: 160 }]
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
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载失败')
  } finally {
    loading.value = false
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
  try {
    if (editing.value) {
      await updateUser(editing.value.id, values)
      message.success('已保存')
    } else {
      await createUser(values)
      message.success('已创建')
    }
    modalOpen.value = false
    await load()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存失败')
    throw error
  }
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

onMounted(async () => {
  try {
    await loadCatalogs()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '部门或角色加载失败')
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

    <UserFormModal
      v-model:open="modalOpen"
      :record="editing"
      :roles="roleCatalog"
      :tree="catalog"
      @submit="onSubmit"
    />
  </AntdPage>
</template>
