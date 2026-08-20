<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppearanceMenu from '@/components/AppearanceMenu.vue'
import { resolveLoginLanding } from '@/router/last-route'
import { useAuthStore } from '@/stores/auth'
import { useLastRouteStore } from '@/stores/last-route'

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
  try {
    const user = await authStore.login({
      username: form.username,
      password: form.password,
    })
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
    <section class="card">
      <div class="title-row">
        <h1>登录</h1>
        <AppearanceMenu />
      </div>
      <p class="lead">账号走 Vite mock。连错 3 次锁 1 分钟。登录角色管「关于」；业务角色管侧栏菜单。</p>

      <form @submit.prevent="onSubmit">
        <label>
          用户名
          <input
            v-model.trim="form.username"
            autocomplete="username"
            name="username"
            required
            type="text"
          />
        </label>
        <label>
          密码
          <input
            v-model="form.password"
            autocomplete="current-password"
            name="password"
            required
            type="password"
          />
        </label>

        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

        <button :disabled="authStore.loginLoading" type="submit">
          {{ authStore.loginLoading ? '登录中…' : '登录' }}
        </button>
      </form>

      <ul class="accounts">
        <li v-for="item in accounts" :key="item.username">
          <button type="button" @click="useAccount(item.username)">
            {{ item.username }} / 123456
          </button>
          <span>{{ item.roles }}</span>
        </li>
      </ul>
    </section>
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

form {
  display: grid;
  gap: 0.9rem;
}

label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.85rem;
}

input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 0.6rem 0.75rem;
  font: inherit;
}

input:focus {
  outline: 2px solid hsla(160, 100%, 37%, 0.45);
  outline-offset: 1px;
}

button[type='submit'] {
  margin-top: 0.25rem;
  border: 0;
  border-radius: 0.5rem;
  background: #42b883;
  color: #fff;
  padding: 0.7rem 1rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button[type='submit']:disabled {
  opacity: 0.65;
  cursor: wait;
}

.error {
  margin: 0;
  color: #c23d3d;
  font-size: 0.9rem;
}

.accounts {
  margin: 1.5rem 0 0;
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
