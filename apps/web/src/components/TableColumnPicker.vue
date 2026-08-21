<script setup lang="ts">
import { computed } from 'vue'
import { Button, Checkbox, Popover } from 'ant-design-vue'

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
  <Popover placement="bottomLeft" trigger="click">
    <template #content>
      <div class="col-panel">
        <Checkbox
          v-for="key in spec.optional"
          :key="key"
          :checked="tableColumns.isVisible(table, key)"
          @change="tableColumns.toggle(table, key)"
        >
          {{ columnTitle(table, key, spec.labels[key]) }}
        </Checkbox>
        <Button type="link" @click="tableColumns.reset(table)">{{ t('column.reset') }}</Button>
      </div>
    </template>
    <Button>{{ t('column.picker') }}</Button>
  </Popover>
</template>

<style scoped>
.col-panel {
  display: grid;
  gap: 0.35rem;
  min-width: 8rem;
}
</style>
