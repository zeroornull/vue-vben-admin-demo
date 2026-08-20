<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue'
import { Checkbox, Form, FormItem, Input, Modal, Select } from 'ant-design-vue'
import { reactive, ref, watch } from 'vue'

import { actionsForMenu, groupMenuCatalog } from '@/access/catalog'
import { dropActionsForMenu, grantParentMenus, uniqueCodes } from '@/access/resolve'

import { useUnsavedForm } from '@/forms/use-unsaved'

import { emptyRoleForm, formFromRole, validateRoleForm } from './query'
import type { SystemRole, RoleFormValues } from './types'

const props = defineProps<{
  open: boolean
  record: SystemRole | null
}>()

const emit = defineEmits<{
  submit: [value: RoleFormValues]
  'update:open': [value: boolean]
}>()

const formRef = ref<FormInstance>()
const form = reactive<RoleFormValues>(emptyRoleForm())
const unsaved = useUnsavedForm(() => form, () => props.open)
const menuGroups = groupMenuCatalog()
const rules = {
  name: [
    { required: true, message: '请输入角色名称' },
    { max: 32, message: '角色名称最多 32 个字' },
  ],
  code: [{ required: true, message: '请输入角色编码' }],
}

watch(
  () => [props.open, props.record] as const,
  ([open, record]) => {
    if (!open) return
    Object.assign(form, record ? formFromRole(record) : emptyRoleForm())
    formRef.value?.clearValidate()
    void unsaved.capture()
  },
)

function close() {
  if (!unsaved.confirmDiscard()) return
  emit('update:open', false)
}

defineExpose({ confirmDiscard: unsaved.confirmDiscard, isDirty: unsaved.isDirty })

function onMenuChange(code: string, event: { target: { checked?: boolean } }) {
  const checked = Boolean(event.target.checked)
  if (checked) {
    form.menuCodes = uniqueCodes([...form.menuCodes, code])
    return
  }
  form.menuCodes = form.menuCodes.filter((item) => item !== code)
  form.actionCodes = dropActionsForMenu(form.actionCodes, code)
}

function onActionChange(code: string, event: { target: { checked?: boolean } }) {
  const checked = Boolean(event.target.checked)
  const actionCodes = checked
    ? uniqueCodes([...form.actionCodes, code])
    : form.actionCodes.filter((item) => item !== code)
  form.actionCodes = actionCodes
  form.menuCodes = grantParentMenus(form.menuCodes, actionCodes)
}

async function onOk() {
  await formRef.value?.validate()
  const checked = validateRoleForm(form)
  if (!checked.ok) {
    throw new Error(checked.message)
  }
  emit('submit', checked.value)
}
</script>

<template>
  <Modal
    :open="open"
    :title="record ? '编辑角色' : '新建角色'"
    destroy-on-close
    :width="640"
    @cancel="close"
    @ok="onOk"
  >
    <Form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <FormItem label="角色名称" name="name">
        <Input v-model:value="form.name" :maxlength="32" placeholder="显示名" />
      </FormItem>
      <FormItem label="编码" name="code">
        <Input
          v-model:value="form.code"
          :disabled="Boolean(record)"
          placeholder="如 editor，不能用 admin / user"
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
      <FormItem label="菜单与操作" name="menuCodes">
        <div class="perms">
          <div v-for="(group, index) in menuGroups" :key="group.title ?? index" class="menu-group">
            <p v-if="group.title">{{ group.title }}</p>
            <div v-for="menu in group.items" :key="menu.code" class="menu-block">
              <Checkbox
                :checked="form.menuCodes.includes(menu.code)"
                @change="(event) => onMenuChange(menu.code, event)"
              >
                {{ menu.title }}
              </Checkbox>
              <div v-if="actionsForMenu(menu.code).length" class="actions">
                <Checkbox
                  v-for="action in actionsForMenu(menu.code)"
                  :key="action.code"
                  :checked="form.actionCodes.includes(action.code)"
                  @change="(event) => onActionChange(action.code, event)"
                >
                  {{ action.title }}
                </Checkbox>
              </div>
            </div>
          </div>
        </div>
      </FormItem>
      <FormItem label="备注" name="remark">
        <Input.TextArea v-model:value="form.remark" :rows="3" placeholder="可选" />
      </FormItem>
    </Form>
  </Modal>
</template>

<style scoped>
.perms {
  display: grid;
  gap: 0.85rem;
}

.menu-group {
  display: grid;
  gap: 0.45rem;
}

.menu-group > p {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.55;
}

.menu-block {
  display: grid;
  gap: 0.3rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  padding-left: 1.5rem;
}
</style>
