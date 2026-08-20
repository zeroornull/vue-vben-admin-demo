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
import { useRoute, useRouter } from 'vue-router'

import { formatActionCodes, menuTitleByCode } from '@/access/catalog'
import { useAccess } from '@/access/use-access'
import { createRole, deleteRole, getRoleList, updateRole } from '@/api/system/role'
import AntdPage from '@/components/AntdPage.vue'
import { HOME_PATH } from '@/constants/auth'
import { syncAccessRoutes } from '@/router/dynamic-access'
import { useAuthStore } from '@/stores/auth'

import RoleFormModal from './roles/RoleFormModal.vue'
import type { RoleFormValues, SystemRole, UserStatus } from './roles/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)
const items = ref<SystemRole[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const modalOpen = ref(false)
const editing = ref<SystemRole | null>(null)
const { hasAnyAction } = useAccess()
const query = reactive<{ code: string; name: string; status: UserStatus | undefined }>({
  code: '',
  name: '',
  status: undefined,
})

const columns = computed<TableColumnsType<SystemRole>>(() => {
  const base: TableColumnsType<SystemRole> = [
    { dataIndex: 'name', title: '角色名称' },
    { dataIndex: 'code', title: '编码', width: 140 },
    { dataIndex: 'menuCodes', title: '菜单', width: 200 },
    { dataIndex: 'actionCodes', title: '操作权限', width: 240 },
    { dataIndex: 'userCount', title: '人数', width: 80 },
    { dataIndex: 'status', title: '状态', width: 100 },
    { dataIndex: 'remark', title: '备注' },
    { dataIndex: 'createTime', title: '创建时间', width: 180 },
  ]
  if (!hasAnyAction('role:update', 'role:delete')) return base
  return [...base, { key: 'actions', title: '操作', width: 160 }]
})

async function load() {
  loading.value = true
  try {
    const result = await getRoleList({
      code: query.code.trim(),
      name: query.name.trim(),
      page: page.value,
      pageSize: pageSize.value,
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

function onTableChange(pagination: TablePaginationConfig) {
  page.value = pagination.current ?? 1
  pageSize.value = pagination.pageSize ?? 10
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

function onDelete(row: SystemRole) {
  if ((row.userCount ?? 0) > 0) {
    message.warning('请先移走拥有该角色的用户')
    return
  }
  Modal.confirm({
    content: `确定删除 ${row.name}？编码 ${row.code} 会一起去掉。`,
    okText: '删除',
    okType: 'danger',
    title: '删除角色',
    async onOk() {
      await deleteRole(row.id)
      message.success('已删除')
      if (items.value.length === 1 && page.value > 1) {
        page.value -= 1
      }
      await load()
      await refreshSessionAccess()
    },
  })
}

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
        showSizeChanger: true,
        showTotal: (count) => `共 ${count} 条`,
        total,
      }"
      row-key="id"
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

    <RoleFormModal v-model:open="modalOpen" :record="editing" @submit="onSubmit" />
  </AntdPage>
</template>

<style scoped>
.hint {
  margin: 0;
  opacity: 0.72;
  font-size: 0.9rem;
}
</style>
