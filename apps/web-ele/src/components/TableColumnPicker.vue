<script setup lang="ts">
import { computed } from 'vue'
import { ElButton, ElCheckbox, ElPopover } from 'element-plus'

import { useDisplayTitle } from '@/i18n/display'
import { useTableColumnsStore } from '@/stores/table-columns'
import { TABLE_COLUMN_SPECS, type TableColumnKey } from '@app/tables/columns'

const props = defineProps<{
  table: TableColumnKey
}>()

const tableColumns = useTableColumnsStore()
const spec = computed(() => TABLE_COLUMN_SPECS[props.table])
const { columnTitle, t } = useDisplayTitle()
</script>

<template>
  <ElPopover placement="bottom-start" trigger="click">
    <template #reference>
      <ElButton>{{ t('column.picker') }}</ElButton>
    </template>
    <div class="col-panel">
      <ElCheckbox
        v-for="key in spec.optional"
        :key="key"
        :model-value="tableColumns.isVisible(table, key)"
        @change="tableColumns.toggle(table, key)"
      >
        {{ columnTitle(table, key, spec.labels[key]) }}
      </ElCheckbox>
      <ElButton link type="primary" @click="tableColumns.reset(table)">{{ t('column.reset') }}</ElButton>
    </div>
  </ElPopover>
</template>

<style scoped>
.col-panel {
  display: grid;
  gap: 0.35rem;
  min-width: 8rem;
}
</style>
