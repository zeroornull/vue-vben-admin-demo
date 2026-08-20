<script setup lang="ts">
defineOptions({ name: 'DeptsView' })

import type { TableColumnsType } from 'ant-design-vue'
import { Button, Form, FormItem, Input, Modal, Select, Space, Table, Tag, message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'

import { useAccess } from '@/access/use-access'
import { createDept, deleteDept, getDeptList, updateDept } from '@/api/system/dept'
import AntdPage from '@/components/AntdPage.vue'

import DeptFormModal from './depts/DeptFormModal.vue'
import { filterDeptTree, flattenDepts } from './depts/query'
import type { DeptFormValues, SystemDept, UserStatus } from './depts/types'

const loading = ref(false)
const catalog = ref<SystemDept[]>([])
const modalOpen = ref(false)
const editing = ref<SystemDept | null>(null)
const createParentId = ref<string | null>(null)
const query = reactive<{ name: string; status: UserStatus | undefined }>({
  name: '',
  status: undefined,
})

const { hasAnyAction } = useAccess()

const tree = computed(() =>
  filterDeptTree(catalog.value, {
    name: query.name,
    status: query.status === 0 || query.status === 1 ? query.status : '',
  }),
)

const columns = computed<TableColumnsType<SystemDept>>(() => {
  const base: TableColumnsType<SystemDept> = [
    { dataIndex: 'name', title: '部门名称' },
    { dataIndex: 'userCount', title: '人数', width: 80 },
    { dataIndex: 'status', title: '状态', width: 100 },
    { dataIndex: 'remark', title: '备注' },
    { dataIndex: 'createTime', title: '创建时间', width: 180 },
  ]
  if (!hasAnyAction('dept:create', 'dept:update', 'dept:delete')) return base
  return [...base, { key: 'actions', title: '操作', width: 220 }]
})

const flat = computed(() => flattenDepts(catalog.value))

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
    title: '删除部门',
    async onOk() {
      await deleteDept(row.id)
      message.success('已删除')
      await load()
    },
  })
}

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
      default-expand-all-rows
      row-key="id"
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

    <DeptFormModal
      v-model:open="modalOpen"
      :parent-id="createParentId"
      :record="editing"
      :tree="catalog"
      @submit="onSubmit"
    />
  </AntdPage>
</template>
