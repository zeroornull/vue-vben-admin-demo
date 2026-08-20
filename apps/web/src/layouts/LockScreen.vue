<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { unlockApi } from '@/api'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'
import { useLockStore } from '@/stores/lock'

import { userMenuMeta } from './user-menu'

const emit = defineEmits<{
  logout: []
}>()

const authStore = useAuthStore()
const lockStore = useLockStore()
const { userInfo } = storeToRefs(authStore)
const meta = computed(() => userMenuMeta(userInfo.value))
const password = ref('')
const errorMessage = ref('')
const unlocking = ref(false)

async function onUnlock() {
  errorMessage.value = ''
  unlocking.value = true
  try {
    await unlockApi(password.value)
    lockStore.unlock()
    password.value = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '解锁失败'
  } finally {
    unlocking.value = false
  }
}
</script>

<template>
  <div class="lock" role="dialog" aria-modal="true" aria-labelledby="lock-title">
    <section class="card">
      <div class="title-row">
        <h1 id="lock-title">锁屏</h1>
        <ThemeToggle />
      </div>
      <p class="lead">会话还在。输入当前账号密码解锁，不是重新登录。</p>
      <p v-if="meta" class="who">
        <span class="avatar" aria-hidden="true">{{ meta.initial }}</span>
        <span>{{ meta.label }} / {{ meta.username }}</span>
      </p>
      <form @submit.prevent="onUnlock">
        <label>
          密码
          <input
            v-model="password"
            autocomplete="current-password"
            name="password"
            required
            type="password"
          />
        </label>
        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
        <button :disabled="unlocking" type="submit">
          {{ unlocking ? '解锁中…' : '解锁' }}
        </button>
      </form>
      <button class="exit" type="button" @click="emit('logout')">退出登录</button>
    </section>
  </div>
</template>

<style scoped>
.lock {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: color-mix(in srgb, var(--color-background) 88%, #000 12%);
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
  font-size: 1.5rem;
  font-weight: 650;
  color: var(--color-heading);
}

.lead,
.who {
  color: var(--color-text);
  opacity: 0.75;
}

.lead {
  margin: 0.5rem 0 1rem;
  font-size: 0.92rem;
}

.who {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 1.1rem;
  font-size: 0.9rem;
}

.avatar {
  display: inline-grid;
  place-items: center;
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  color: var(--color-heading);
  font-size: 0.8rem;
  font-weight: 650;
}

form {
  display: grid;
  gap: 0.85rem;
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

button[type='submit'] {
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

.exit {
  margin-top: 0.85rem;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  opacity: 0.7;
  cursor: pointer;
}
</style>
