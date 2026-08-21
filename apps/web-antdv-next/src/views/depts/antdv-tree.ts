import type { ParentOption } from './types'

export type AntdvTreeNode = {
  children?: AntdvTreeNode[]
  disabled?: boolean
  label: string
  value: string
}

export function toAntdvTree(nodes: ParentOption[]): AntdvTreeNode[] {
  return nodes.map((node) => ({
    children: node.children?.length ? toAntdvTree(node.children) : undefined,
    disabled: node.disabled,
    label: node.title,
    value: node.value,
  }))
}
