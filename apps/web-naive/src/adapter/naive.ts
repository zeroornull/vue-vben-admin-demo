import { createDiscreteApi, NForm, NInput, NModal } from 'naive-ui'

import { registerSkin, type Density, type SkinAdapter } from '@app/core'

const { dialog, message } = createDiscreteApi(['dialog', 'message'])

export function naiveControlSize(density: Density): 'medium' | 'small' {
  return density === 'compact' ? 'small' : 'medium'
}

export function createNaiveSkin(): SkinAdapter {
  return {
    Form: NForm,
    Input: NInput,
    Modal: NModal,
    confirm: async (input) => {
      try {
        await dialog.warning({
          content: input.content,
          negativeText: input.cancelText,
          positiveText: input.okText,
          title: input.title,
        })
        return true
      } catch {
        return false
      }
    },
    controlSize: naiveControlSize,
    message: {
      error: (text) => {
        message.error(text)
      },
      info: (text) => {
        message.info(text)
      },
      success: (text) => {
        message.success(text)
      },
      warning: (text) => {
        message.warning(text)
      },
    },
    name: 'naive',
  }
}

export function initNaiveSkin() {
  registerSkin(createNaiveSkin())
}

export { dialog as naiveDialog, message as naiveMessage }
