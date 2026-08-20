<script setup lang="ts">
import { computed } from 'vue'
import { Button, Checkbox, Popover } from 'ant-design-vue'

import { useTableColumnsStore } from '@/stores/table-columns'
import { TABLE_COLUMN_SPECS } from '@/tables/columns'
import type { TablePageKey } from '@/tables/page-size'

const props = defineProps<{
  table: TablePageKey
}>()

const tableColumns = useTableColumnsStore()
const spec = computed(() => TABLE_COLUMN_SPECS[props.table])
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
          {{ spec.labels[key] }}
        </Checkbox>
        <Button type="link" @click="tableColumns.reset(table)">恢复默认</Button>
      </div>
    </template>
    <Button>列</Button>
  </Popover>
</template>

<style scoped>
.col-panel {
  display: grid;
  gap: 0.35rem;
  min-width: 8rem;
}
</style>
