import { expect, type Page } from '@playwright/test'

export async function loginAs(page: Page, username: string, password = '123456') {
  await page.goto('/login')
  await page.locator('input[name="username"]').fill(username)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: /登\s*录/ }).click()
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/)
}
