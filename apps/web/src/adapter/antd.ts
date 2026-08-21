import { Form, Input, Modal, message } from 'ant-design-vue'

import { registerSkin, type Density, type SkinAdapter } from '@app/core'

export function antdControlSize(density: Density): 'middle' | 'small' {
  return density === 'compact' ? 'small' : 'middle'
}

export function createAntdSkin(): SkinAdapter {
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
    controlSize: antdControlSize,
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
    name: 'antd',
  }
}

export function initAntdSkin() {
  registerSkin(createAntdSkin())
}
