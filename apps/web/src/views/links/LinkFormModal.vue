<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue'
import { Form, FormItem, Input, Modal, Select } from 'ant-design-vue'
import { reactive, ref, watch } from 'vue'

import { useUnsavedForm } from '@/forms/use-unsaved'

import { emptyLinkForm, formFromLink, validateLinkForm, type EmbedLink, type LinkFormValues } from './query'

const props = defineProps<{
  open: boolean
  record: EmbedLink | null
}>()

const emit = defineEmits<{
  submit: [value: LinkFormValues]
  'update:open': [value: boolean]
}>()

const formRef = ref<FormInstance>()
const form = reactive<LinkFormValues>(emptyLinkForm())
const unsaved = useUnsavedForm(() => form, () => props.open)

watch(
  () => [props.open, props.record] as const,
  ([open, record]) => {
    if (!open) return
    Object.assign(form, record ? formFromLink(record) : emptyLinkForm())
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
  const checked = validateLinkForm(form)
  if (!checked.ok) {
    throw new Error(checked.message)
  }
  emit('submit', checked.value)
}
</script>

<template>
  <Modal
    :open="open"
    :title="record ? '编辑外链' : '新建外链'"
    destroy-on-close
    @cancel="close"
    @ok="onOk"
  >
    <Form ref="formRef" layout="vertical" :model="form">
      <FormItem label="名称" name="title" :rules="[{ required: true, message: '请输入名称' }]">
        <Input v-model:value="form.title" :maxlength="16" placeholder="侧栏上的标题" />
      </FormItem>
      <FormItem label="编码" name="code" :rules="[{ required: true, message: '请输入编码' }]">
        <Input v-model:value="form.code" :disabled="Boolean(record)" placeholder="如 docs" />
      </FormItem>
      <FormItem label="地址" name="iframeSrc" :rules="[{ required: true, message: '请输入地址' }]">
        <Input v-model:value="form.iframeSrc" placeholder="/embed-demo.html 或 https://…" />
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
    </Form>
  </Modal>
</template>
