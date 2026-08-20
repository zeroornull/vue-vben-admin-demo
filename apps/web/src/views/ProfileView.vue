<script setup lang="ts">
defineOptions({ name: 'ProfileView' })

import { Descriptions, DescriptionsItem } from 'ant-design-vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import AntdPage from '@/components/AntdPage.vue'
import { useAuthStore } from '@/stores/auth'

import { profileRows } from './profile/query'

const { userInfo } = storeToRefs(useAuthStore())
const rows = computed(() => (userInfo.value ? profileRows(userInfo.value) : []))
</script>

<template>
  <AntdPage>
    <p class="lead">
      这是当前登录会话，不是系统用户表里的 Alice / Bob。不能改密码，mock 账号共用 123456。
    </p>
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
