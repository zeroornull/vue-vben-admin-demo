<script setup lang="ts">
defineOptions({ name: 'LinksView' })

import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import { Button, Form, FormItem, Input, Modal, Select, Space, Table, Tag, message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { useAccess } from '@/access/use-access'
import { createLink, deleteLink, getLinkList, updateLink } from '@/api/system/link'
import AntdPage from '@/components/AntdPage.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useLinksStore } from '@/stores/links'

import LinkFormModal from './links/LinkFormModal.vue'
import type { EmbedLink, LinkFormValues } from './links/query'

const linksStore = useLinksStore()
const loading = ref(false)
const items = ref<EmbedLink[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const modalOpen = ref(false)
const formModal = ref<UnsavedFormHandle | null>(null)
const editing = ref<EmbedLink | null>(null)
const { hasAnyAction } = useAccess()
const query = reactive<{ code: string; name: string; status: 0 | 1 | undefined }>({
  code: '',
  name: '',
  status: undefined,
})

const columns = computed<TableColumnsType<EmbedLink>>(() => {
  const base: TableColumnsType<EmbedLink> = [
    { dataIndex: 'title', title: '名称' },
    { dataIndex: 'code', title: '编码', width: 140 },
    { dataIndex: 'iframeSrc', title: '地址' },
    { dataIndex: 'status', title: '状态', width: 100 },
    { dataIndex: 'createTime', title: '创建时间', width: 180 },
  ]
  if (!hasAnyAction('link:update', 'link:delete')) return base
  return [...base, { key: 'actions', title: '操作', width: 160 }]
})

async function load() {
  loading.value = true
  try {
    const result = await getLinkList({
      code: query.code.trim(),
      name: query.name.trim(),
      page: page.value,
      pageSize: pageSize.value,
      status: query.status === 0 || query.status === 1 ? query.status : '',
    })
    items.value = result.items
    total.value = result.total
    await linksStore.pull()
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

function onEdit(row: EmbedLink) {
  editing.value = row
  modalOpen.value = true
}

async function onSubmit(values: LinkFormValues) {
  if (editing.value) {
    await updateLink(editing.value.id, values)
    message.success('已保存')
  } else {
    await createLink(values)
    message.success('已创建')
  }
  modalOpen.value = false
  await load()
}

function toLink(record: object): EmbedLink {
  return record as EmbedLink
}

function onDelete(row: EmbedLink) {
  Modal.confirm({
    content: `确定删除 ${row.title}？侧栏上的「${row.title}」会一起去掉。`,
    okText: '删除',
    okType: 'danger',
    title: '删除外链',
    async onOk() {
      await deleteLink(row.id)
      message.success('已删除')
      if (items.value.length === 1 && page.value > 1) page.value -= 1
      await load()
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
      外链是数据，不是新 Vue 页。启用后出现在侧栏，打开 <code>/embed/编码</code>，还是同一个 iframe 组件。要有「内嵌页」菜单才能看见。
    </p>
    <Form layout="inline" @finish="onSearch">
      <FormItem label="名称">
        <Input v-model:value="query.name" allow-clear placeholder="模糊匹配" />
      </FormItem>
      <FormItem label="编码">
        <Input v-model:value="query.code" allow-clear placeholder="如 docs" />
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
          <Button v-access="'link:create'" type="primary" @click="onCreate">新建</Button>
        </Space>
      </FormItem>
    </Form>
    <Table
      :columns="columns"
      :data-source="items"
      :loading="loading"
      :pagination="{ current: page, pageSize, showSizeChanger: true, total }"
      row-key="id"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <Tag :color="toLink(record).status === 1 ? 'success' : 'default'">
            {{ toLink(record).status === 1 ? '启用' : '禁用' }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button v-access="'link:update'" type="link" @click="onEdit(toLink(record))">编辑</Button>
            <Button v-access="'link:delete'" danger type="link" @click="onDelete(toLink(record))">删除</Button>
          </Space>
        </template>
      </template>
    </Table>
    <LinkFormModal ref="formModal" v-model:open="modalOpen" :record="editing" @submit="onSubmit" />
  </AntdPage>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  opacity: 0.75;
}
</style>
