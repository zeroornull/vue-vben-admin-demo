import { expect, test } from '@playwright/test'

import { loginAs } from './helpers.ts'

test('vben can log in', async ({ page }) => {
  await loginAs(page, 'vben')
  await expect(page.getByText('默认皮肤仍是 ant-design-vue')).toBeVisible()
})

test('three wrong passwords lock the account', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[name="username"]').fill('e2e-lock')
  await page.locator('input[name="password"]').fill('wrong')

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  }

  await expect(page.getByRole('alert')).toContainText('账号已锁定')
})

test('vben can create a user', async ({ page }) => {
  const name = `e2e-${Date.now()}`

  await loginAs(page, 'vben')
  await page.goto('/users')
  await page.getByRole('button', { name: '新建' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByPlaceholder('显示名').fill(name)
  await page.getByRole('dialog').getByRole('button', { name: '确定' }).click()
  await expect(page.getByText('已创建')).toBeVisible()

  await page.getByPlaceholder('模糊匹配').fill(name)
  await page.getByRole('button', { name: '查询' }).click()
  await expect(page.getByText(name)).toBeVisible()
})

test('user opening /users lands on 403', async ({ page }) => {
  await loginAs(page, 'user')
  await page.goto('/users')
  await expect(page).toHaveURL(/\/403(?:\?|$)/)
  await expect(page.getByRole('heading', { name: '403' })).toBeVisible()
  await expect(page.getByText('已登录，但当前角色不能访问这个页面')).toBeVisible()
})
