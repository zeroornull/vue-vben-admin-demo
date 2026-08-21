<script setup lang="ts">
defineOptions({ name: 'ProfileView' })

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Form,
  FormItem,
  Input,
  InputPassword,
  message,
} from 'antdv-next'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteLeave } from 'vue-router'

import AntdvPage from '@/components/AntdvPage.vue'
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
    void message.error(checked.message)
    return
  }
  saving.value = true
  try {
    await authStore.updateProfile(checked.value.realName)
    void message.success('已保存显示名')
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
    void message.error(checked.message)
    return
  }
  savingPassword.value = true
  try {
    await authStore.changePassword(checked.value)
    Object.assign(passwordForm, emptyPasswordForm())
    void message.success('已改密码，下次登录和解锁用新密码')
    await unsaved.capture()
  } catch (error) {
    void message.error(error instanceof Error ? error.message : '改密失败')
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
  <AntdvPage>
    <p class="lead">
      显示名只写登录会话，不是系统用户表里的 Alice / Bob。水印上的名字会跟着变。改密写在 Vite mock
      进程里，刷新开发服务会回到 123456。
    </p>
    <Form layout="inline" @submit.prevent="onSave">
      <FormItem label="显示名">
        <Input v-model:value="form.realName" :maxlength="REAL_NAME_MAX" style="width: 12rem" />
      </FormItem>
      <FormItem>
        <Button :loading="saving" html-type="submit" type="primary">保存</Button>
      </FormItem>
    </Form>
    <Form layout="inline" @submit.prevent="onSavePassword">
      <FormItem label="当前密码">
        <InputPassword
          v-model:value="passwordForm.currentPassword"
          autocomplete="current-password"
          style="width: 10rem"
        />
      </FormItem>
      <FormItem label="新密码">
        <InputPassword
          v-model:value="passwordForm.newPassword"
          :maxlength="PASSWORD_MAX"
          autocomplete="new-password"
          style="width: 10rem"
        />
      </FormItem>
      <FormItem label="确认新密码">
        <InputPassword
          v-model:value="passwordForm.confirmPassword"
          :maxlength="PASSWORD_MAX"
          autocomplete="new-password"
          style="width: 10rem"
        />
      </FormItem>
      <FormItem>
        <Button :loading="savingPassword" html-type="submit">改密</Button>
      </FormItem>
    </Form>
    <Descriptions :column="1">
      <DescriptionsItem v-for="row in rows" :key="row.key" :label="row.label">
        {{ row.value }}
      </DescriptionsItem>
    </Descriptions>
  </AntdvPage>
</template>

<style scoped>
.lead {
  margin: 0;
  max-width: 40rem;
}
</style>
