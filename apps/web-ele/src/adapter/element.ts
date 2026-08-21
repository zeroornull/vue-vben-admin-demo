import { ElForm, ElInput, ElMessage, ElMessageBox } from 'element-plus'

import { registerSkin, type Density, type SkinAdapter } from '@app/core'

export function elementControlSize(density: Density): 'default' | 'small' {
  return density === 'compact' ? 'small' : 'default'
}

export function createElementSkin(): SkinAdapter {
  return {
    Form: ElForm,
    Input: ElInput,
    Modal: ElMessageBox,
    confirm: async (input) => {
      try {
        await ElMessageBox.confirm(input.content, input.title, {
          cancelButtonText: input.cancelText,
          confirmButtonText: input.okText,
          type: 'warning',
        })
        return true
      } catch {
        return false
      }
    },
    controlSize: elementControlSize,
    message: {
      error: (text) => {
        ElMessage.error(text)
      },
      info: (text) => {
        ElMessage.info(text)
      },
      success: (text) => {
        ElMessage.success(text)
      },
      warning: (text) => {
        ElMessage.warning(text)
      },
    },
    name: 'element',
  }
}

export function initElementSkin() {
  registerSkin(createElementSkin())
}
