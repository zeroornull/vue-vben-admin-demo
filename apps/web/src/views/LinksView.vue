<script setup lang="ts">
defineOptions({ name: 'LinksView' })

import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue'
import { Button, Form, FormItem, Input, Modal, Select, Space, Table, Tag, message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { useAccess } from '@/access/use-access'
import { createLink, deleteLink, deleteLinks, getLinkList, updateLink } from '@/api/system/link'
import AntdPage from '@/components/AntdPage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useLinksStore } from '@/stores/links'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import { tableColumnKey } from '@app/tables/columns'
import { useDisplayTitle } from '@/i18n/display'
import { batchDeleteDoneText, nextPageAfterDeletes, normalizeIds } from '@app/tables/batch'
import { csvFileName } from '@app/tables/csv'
import { TABLE_PAGE_SIZE_OPTIONS } from '@app/tables/page-size'
import { nextTableQuery, TABLE_SORT_FIELDS, tableColumnSort } from '@app/tables/sort'

import { importCsvSummary, LINK_CSV_MAX_ROWS, linkCsvRow, linksToCsv, parseLinkCsv } from './links/csv'
import LinkFormModal from './links/LinkFormModal.vue'
import {
  batchDeleteLinksConfirmText,
  LINK_BATCH_DELETE_MAX,
  type EmbedLink,
  type LinkFormValues,
} from './links/query'

const linksStore = useLinksStore()
const { t } = useI18n()
const { columnTitle } = useDisplayTitle()
const loading = ref(false)
const exporting = ref(false)
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const items = ref<EmbedLink[]>([])
const total = ref(0)
const page = ref(1)
const tablePage = useTablePageStore()
const tableSort = useTableSortStore()
const tableColumns = useTableColumnsStore()
const pageSize = computed(() => tablePage.pageSizeOf('links'))
const sort = computed(() => tableSort.sortOf('links'))
const modalOpen = ref(false)
const formModal = ref<UnsavedFormHandle | null>(null)
const editing = ref<EmbedLink | null>(null)
const { hasAnyAction } = useAccess()
const selectedKeys = ref<string[]>([])
const rowSelection = computed(() => {
  if (!hasAnyAction('link:delete')) return undefined
  return {
    selectedRowKeys: selectedKeys.value,
    onChange(keys: (string | number)[]) {
      selectedKeys.value = normalizeIds(keys).slice(0, LINK_BATCH_DELETE_MAX)
    },
  }
})
const query = reactive<{ code: string; name: string; status: 0 | 1 | undefined }>({
  code: '',
  name: '',
  status: undefined,
})

const columns = computed<TableColumnsType<EmbedLink>>(() => {
  const allowed = TABLE_SORT_FIELDS.links
  const current = sort.value
  const base: TableColumnsType<EmbedLink> = [
    { dataIndex: 'title', title: columnTitle('links', 'title'), ...tableColumnSort('title', allowed, current) },
    { dataIndex: 'code', title: columnTitle('links', 'code'), width: 140, ...tableColumnSort('code', allowed, current) },
    { dataIndex: 'iframeSrc', title: columnTitle('links', 'iframeSrc') },
    { dataIndex: 'status', title: columnTitle('links', 'status'), width: 100, ...tableColumnSort('status', allowed, current) },
    { dataIndex: 'createTime', title: columnTitle('links', 'createTime'), width: 180, ...tableColumnSort('createTime', allowed, current) },
  ]
  const visible = base.filter((column) => tableColumns.isVisible('links', tableColumnKey(column)))
  if (!hasAnyAction('link:update', 'link:delete')) return visible
  return [...visible, { key: 'actions', title: t('column.actions'), width: 160 }]
})

async function load() {
  loading.value = true
  try {
    const result = await getLinkList({
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
    const result = await getLinkList({
      code: query.code.trim(),
      name: query.name.trim(),
      page: 1,
      pageSize: LINK_CSV_MAX_ROWS,
      sortField: sort.value?.field ?? '',
      sortOrder: sort.value?.order ?? '',
      status: query.status === 0 || query.status === 1 ? query.status : '',
    })
    downloadCsv(linksToCsv(result.items.map(linkCsvRow)), csvFileName('links', new Date()))
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
  if (!file || !hasAnyAction('link:create')) return
  importing.value = true
  try {
    const parsed = parseLinkCsv(await file.text())
    let created = 0
    const failed = [...parsed.rejected]
    for (const row of parsed.accepted) {
      try {
        await createLink(row.value, { skipErrorToast: true, skipLoadingBar: true })
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
    TABLE_SORT_FIELDS.links,
  )
  page.value = next.page
  tablePage.setPageSize('links', next.pageSize)
  tableSort.setSort('links', next.sort)
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

function onBatchDelete() {
  const ids = normalizeIds(selectedKeys.value)
  if (!ids.length) return
  Modal.confirm({
    content: batchDeleteLinksConfirmText(ids.length),
    okText: '删除',
    okType: 'danger',
    title: t('confirm.batchDelete'),
    async onOk() {
      const result = await deleteLinks(ids)
      message.success(batchDeleteDoneText(result.deleted, '条外链', result.skipped))
      const deletedOnPage = items.value.filter((item) => ids.includes(item.id)).length
      page.value = nextPageAfterDeletes(page.value, items.value.length, deletedOnPage)
      selectedKeys.value = []
      await load()
    },
  })
}

function onDelete(row: EmbedLink) {
  Modal.confirm({
    content: `确定删除 ${row.title}？侧栏上的「${row.title}」会一起去掉。`,
    okText: '删除',
    okType: 'danger',
    title: t('confirm.deleteLink'),
    async onOk() {
      await deleteLink(row.id)
      message.success('已删除')
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
          <Button :loading="exporting" @click="onExport">导出</Button>
          <TableColumnPicker table="links" />
          <Button v-access="'link:create'" :loading="importing" @click="pickImportFile">导入</Button>
          <Button
            v-access="'link:delete'"
            :disabled="!selectedKeys.length"
            danger
            @click="onBatchDelete"
          >
            删除选中{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
          </Button>
          <Button v-access="'link:create'" type="primary" @click="onCreate">新建</Button>
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
        total,
      }"
      row-key="id"
      :row-selection="rowSelection"
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
    <input
      ref="fileInput"
      accept=".csv,text/csv"
      hidden
      type="file"
      @change="onImportFile"
    />
    <LinkFormModal ref="formModal" v-model:open="modalOpen" :record="editing" @submit="onSubmit" />
  </AntdPage>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  opacity: 0.75;
}
</style>
