<script setup lang="ts">
import { Button, Form, FormItem, Input } from 'tdesign-vue-next'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import AppearanceMenu from '@/components/AppearanceMenu.vue'
import TdPage from '@/components/TdPage.vue'
import { resolveLoginLanding } from '@/router/last-route'
import { useAuthStore } from '@/stores/auth'
import { useLastRouteStore } from '@/stores/last-route'

import { validateLoginForm } from './login/query'

const { t } = useI18n()
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
  { username: 'vben', rolesKey: 'login.vben' },
  { username: 'admin', rolesKey: 'login.admin' },
  { username: 'user', rolesKey: 'login.user' },
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
    errorMessage.value = t(checked.message)
    return
  }
  try {
    const user = await authStore.login(checked.value)
    await router.replace(
      resolveLoginLanding(route.query.redirect, lastRouteStore.pathFor(user.username), user),
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('login.failed')
  }
}
</script>

<template>
  <main class="login">
    <TdPage>
      <section class="card">
        <div class="title-row">
          <h1>{{ t('login.title') }}</h1>
          <AppearanceMenu />
        </div>
        <p class="lead">{{ t('login.lead') }}</p>

        <Form @submit="onSubmit">
          <FormItem :label="t('login.username')">
            <Input v-model="form.username" autocomplete="username" name="username" />
          </FormItem>
          <FormItem :label="t('login.password')">
            <Input
              v-model="form.password"
              autocomplete="current-password"
              name="password"
              type="password"
            />
          </FormItem>

          <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

          <FormItem>
            <Button :loading="authStore.loginLoading" style="width: 100%" theme="primary" type="submit">
              {{ t('login.submit') }}
            </Button>
          </FormItem>
        </Form>

        <ul class="accounts">
          <li v-for="item in accounts" :key="item.username">
            <button type="button" @click="useAccount(item.username)">
              {{ item.username }} / 123456
            </button>
            <span>{{ t(item.rolesKey) }}</span>
          </li>
        </ul>
      </section>
    </TdPage>
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
