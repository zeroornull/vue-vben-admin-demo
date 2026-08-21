import Form from 'antdv-next/dist/form/index'
import Input from 'antdv-next/dist/input/index'
import message from 'antdv-next/dist/message/index'
import Modal from 'antdv-next/dist/modal/index'

import { registerSkin, type Density, type SkinAdapter } from '@app/core'

export function antdvControlSize(density: Density): 'middle' | 'small' {
  return density === 'compact' ? 'small' : 'middle'
}

export function createAntdvSkin(): SkinAdapter {
  return {
    Form,
    Input,
    Modal,
    confirm: (input) =>
      new Promise((resolve) => {
        Modal.confirm({
          cancelText: input.cancelText,
          content: input.content,
          okText: input.okText,
          onCancel: () => resolve(false),
          onOk: () => resolve(true),
          title: input.title,
        })
      }),
    controlSize: antdvControlSize,
    message: {
      error: (text) => {
        void message.error(text)
      },
      info: (text) => {
        void message.info(text)
      },
      success: (text) => {
        void message.success(text)
      },
      warning: (text) => {
        void message.warning(text)
      },
    },
    name: 'antdv-next',
  }
}

export function initAntdvSkin() {
  registerSkin(createAntdvSkin())
}
