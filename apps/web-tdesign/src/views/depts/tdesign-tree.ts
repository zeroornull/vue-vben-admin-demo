import type { ParentOption } from './types'

export type TdesignTreeNode = {
  children?: TdesignTreeNode[]
  disabled?: boolean
  label: string
  value: string
}

export function toTdesignTree(nodes: ParentOption[]): TdesignTreeNode[] {
  return nodes.map((node) => ({
    children: node.children?.length ? toTdesignTree(node.children) : undefined,
    disabled: node.disabled,
    label: node.title,
    value: node.value,
  }))
}
