export interface WorkbenchProjectItem {
  color: string
  content: string
  date: string
  group: string
  mark: string
  title: string
  url: string
}

export interface WorkbenchQuickNavItem {
  color: string
  mark: string
  roles?: string[]
  title: string
  url: string
}

export interface WorkbenchTodoItem {
  completed: boolean
  content: string
  date: string
  title: string
}

export interface WorkbenchTrendItem {
  content: string
  date: string
  title: string
}

export interface VisitSourceItem {
  name: string
  value: number
}
