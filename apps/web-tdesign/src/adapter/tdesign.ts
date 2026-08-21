import { Dialog, DialogPlugin, Form, Input, MessagePlugin } from 'tdesign-vue-next'

import { registerSkin, type Density, type SkinAdapter } from '@app/core'

export function tdesignControlSize(density: Density): 'medium' | 'small' {
  return density === 'compact' ? 'small' : 'medium'
}

export function createTdesignSkin(): SkinAdapter {
  return {
    Form,
    Input,
    Modal: Dialog,
    confirm: async (input) => {
      try {
        await DialogPlugin.confirm({
          body: input.content,
          cancelBtn: input.cancelText,
          confirmBtn: input.okText,
          header: input.title,
          theme: 'warning',
        })
        return true
      } catch {
        return false
      }
    },
    controlSize: tdesignControlSize,
    message: {
      error: (text) => {
        void MessagePlugin.error(text)
      },
      info: (text) => {
        void MessagePlugin.info(text)
      },
      success: (text) => {
        void MessagePlugin.success(text)
      },
      warning: (text) => {
        void MessagePlugin.warning(text)
      },
    },
    name: 'tdesign',
  }
}

export function initTdesignSkin() {
  registerSkin(createTdesignSkin())
}

export { DialogPlugin as tdesignDialog, MessagePlugin as tdesignMessage }
