<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue'
import { Form, FormItem, Input, Modal, Select, TreeSelect } from 'ant-design-vue'
import { computed, reactive, ref, watch } from 'vue'

import {
  disabledParentIds,
  emptyDeptForm,
  flattenDepts,
  formFromDept,
  toParentOptions,
  validateDeptForm,
} from './query'
import type { DeptFormValues, SystemDept } from './types'

const props = defineProps<{
  open: boolean
  parentId: string | null
  record: SystemDept | null
  tree: SystemDept[]
}>()

const emit = defineEmits<{
  submit: [value: DeptFormValues]
  'update:open': [value: boolean]
}>()

const formRef = ref<FormInstance>()
const form = reactive<DeptFormValues>(emptyDeptForm())
const rules = {
  name: [
    { required: true, message: '请输入部门名称' },
    { max: 32, message: '部门名称最多 32 个字' },
  ],
}

const title = computed(() => {
  if (props.record) return '编辑部门'
  return props.parentId ? '新增下级' : '新建部门'
})

const parentOptions = computed(() =>
  toParentOptions(
    props.tree,
    disabledParentIds(flattenDepts(props.tree), props.record?.id ?? null),
  ),
)

watch(
  () => [props.open, props.record, props.parentId] as const,
  ([open, record, parentId]) => {
    if (!open) return
    Object.assign(form, record ? formFromDept(record) : emptyDeptForm(parentId))
    formRef.value?.clearValidate()
  },
)

function close() {
  emit('update:open', false)
}

async function onOk() {
  await formRef.value?.validate()
  const checked = validateDeptForm(form)
  if (!checked.ok) {
    throw new Error(checked.message)
  }
  emit('submit', checked.value)
}
</script>

<template>
  <Modal :open="open" :title="title" destroy-on-close @cancel="close" @ok="onOk">
    <Form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <FormItem label="上级部门" name="parentId">
        <TreeSelect
          :value="form.parentId ?? undefined"
          allow-clear
          :tree-data="parentOptions"
          placeholder="空则为根部门"
          tree-default-expand-all
          @update:value="form.parentId = $event ?? null"
        />
      </FormItem>
      <FormItem label="部门名称" name="name">
        <Input v-model:value="form.name" :maxlength="32" placeholder="同级不可重名" />
      </FormItem>
      <FormItem label="状态" name="status">
        <Select
          v-model:value="form.status"
          :options="[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]"
        />
      </FormItem>
      <FormItem label="备注" name="remark">
        <Input.TextArea v-model:value="form.remark" :rows="3" placeholder="可选" />
      </FormItem>
    </Form>
  </Modal>
</template>
