import type { ParentOption } from './types'

export type NaiveTreeNode = {
  children?: NaiveTreeNode[]
  disabled?: boolean
  key: string
  label: string
}

export function toNaiveTree(nodes: ParentOption[]): NaiveTreeNode[] {
  return nodes.map((node) => ({
    children: node.children?.length ? toNaiveTree(node.children) : undefined,
    disabled: node.disabled,
    key: node.value,
    label: node.title,
  }))
}
