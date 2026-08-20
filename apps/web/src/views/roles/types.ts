export type UserStatus = 0 | 1

export type SystemRole = {
  actionCodes: string[]
  code: string
  createTime: string
  id: string
  menuCodes: string[]
  name: string
  remark: string
  status: UserStatus
  userCount?: number
}

export type RoleFormValues = {
  actionCodes: string[]
  code: string
  menuCodes: string[]
  name: string
  remark: string
  status: UserStatus
}

export type RoleListQuery = {
  code: string
  name: string
  page: number
  pageSize: number
  status: UserStatus | ''
}

export type RoleListResult = {
  items: SystemRole[]
  total: number
}

export type FormValidation =
  | { message: string; ok: false }
  | { ok: true; value: RoleFormValues }
