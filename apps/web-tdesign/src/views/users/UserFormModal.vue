<script setup lang="ts">
import type { FormInstanceFunctions, FormRules } from 'tdesign-vue-next'
import { Button, Dialog, Form, FormItem, Input, Select, Textarea, TreeSelect } from 'tdesign-vue-next'
import { computed, reactive, ref, watch } from 'vue'

import { useUnsavedForm } from '@/forms/use-unsaved'
import { toTdesignTree } from '@/views/depts/tdesign-tree'
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

const formRef = ref<FormInstanceFunctions>()
const form = reactive<UserFormValues>(emptyUserForm())
const unsaved = useUnsavedForm(() => form, () => props.open)
const rules: FormRules<UserFormValues> = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 32, message: '用户名最多 32 个字', trigger: 'blur' },
  ],
}
const treeData = computed(() => toTdesignTree(toParentOptions(props.tree)))
const deptValue = computed({
  get() {
    return form.deptId ?? undefined
  },
  set(value: string | undefined) {
    form.deptId = value ?? null
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
  const checked = validateUserForm(form)
  if (!checked.ok) {
    throw new Error(checked.message)
  }
  emit('submit', checked.value)
}
</script>

<template>
  <Dialog
    :close-on-overlay-click="false"
    :header="record ? '编辑用户' : '新建用户'"
    :visible="open"
    width="32rem"
    @update:visible="onUpdateVisible"
  >
    <Form ref="formRef" :data="form" :rules="rules">
      <FormItem label="用户名" name="name">
        <Input v-model="form.name" :maxlength="32" placeholder="显示名" />
      </FormItem>
      <FormItem label="部门" name="deptId">
        <TreeSelect
          v-model="deptValue"
          clearable
          :data="treeData"
          placeholder="可选，空则未分配"
          :tree-props="{ expandAll: true }"
        />
      </FormItem>
      <FormItem label="业务角色" name="roleIds">
        <Select
          v-model="form.roleIds"
          clearable
          multiple
          :options="roleOptions"
          placeholder="可选，与登录权限无关"
        />
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
