<script setup lang="ts">
defineOptions({ name: 'ProfileView' })

import { Button, Descriptions, DescriptionsItem, Form, FormItem, Input, message } from 'ant-design-vue'
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import AntdPage from '@/components/AntdPage.vue'
import { useAuthStore } from '@/stores/auth'

import { formFromProfile, profileRows, REAL_NAME_MAX, validateProfileForm } from './profile/query'

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)
const rows = computed(() => (userInfo.value ? profileRows(userInfo.value) : []))
const form = reactive(formFromProfile({ realName: userInfo.value?.realName ?? '' }))
const saving = ref(false)

watch(
  () => userInfo.value?.realName,
  (name) => {
    if (name !== undefined) form.realName = name
  },
)

async function onSave() {
  const checked = validateProfileForm(form)
  if (!checked.ok) {
    message.error(checked.message)
    return
  }
  saving.value = true
  try {
    await authStore.updateProfile(checked.value.realName)
    message.success('已保存显示名')
  } catch {
    // 失败由全局错误条提示
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AntdPage>
    <p class="lead">
      只能改显示名。账号、角色、密码都不在这里改。这不是系统用户表里的 Alice / Bob。水印上的名字会跟着变。
    </p>
    <Form layout="inline" @submit.prevent="onSave">
      <FormItem label="显示名">
        <Input v-model:value="form.realName" :maxlength="REAL_NAME_MAX" style="width: 12rem" />
      </FormItem>
      <FormItem>
        <Button :loading="saving" html-type="submit" type="primary">保存</Button>
      </FormItem>
    </Form>
    <Descriptions :column="1" bordered size="small">
      <DescriptionsItem v-for="row in rows" :key="row.key" :label="row.label">
        {{ row.value }}
      </DescriptionsItem>
    </Descriptions>
  </AntdPage>
</template>

<style scoped>
.lead {
  margin: 0;
  max-width: 40rem;
}
</style>
