<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import { NButton, NForm, NFormItem, NInput, NModal, NSelect, NSpace, NTreeSelect } from 'naive-ui'
import { computed, reactive, ref, watch } from 'vue'

import { useUnsavedForm } from '@/forms/use-unsaved'
import { toNaiveTree } from '@/views/depts/naive-tree'
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

const formRef = ref<FormInst>()
const form = reactive<UserFormValues>(emptyUserForm())
const unsaved = useUnsavedForm(() => form, () => props.open)
const rules: FormRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 32, message: '用户名最多 32 个字', trigger: 'blur' },
  ],
}
const treeData = computed(() => toNaiveTree(toParentOptions(props.tree)))
const deptValue = computed({
  get() {
    return form.deptId
  },
  set(value: string | null) {
    form.deptId = value
  },
})
const roleOptions = computed(() =>
  props.roles.map((item) => ({ label: `${item.name} (${item.code})`, value: item.id })),
)

watch(
  () => [props.open, props.record] as const,
  ([open, record]) => {
    if (!open) return
    Object.assign(form, record ? formFromUser(record) : emptyUserForm())
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
  const checked = validateUserForm(form)
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
    :title="record ? '编辑用户' : '新建用户'"
    @update:show="onUpdateShow"
  >
    <NForm ref="formRef" :model="form" :rules="rules">
      <NFormItem label="用户名" path="name">
        <NInput v-model:value="form.name" :maxlength="32" placeholder="显示名" />
      </NFormItem>
      <NFormItem label="部门" path="deptId">
        <NTreeSelect
          v-model:value="deptValue"
          clearable
          default-expand-all
          :options="treeData"
          placeholder="可选，空则未分配"
        />
      </NFormItem>
      <NFormItem label="业务角色" path="roleIds">
        <NSelect
          v-model:value="form.roleIds"
          clearable
          multiple
          :options="roleOptions"
          placeholder="可选，与登录权限无关"
        />
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
