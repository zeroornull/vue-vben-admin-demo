<script setup lang="ts">
defineOptions({ name: 'ProfileView' })

import { ElButton, ElDescriptions, ElDescriptionsItem, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteLeave } from 'vue-router'

import ElePage from '@/components/ElePage.vue'
import { useUnsavedForm } from '@/forms/use-unsaved'
import { useAuthStore } from '@/stores/auth'

import {
  emptyPasswordForm,
  formFromProfile,
  PASSWORD_MAX,
  profileRows,
  REAL_NAME_MAX,
  validatePasswordChange,
  validateProfileForm,
} from './profile/query'

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)
const rows = computed(() => (userInfo.value ? profileRows(userInfo.value) : []))
const form = reactive(formFromProfile({ realName: userInfo.value?.realName ?? '' }))
const passwordForm = reactive(emptyPasswordForm())
const saving = ref(false)
const savingPassword = ref(false)
const unsaved = useUnsavedForm(() => ({
  confirmPassword: passwordForm.confirmPassword,
  currentPassword: passwordForm.currentPassword,
  newPassword: passwordForm.newPassword,
  realName: form.realName,
}))

function resetForm() {
  form.realName = userInfo.value?.realName ?? ''
  Object.assign(passwordForm, emptyPasswordForm())
}

watch(
  () => userInfo.value?.realName,
  (name) => {
    if (name === undefined) return
    form.realName = name
    void unsaved.capture()
  },
)

async function onSave() {
  const checked = validateProfileForm(form)
  if (!checked.ok) {
    ElMessage.error(checked.message)
    return
  }
  saving.value = true
  try {
    await authStore.updateProfile(checked.value.realName)
    ElMessage.success('已保存显示名')
    await unsaved.capture()
  } catch {
    // 失败由全局错误条提示
  } finally {
    saving.value = false
  }
}

async function onSavePassword() {
  const checked = validatePasswordChange(passwordForm)
  if (!checked.ok) {
    ElMessage.error(checked.message)
    return
  }
  savingPassword.value = true
  try {
    await authStore.changePassword(checked.value)
    Object.assign(passwordForm, emptyPasswordForm())
    ElMessage.success('已改密码，下次登录和解锁用新密码')
    await unsaved.capture()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '改密失败')
  } finally {
    savingPassword.value = false
  }
}

onBeforeRouteLeave(() => {
  if (!unsaved.confirmDiscard()) return false
  resetForm()
  void unsaved.capture()
  return true
})

onMounted(() => {
  void unsaved.capture()
  window.addEventListener('beforeunload', unsaved.onBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', unsaved.onBeforeUnload)
})
</script>

<template>
  <ElePage>
    <p class="lead">
      显示名只写登录会话，不是系统用户表里的 Alice / Bob。水印上的名字会跟着变。改密写在 Vite mock
      进程里，刷新开发服务会回到 123456。
    </p>
    <ElForm inline @submit.prevent="onSave">
      <ElFormItem label="显示名">
        <ElInput v-model="form.realName" :maxlength="REAL_NAME_MAX" style="width: 12rem" />
      </ElFormItem>
      <ElFormItem>
        <ElButton :loading="saving" native-type="submit" type="primary">保存</ElButton>
      </ElFormItem>
    </ElForm>
    <ElForm inline @submit.prevent="onSavePassword">
      <ElFormItem label="当前密码">
        <ElInput
          v-model="passwordForm.currentPassword"
          autocomplete="current-password"
          show-password
          style="width: 10rem"
          type="password"
        />
      </ElFormItem>
      <ElFormItem label="新密码">
        <ElInput
          v-model="passwordForm.newPassword"
          :maxlength="PASSWORD_MAX"
          autocomplete="new-password"
          show-password
          style="width: 10rem"
          type="password"
        />
      </ElFormItem>
      <ElFormItem label="确认新密码">
        <ElInput
          v-model="passwordForm.confirmPassword"
          :maxlength="PASSWORD_MAX"
          autocomplete="new-password"
          show-password
          style="width: 10rem"
          type="password"
        />
      </ElFormItem>
      <ElFormItem>
        <ElButton :loading="savingPassword" native-type="submit">改密</ElButton>
      </ElFormItem>
    </ElForm>
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem v-for="row in rows" :key="row.key" :label="row.label">
        {{ row.value }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElePage>
</template>

<style scoped>
.lead {
  margin: 0;
  max-width: 40rem;
}
</style>
