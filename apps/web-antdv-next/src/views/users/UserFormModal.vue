<script setup lang="ts">
import type { FormInstance } from 'antdv-next'
import { Form, FormItem, Input, Modal, Select, TextArea, TreeSelect } from 'antdv-next'
import { reactive, ref, watch } from 'vue'

import { useUnsavedForm } from '@/forms/use-unsaved'
import { toAntdvTree } from '@/views/depts/antdv-tree'
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
const rules = {
  name: [
    { required: true, message: '请输入用户名' },
    { max: 32, message: '用户名最多 32 个字' },
  ],
}

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
  <Modal
    :open="open"
    :title="record ? '编辑用户' : '新建用户'"
    destroy-on-hidden
    @cancel="close"
    @ok="onOk"
  >
    <Form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <FormItem label="用户名" name="name">
        <Input v-model:value="form.name" :maxlength="32" placeholder="显示名" />
      </FormItem>
      <FormItem label="部门" name="deptId">
        <TreeSelect
          :value="form.deptId ?? undefined"
          allow-clear
          :tree-data="toAntdvTree(toParentOptions(tree))"
          placeholder="可选，空则未分配"
          tree-default-expand-all
          @update:value="form.deptId = $event ?? null"
        />
      </FormItem>
      <FormItem label="业务角色" name="roleIds">
        <Select
          v-model:value="form.roleIds"
          allow-clear
          mode="multiple"
          placeholder="可选，与登录权限无关"
          :options="roles.map((item) => ({ label: `${item.name} (${item.code})`, value: item.id }))"
        />
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
        <TextArea v-model:value="form.remark" :rows="3" placeholder="可选" />
      </FormItem>
    </Form>
  </Modal>
</template>
