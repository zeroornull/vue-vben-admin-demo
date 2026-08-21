<script setup lang="ts">
import type { FormInstanceFunctions, FormRules } from 'tdesign-vue-next'
import { Button, Dialog, Form, FormItem, Input, Select, Textarea, TreeSelect } from 'tdesign-vue-next'
import { computed, reactive, ref, watch } from 'vue'

import { useUnsavedForm } from '@/forms/use-unsaved'
import { toTdesignTree } from '@/views/depts/tdesign-tree'

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

const formRef = ref<FormInstanceFunctions>()
const form = reactive<DeptFormValues>(emptyDeptForm())
const unsaved = useUnsavedForm(() => form, () => props.open)
const rules: FormRules<DeptFormValues> = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { max: 32, message: '部门名称最多 32 个字', trigger: 'blur' },
  ],
}

const title = computed(() => {
  if (props.record) return '编辑部门'
  return props.parentId ? '新增下级' : '新建部门'
})

const treeData = computed(() =>
  toTdesignTree(
    toParentOptions(
      props.tree,
      disabledParentIds(flattenDepts(props.tree), props.record?.id ?? null),
    ),
  ),
)

const parentValue = computed({
  get() {
    return form.parentId ?? undefined
  },
  set(value: string | undefined) {
    form.parentId = value ?? null
  },
})

watch(
  () => [props.open, props.record, props.parentId] as const,
  ([open, record, parentId]) => {
    if (!open) return
    Object.assign(form, record ? formFromDept(record) : emptyDeptForm(parentId))
    formRef.value?.clearValidate()
    void unsaved.capture()
  },
)

function close() {
  if (!unsaved.confirmDiscard()) return
  emit('update:open', false)
}

function onUpdateVisible(visible: boolean) {
  if (visible) return
  close()
}

defineExpose({ confirmDiscard: unsaved.confirmDiscard, isDirty: unsaved.isDirty })

async function onOk() {
  const result = await formRef.value?.validate()
  if (result !== true) return
  const checked = validateDeptForm(form)
  if (!checked.ok) {
    throw new Error(checked.message)
  }
  emit('submit', checked.value)
}
</script>

<template>
  <Dialog
    :close-on-overlay-click="false"
    :header="title"
    :visible="open"
    width="32rem"
    @update:visible="onUpdateVisible"
  >
    <Form ref="formRef" :data="form" :rules="rules">
      <FormItem label="上级部门" name="parentId">
        <TreeSelect
          v-model="parentValue"
          clearable
          :data="treeData"
          placeholder="空则为根部门"
          :tree-props="{ expandAll: true }"
        />
      </FormItem>
      <FormItem label="部门名称" name="name">
        <Input v-model="form.name" :maxlength="32" placeholder="同级不可重名" />
      </FormItem>
      <FormItem label="状态" name="status">
        <Select
          v-model="form.status"
          :options="[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]"
        />
      </FormItem>
      <FormItem label="备注" name="remark">
        <Textarea v-model="form.remark" :autosize="{ minRows: 3 }" placeholder="可选" />
      </FormItem>
    </Form>
    <template #footer>
      <Button @click="close">取消</Button>
      <Button theme="primary" @click="onOk">确定</Button>
    </template>
  </Dialog>
</template>
