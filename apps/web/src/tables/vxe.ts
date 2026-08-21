import 'vxe-pc-ui/es/style.css'
import 'vxe-table/es/style.css'

import type { Density } from '@app/core'
import { VxeUI } from 'vxe-pc-ui'
import { VxeColumn, VxeTable } from 'vxe-table'

export { VxeColumn, VxeTable }

export function applyVxeTheme(mode: 'light' | 'dark') {
  VxeUI.setTheme(mode)
}

export function vxeTableSize(density: Density): 'medium' | 'small' {
  return density === 'compact' ? 'small' : 'medium'
}
