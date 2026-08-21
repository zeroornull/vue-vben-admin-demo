import type { Density } from './density.ts'

/** 核里不绑 Vue 组件类型，避免依赖 UI 库或 vue。 */
export type SkinComponent = object

export type SkinMessage = {
  error: (text: string) => void
  info: (text: string) => void
  success: (text: string) => void
  warning: (text: string) => void
}

export type SkinConfirmInput = {
  cancelText?: string
  content: string
  okText?: string
  title: string
}

export type SkinAdapter = {
  Form: SkinComponent
  Input: SkinComponent
  Modal: SkinComponent
  confirm: (input: SkinConfirmInput) => Promise<boolean>
  controlSize: (density: Density) => string
  message: SkinMessage
  name: string
}

let current: SkinAdapter | null = null

export function registerSkin(adapter: SkinAdapter) {
  current = adapter
}

export function clearSkin() {
  current = null
}

export function getSkin(): SkinAdapter | null {
  return current
}

export function requireSkin(): SkinAdapter {
  if (!current) {
    throw new Error('@app/core: skin adapter is not registered')
  }
  return current
}
