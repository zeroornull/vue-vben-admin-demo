<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCheckbox, NPopover } from 'naive-ui'

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
  <NPopover placement="bottom-start" trigger="click">
    <template #trigger>
      <NButton>{{ t('column.picker') }}</NButton>
    </template>
    <div class="col-panel">
      <NCheckbox
        v-for="key in spec.optional"
        :key="key"
        :checked="tableColumns.isVisible(table, key)"
        @update:checked="tableColumns.toggle(table, key)"
      >
        {{ columnTitle(table, key, spec.labels[key]) }}
      </NCheckbox>
      <NButton text type="primary" @click="tableColumns.reset(table)">{{ t('column.reset') }}</NButton>
    </div>
  </NPopover>
</template>

<style scoped>
.col-panel {
  display: grid;
  gap: 0.35rem;
  min-width: 8rem;
}
</style>
