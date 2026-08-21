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
import { toParentOptions } from '@/views/depts/query'
import type { SystemDept } from '@/views/depts/types'
import type { SystemRole } from '@/views/roles/types'

import { emptyUserForm, formFromUser, validateUserForm } from './query'
import type { SystemUser, UserFormValues } from './types'

const props = defineProps<{
  open: boolean
  record: SystemUser | null
  roles: SystemRole[]
  tree: SystemDept[]
}>()

const emit = defineEmits<{
  submit: [value: UserFormValues]
  'update:open': [value: boolean]
}>()

const formRef = ref<FormInstance>()
const form = reactive<UserFormValues>(emptyUserForm())
const unsaved = useUnsavedForm(() => form, () => props.open)
const rules: FormRules<UserFormValues> = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 32, message: '用户名最多 32 个字', trigger: 'blur' },
  ],
}
const treeData = computed(() => toElementTree(toParentOptions(props.tree)))
const deptValue = computed({
  get() {
    return form.deptId ?? undefined
  },
  set(value: string | undefined) {
    form.deptId = value ?? null
  },
})

watch(
  () => [props.open, props.record] as const,
  ([open, record]) => {
    if (!open) return
    Object.assign(form, record ? formFromUser(record) : emptyUserForm())
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
  const checked = validateUserForm(form)
  if (!checked.ok) {
    throw new Error(checked.message)
  }
  emit('submit', checked.value)
}
</script>

<template>
  <ElDialog
    :before-close="onBeforeClose"
    :model-value="open"
    :title="record ? '编辑用户' : '新建用户'"
    destroy-on-close
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElFormItem label="用户名" prop="name">
        <ElInput v-model="form.name" :maxlength="32" placeholder="显示名" />
      </ElFormItem>
      <ElFormItem label="部门" prop="deptId">
        <ElTreeSelect
          v-model="deptValue"
          check-strictly
          clearable
          default-expand-all
          :data="treeData"
          placeholder="可选，空则未分配"
        />
      </ElFormItem>
      <ElFormItem label="业务角色" prop="roleIds">
        <ElSelect v-model="form.roleIds" clearable multiple placeholder="可选，与登录权限无关">
          <ElOption
            v-for="item in roles"
            :key="item.id"
            :label="`${item.name} (${item.code})`"
            :value="item.id"
          />
        </ElSelect>
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
