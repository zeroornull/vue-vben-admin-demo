<script setup lang="ts">
import { computed } from 'vue'
import { Button, Checkbox, Popup } from 'tdesign-vue-next'

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
  <Popup placement="bottom-left" trigger="click">
    <Button>{{ t('column.picker') }}</Button>
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
        <Button theme="primary" variant="text" @click="tableColumns.reset(table)">
          {{ t('column.reset') }}
        </Button>
      </div>
    </template>
  </Popup>
</template>

<style scoped>
.col-panel {
  display: grid;
  gap: 0.35rem;
  min-width: 8rem;
}
</style>
