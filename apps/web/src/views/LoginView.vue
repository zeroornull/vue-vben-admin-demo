<script setup lang="ts">
import { Button, Form, FormItem, Input } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AntdPage from '@/components/AntdPage.vue'
import AppearanceMenu from '@/components/AppearanceMenu.vue'
import { resolveLoginLanding } from '@/router/last-route'
import { useAuthStore } from '@/stores/auth'
import { useLastRouteStore } from '@/stores/last-route'

import { validateLoginForm } from './login/query'

const authStore = useAuthStore()
const lastRouteStore = useLastRouteStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  username: 'vben',
  password: '123456',
})
const errorMessage = ref('')

const accounts = [
  { username: 'vben', roles: '登录 admin+user · 菜单 biz-admin' },
  { username: 'admin', roles: '登录 admin · 菜单 biz-admin' },
  { username: 'user', roles: '登录 user · 菜单 viewer' },
] as const

function useAccount(username: string) {
  form.username = username
  form.password = '123456'
  errorMessage.value = ''
}

async function onSubmit() {
  errorMessage.value = ''
  const checked = validateLoginForm(form)
  if (!checked.ok) {
    errorMessage.value = checked.message
    return
  }
  try {
    const user = await authStore.login(checked.value)
    await router.replace(
      resolveLoginLanding(route.query.redirect, lastRouteStore.pathFor(user.username), user),
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
  }
}
</script>

<template>
  <main class="login">
    <AntdPage>
      <section class="card">
        <div class="title-row">
          <h1>登录</h1>
          <AppearanceMenu />
        </div>
        <p class="lead">账号走 Vite mock。连错 3 次锁 1 分钟。登录角色管「关于」；业务角色管侧栏菜单。</p>

        <Form layout="vertical" @submit.prevent="onSubmit">
          <FormItem label="用户名">
            <Input
              v-model:value="form.username"
              autocomplete="username"
              name="username"
            />
          </FormItem>
          <FormItem label="密码">
            <Input.Password
              v-model:value="form.password"
              autocomplete="current-password"
              name="password"
            />
          </FormItem>

          <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

          <FormItem>
            <Button :loading="authStore.loginLoading" block html-type="submit" type="primary">
              登录
            </Button>
          </FormItem>
        </Form>

        <ul class="accounts">
          <li v-for="item in accounts" :key="item.username">
            <button type="button" @click="useAccount(item.username)">
              {{ item.username }} / 123456
            </button>
            <span>{{ item.roles }}</span>
          </li>
        </ul>
      </section>
    </AntdPage>
  </main>
</template>

<style scoped>
.login {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.card {
  width: min(100%, 22rem);
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 650;
  color: var(--color-heading);
}

.lead,
.accounts span {
  color: var(--color-text);
  opacity: 0.72;
}

.lead {
  margin: 0.5rem 0 1.5rem;
  font-size: 0.95rem;
}

.error {
  margin: 0 0 0.75rem;
  color: #c23d3d;
  font-size: 0.9rem;
}

.accounts {
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.accounts li {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.accounts button {
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  color: hsla(160, 100%, 37%, 1);
  cursor: pointer;
  text-align: left;
}
</style>
