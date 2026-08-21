import type { ParentOption } from './types'

export type ElementTreeNode = {
  children?: ElementTreeNode[]
  disabled?: boolean
  label: string
  value: string
}

export function toElementTree(nodes: ParentOption[]): ElementTreeNode[] {
  return nodes.map((node) => ({
    children: node.children?.length ? toElementTree(node.children) : undefined,
    disabled: node.disabled,
    label: node.title,
    value: node.value,
  }))
}
