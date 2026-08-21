export type UserStatus = 0 | 1

export type SystemUser = {
  createTime: string
  deptId: string | null
  id: string
  name: string
  remark: string
  roleIds: string[]
  status: UserStatus
}

export type UserFormValues = {
  deptId: string | null
  name: string
  remark: string
  roleIds: string[]
  status: UserStatus
}

export type UserListQuery = {
  deptId: string
  name: string
  page: number
  pageSize: number
  roleId: string
  sortField?: string
  sortOrder?: string
  status: UserStatus | ''
}

export type UserListResult = {
  items: SystemUser[]
  total: number
}

export type FormValidation =
  | { message: string; ok: false }
  | { ok: true; value: UserFormValues }
