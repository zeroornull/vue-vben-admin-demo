export type UserStatus = 0 | 1

export type SystemDept = {
  children?: SystemDept[]
  createTime: string
  id: string
  name: string
  parentId: string | null
  remark: string
  status: UserStatus
  userCount?: number
}

export type DeptFormValues = {
  name: string
  parentId: string | null
  remark: string
  status: UserStatus
}

export type DeptListQuery = {
  name: string
  status: UserStatus | ''
}

export type ParentOption = {
  children?: ParentOption[]
  disabled?: boolean
  title: string
  value: string
}

export type FormValidation =
  | { message: string; ok: false }
  | { ok: true; value: DeptFormValues }
