<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus'
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
const rules: FormRules<LinkFormValues> = {
  title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  iframeSrc: [{ required: true, message: '请输入地址', trigger: 'blur' }],
}

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

function onBeforeClose(done: () => void) {
  if (!unsaved.confirmDiscard()) return
  emit('update:open', false)
  done()
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
  <ElDialog
    :before-close="onBeforeClose"
    :model-value="open"
    :title="record ? '编辑外链' : '新建外链'"
    destroy-on-close
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElFormItem label="名称" prop="title">
        <ElInput v-model="form.title" :maxlength="16" placeholder="侧栏上的标题" />
      </ElFormItem>
      <ElFormItem label="编码" prop="code">
        <ElInput v-model="form.code" :disabled="Boolean(record)" placeholder="如 docs" />
      </ElFormItem>
      <ElFormItem label="地址" prop="iframeSrc">
        <ElInput v-model="form.iframeSrc" placeholder="/embed-demo.html 或 https://…" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSelect v-model="form.status">
          <ElOption :value="1" label="启用" />
          <ElOption :value="0" label="禁用" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="close">取消</ElButton>
      <ElButton type="primary" @click="onOk">确定</ElButton>
    </template>
  </ElDialog>
</template>
