<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import {
  ElButton,
  ElCheckbox,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElSelect,
} from 'element-plus'
import { reactive, ref, watch } from 'vue'

import { actionsForMenu, groupMenuCatalog } from '@app/access/catalog'
import { dropActionsForMenu, grantParentMenus, uniqueCodes } from '@app/access/resolve'

import { useUnsavedForm } from '@/forms/use-unsaved'

import { emptyRoleForm, formFromRole, validateRoleForm } from './query'
import type { RoleFormValues, SystemRole } from './types'

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
const rules: FormRules<RoleFormValues> = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 32, message: '角色名称最多 32 个字', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
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

function onBeforeClose(done: () => void) {
  if (!unsaved.confirmDiscard()) return
  emit('update:open', false)
  done()
}

defineExpose({ confirmDiscard: unsaved.confirmDiscard, isDirty: unsaved.isDirty })

function onMenuChange(code: string, checked: boolean) {
  if (checked) {
    form.menuCodes = uniqueCodes([...form.menuCodes, code])
    return
  }
  form.menuCodes = form.menuCodes.filter((item) => item !== code)
  form.actionCodes = dropActionsForMenu(form.actionCodes, code)
}

function onActionChange(code: string, checked: boolean) {
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
  <ElDialog
    :before-close="onBeforeClose"
    :model-value="open"
    :title="record ? '编辑角色' : '新建角色'"
    destroy-on-close
    width="640"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElFormItem label="角色名称" prop="name">
        <ElInput v-model="form.name" :maxlength="32" placeholder="显示名" />
      </ElFormItem>
      <ElFormItem label="编码" prop="code">
        <ElInput
          v-model="form.code"
          :disabled="Boolean(record)"
          placeholder="如 editor，不能用 admin / user"
        />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSelect v-model="form.status">
          <ElOption :value="1" label="启用" />
          <ElOption :value="0" label="禁用" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="菜单与操作" prop="menuCodes">
        <div class="perms">
          <div v-for="(group, index) in menuGroups" :key="group.title ?? index" class="menu-group">
            <p v-if="group.title">{{ group.title }}</p>
            <div v-for="menu in group.items" :key="menu.code" class="menu-block">
              <ElCheckbox
                :model-value="form.menuCodes.includes(menu.code)"
                @change="(value) => onMenuChange(menu.code, Boolean(value))"
              >
                {{ menu.title }}
              </ElCheckbox>
              <div v-if="actionsForMenu(menu.code).length" class="actions">
                <ElCheckbox
                  v-for="action in actionsForMenu(menu.code)"
                  :key="action.code"
                  :model-value="form.actionCodes.includes(action.code)"
                  @change="(value) => onActionChange(action.code, Boolean(value))"
                >
                  {{ action.title }}
                </ElCheckbox>
              </div>
            </div>
          </div>
        </div>
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
