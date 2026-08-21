<script setup lang="ts">
defineOptions({ name: 'LinksView' })

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
import { onBeforeRouteLeave } from 'vue-router'

import { useAccess } from '@/access/use-access'
import { createLink, deleteLink, deleteLinks, getLinkList, updateLink } from '@/api/system/link'
import ElePage from '@/components/ElePage.vue'
import TableColumnPicker from '@/components/TableColumnPicker.vue'
import type { UnsavedFormHandle } from '@/forms/use-unsaved'
import { useDisplayTitle } from '@/i18n/display'
import { useLinksStore } from '@/stores/links'
import { useTableColumnsStore } from '@/stores/table-columns'
import { useTablePageStore } from '@/stores/table-page'
import { useTableSortStore } from '@/stores/table-sort'
import { elementSortOrder, nextElementPage, nextElementTableQuery } from '@/tables/element-sort'
import { batchDeleteDoneText, nextPageAfterDeletes, normalizeIds } from '@app/tables/batch'
import { csvFileName } from '@app/tables/csv'
import { TABLE_PAGE_SIZES } from '@app/tables/page-size'
import { TABLE_SORT_FIELDS } from '@app/tables/sort'

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
const query = reactive<{ code: string; name: string; status: 0 | 1 | undefined }>({
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
  tablePage.setPageSize('links', paging.pageSize)
  void load()
}

function onSortChange(payload: { order: string | null; prop: string | null }) {
  const next = nextElementTableQuery(
    page.value,
    pageSize.value,
    sort.value,
    { current: page.value, pageSize: pageSize.value },
    payload,
    TABLE_SORT_FIELDS.links,
  )
  page.value = next.page
  tablePage.setPageSize('links', next.pageSize)
  tableSort.setSort('links', next.sort)
  void load()
}

function onSelectionChange(rows: EmbedLink[]) {
  selectedKeys.value = normalizeIds(rows.map((row) => row.id)).slice(0, LINK_BATCH_DELETE_MAX)
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
    ElMessage.success('已保存')
  } else {
    await createLink(values)
    ElMessage.success('已创建')
  }
  modalOpen.value = false
  await load()
}

function toLink(record: object): EmbedLink {
  return record as EmbedLink
}

async function onBatchDelete() {
  const ids = normalizeIds(selectedKeys.value)
  if (!ids.length) return
  try {
    await ElMessageBox.confirm(batchDeleteLinksConfirmText(ids.length), t('confirm.batchDelete'), {
      confirmButtonText: '删除',
      type: 'warning',
    })
  } catch {
    return
  }
  const result = await deleteLinks(ids)
  ElMessage.success(batchDeleteDoneText(result.deleted, '条外链', result.skipped))
  const deletedOnPage = items.value.filter((item) => ids.includes(item.id)).length
  page.value = nextPageAfterDeletes(page.value, items.value.length, deletedOnPage)
  selectedKeys.value = []
  await load()
}

async function onDelete(row: EmbedLink) {
  try {
    await ElMessageBox.confirm(
      `确定删除 ${row.title}？侧栏上的「${row.title}」会一起去掉。`,
      t('confirm.deleteLink'),
      { confirmButtonText: '删除', type: 'warning' },
    )
  } catch {
    return
  }
  await deleteLink(row.id)
  ElMessage.success('已删除')
  selectedKeys.value = selectedKeys.value.filter((id) => id !== row.id)
  page.value = nextPageAfterDeletes(page.value, items.value.length, 1)
  await load()
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
      外链是数据，不是新 Vue 页。启用后出现在侧栏，打开 <code>/embed/编码</code>，还是同一个 iframe 组件。要有「内嵌页」菜单才能看见。
    </p>
    <ElForm inline @submit.prevent="onSearch">
      <ElFormItem label="名称">
        <ElInput v-model="query.name" clearable placeholder="模糊匹配" />
      </ElFormItem>
      <ElFormItem label="编码">
        <ElInput v-model="query.code" clearable placeholder="如 docs" />
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
        <TableColumnPicker table="links" />
        <ElButton v-access="'link:create'" :loading="importing" @click="pickImportFile">导入</ElButton>
        <ElButton
          v-access="'link:delete'"
          :disabled="!selectedKeys.length"
          type="danger"
          @click="onBatchDelete"
        >
          删除选中{{ selectedKeys.length ? ` (${selectedKeys.length})` : '' }}
        </ElButton>
        <ElButton v-access="'link:create'" type="primary" @click="onCreate">新建</ElButton>
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
      <ElTableColumn v-if="hasAnyAction('link:delete')" type="selection" width="48" />
      <ElTableColumn
        v-if="tableColumns.isVisible('links', 'title')"
        :label="columnTitle('links', 'title')"
        prop="title"
        sortable="custom"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('links', 'code')"
        :label="columnTitle('links', 'code')"
        prop="code"
        sortable="custom"
        width="140"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('links', 'iframeSrc')"
        :label="columnTitle('links', 'iframeSrc')"
        prop="iframeSrc"
      />
      <ElTableColumn
        v-if="tableColumns.isVisible('links', 'status')"
        :label="columnTitle('links', 'status')"
        prop="status"
        sortable="custom"
        width="100"
      >
        <template #default="{ row }">
          <ElTag :type="toLink(row).status === 1 ? 'success' : 'info'">
            {{ toLink(row).status === 1 ? '启用' : '禁用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="tableColumns.isVisible('links', 'createTime')"
        :label="columnTitle('links', 'createTime')"
        prop="createTime"
        sortable="custom"
        width="180"
      />
      <ElTableColumn
        v-if="hasAnyAction('link:update', 'link:delete')"
        :label="t('column.actions')"
        width="160"
      >
        <template #default="{ row }">
          <ElButton v-access="'link:update'" link type="primary" @click="onEdit(toLink(row))">编辑</ElButton>
          <ElButton v-access="'link:delete'" link type="danger" @click="onDelete(toLink(row))">删除</ElButton>
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

    <LinkFormModal ref="formModal" v-model:open="modalOpen" :record="editing" @submit="onSubmit" />
  </ElePage>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  opacity: 0.75;
}
</style>
