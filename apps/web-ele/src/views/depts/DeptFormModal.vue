<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElSelect,
  ElTreeSelect,
} from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'

import { useUnsavedForm } from '@/forms/use-unsaved'
import { toElementTree } from '@/views/depts/element-tree'

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
  toElementTree(
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

function onBeforeClose(done: () => void) {
  if (!unsaved.confirmDiscard()) return
  emit('update:open', false)
  done()
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
  <ElDialog :before-close="onBeforeClose" :model-value="open" :title="title" destroy-on-close>
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElFormItem label="上级部门" prop="parentId">
        <ElTreeSelect
          v-model="parentValue"
          check-strictly
          clearable
          default-expand-all
          :data="treeData"
          placeholder="空则为根部门"
        />
      </ElFormItem>
      <ElFormItem label="部门名称" prop="name">
        <ElInput v-model="form.name" :maxlength="32" placeholder="同级不可重名" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSelect v-model="form.status">
          <ElOption :value="1" label="启用" />
          <ElOption :value="0" label="禁用" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" :rows="3" placeholder="可选" type="textarea" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="close">取消</ElButton>
      <ElButton type="primary" @click="onOk">确定</ElButton>
    </template>
  </ElDialog>
</template>
