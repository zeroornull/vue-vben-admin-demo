<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import { NButton, NForm, NFormItem, NInput, NModal, NSelect, NSpace, NTreeSelect } from 'naive-ui'
import { computed, reactive, ref, watch } from 'vue'

import { useUnsavedForm } from '@/forms/use-unsaved'
import { toNaiveTree } from '@/views/depts/naive-tree'

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

const formRef = ref<FormInst>()
const form = reactive<DeptFormValues>(emptyDeptForm())
const unsaved = useUnsavedForm(() => form, () => props.open)
const rules: FormRules = {
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
  toNaiveTree(
    toParentOptions(
      props.tree,
      disabledParentIds(flattenDepts(props.tree), props.record?.id ?? null),
    ),
  ),
)

const parentValue = computed({
  get() {
    return form.parentId
  },
  set(value: string | null) {
    form.parentId = value
  },
})

watch(
  () => [props.open, props.record, props.parentId] as const,
  ([open, record, parentId]) => {
    if (!open) return
    Object.assign(form, record ? formFromDept(record) : emptyDeptForm(parentId))
    formRef.value?.restoreValidation()
    void unsaved.capture()
  },
)

function close() {
  if (!unsaved.confirmDiscard()) return
  emit('update:open', false)
}

function onUpdateShow(show: boolean) {
  if (show) return
  close()
}

defineExpose({ confirmDiscard: unsaved.confirmDiscard, isDirty: unsaved.isDirty })

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
  <NModal
    :mask-closable="false"
    preset="card"
    :show="open"
    style="width: 32rem"
    :title="title"
    @update:show="onUpdateShow"
  >
    <NForm ref="formRef" :model="form" :rules="rules">
      <NFormItem label="上级部门" path="parentId">
        <NTreeSelect
          v-model:value="parentValue"
          clearable
          default-expand-all
          :options="treeData"
          placeholder="空则为根部门"
        />
      </NFormItem>
      <NFormItem label="部门名称" path="name">
        <NInput v-model:value="form.name" :maxlength="32" placeholder="同级不可重名" />
      </NFormItem>
      <NFormItem label="状态" path="status">
        <NSelect
          v-model:value="form.status"
          :options="[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]"
        />
      </NFormItem>
      <NFormItem label="备注" path="remark">
        <NInput v-model:value="form.remark" :rows="3" placeholder="可选" type="textarea" />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="close">取消</NButton>
        <NButton type="primary" @click="onOk">确定</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
