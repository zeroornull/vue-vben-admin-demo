import type { IncomingMessage, ServerResponse } from 'node:http'

import type { Connect, Plugin } from 'vite'

import { hasAccessCode, resolveActionCodes, resolveMenuCodes } from '../src/access/resolve.ts'
import {
  isLoginLocked,
  loginLockMessage,
  onLoginFailure,
  onLoginSuccess,
  wrongPasswordMessage,
} from '../src/auth/login-lock.ts'
import { passwordsMatch, readUnlockPassword } from '../src/auth/unlock.ts'
import type { SystemDept } from '../src/views/depts/types.ts'
import { applyAuditImports, auditSummary, type AuditAction, type AuditTarget } from '../src/views/audit/query.ts'
import { validatePasswordChange, validateProfileForm } from '../src/views/profile/query.ts'
import { BATCH_DELETE_MAX, normalizeIds } from '../src/tables/batch.ts'
import { orderDeptIdsForDelete } from '../src/views/depts/query.ts'
import { normalizeUserIds, USER_BATCH_DELETE_MAX } from '../src/views/users/query.ts'

import { appendMockAudit, listMockAudit } from './audit-store.ts'
import {
  createMockDept,
  deleteMockDept,
  listMockDeptFlat,
  listMockDepts,
  mockDeptName,
  updateMockDept,
} from './depts-store.ts'
import {
  createMockRole,
  deleteMockRole,
  listMockRoleFlat,
  listMockRoles,
  mockRoleName,
  updateMockRole,
} from './roles-store.ts'
import {
  countMockUsersInDept,
  countMockUsersInRole,
  createMockUser,
  deleteMockUser,
  listMockUsers,
  mockUserName,
  updateMockUser,
} from './users-store.ts'
import {
  createMockLink,
  deleteMockLink,
  listMockLinks,
  mockLinkName,
  updateMockLink,
} from './links-store.ts'
import { readLoginGuard, writeLoginGuard } from './login-guard-store.ts'
import { listMockNotices, markMockNoticeRead } from './notices-store.ts'
import { bumpMockBuildId, readMockBuildId } from './version-store.ts'

function readRoleIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((id) => String(id))
}

function attachUserCount(nodes: SystemDept[]): SystemDept[] {
  return nodes.map((node) => ({
    ...node,
    children: node.children?.length ? attachUserCount(node.children) : undefined,
    userCount: countMockUsersInDept(node.id),
  }))
}

function readDeptId(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

type MockUser = {
  password: string
  realName: string
  roleCodes: string[]
  roles: string[]
  userId: string
}

const ACCOUNTS: Record<string, MockUser> = {
  vben: {
    password: '123456',
    realName: 'Vben',
    roleCodes: ['biz-admin'],
    roles: ['admin', 'user'],
    userId: '1',
  },
  admin: {
    password: '123456',
    realName: 'Admin',
    roleCodes: ['biz-admin'],
    roles: ['admin'],
    userId: '2',
  },
  user: {
    password: '123456',
    realName: 'User',
    roleCodes: ['viewer'],
    roles: ['user'],
    userId: '3',
  },
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) {
    return {}
  }
  return JSON.parse(raw) as Record<string, unknown>
}

function sessionPayload(username: string, account: MockUser) {
  return {
    actionCodes: resolveActionCodes(account.roleCodes, listMockRoleFlat()),
    homePath: '/',
    menuCodes: resolveMenuCodes(account.roleCodes, listMockRoleFlat()),
    realName: account.realName,
    roleCodes: account.roleCodes,
    roles: account.roles,
    userId: account.userId,
    username,
  }
}

function usernameFromToken(header: string | undefined): string | undefined {
  if (!header?.startsWith('Bearer mock.')) {
    return undefined
  }
  const username = header.slice('Bearer mock.'.length)
  return username in ACCOUNTS ? username : undefined
}

function requireLogin(req: IncomingMessage, res: ServerResponse): string | undefined {
  const username = usernameFromToken(req.headers.authorization)
  if (!username) {
    sendJson(res, 401, { code: 401, data: null, message: '未登录或登录已过期' })
    return undefined
  }
  return username
}

function requireAction(req: IncomingMessage, res: ServerResponse, action: string): boolean {
  const username = requireLogin(req, res)
  if (!username) return false
  const account = ACCOUNTS[username]
  if (!account) {
    sendJson(res, 401, { code: 401, data: null, message: '未登录或登录已过期' })
    return false
  }
  const codes = resolveActionCodes(account.roleCodes, listMockRoleFlat())
  if (!hasAccessCode(codes, action)) {
    sendJson(res, 200, { code: 1, data: null, message: '没有操作权限' })
    return false
  }
  return true
}

function handleBatchDelete(
  req: IncomingMessage,
  res: ServerResponse,
  action: string,
  ids: string[],
  emptyMessage: string,
  peek: (id: string) => string | undefined,
  remove: (id: string) => { error: string } | { ok: true },
  target: AuditTarget,
) {
  if (!requireAction(req, res, action)) return
  if (!ids.length) {
    sendJson(res, 200, { code: 1, data: null, message: emptyMessage })
    return
  }
  if (ids.length > BATCH_DELETE_MAX) {
    sendJson(res, 200, {
      code: 1,
      data: null,
      message: `一次最多删 ${BATCH_DELETE_MAX} 条`,
    })
    return
  }
  let deleted = 0
  let skipped = 0
  for (const id of ids) {
    const name = peek(id) ?? id
    const result = remove(id)
    if ('error' in result) {
      skipped += 1
      continue
    }
    recordAudit(actorName(req), 'delete', target, name)
    deleted += 1
  }
  sendJson(res, 200, { code: 0, data: { deleted, skipped }, message: 'ok' })
}

function actorName(req: IncomingMessage) {
  return usernameFromToken(req.headers.authorization) ?? ''
}

function recordAudit(actor: string, action: AuditAction, target: AuditTarget, name: string) {
  if (!actor) return
  appendMockAudit({
    action,
    actor,
    summary: auditSummary(action, target, name),
    target,
  })
}

const mockMiddleware: Connect.NextHandleFunction = async (req, res, next) => {
  const url = req.url ?? ''
  if (!url.startsWith('/api/')) {
    next()
    return
  }

  const path = url.replace(/\?.*$/, '')

  try {
    if (req.method === 'POST' && path === '/api/auth/login') {
      const body = await readJson(req)
      const username = String(body.username ?? '')
      const password = readUnlockPassword(body.password)
      const now = Date.now()
      const guard = readLoginGuard(username)
      if (isLoginLocked(guard, now)) {
        sendJson(res, 200, { code: 1, data: null, message: loginLockMessage(guard, now) })
        return
      }
      const account = ACCOUNTS[username]
      if (!account || !passwordsMatch(password, account.password)) {
        const next = onLoginFailure(guard, now)
        writeLoginGuard(username, next)
        sendJson(res, 200, {
          code: 1,
          data: null,
          message: isLoginLocked(next, now) ? loginLockMessage(next, now) : wrongPasswordMessage(next),
        })
        return
      }
      writeLoginGuard(username, onLoginSuccess())
      sendJson(res, 200, {
        code: 0,
        data: { accessToken: `mock.${username}` },
        message: 'ok',
      })
      return
    }

    if (req.method === 'GET' && path === '/api/version') {
      sendJson(res, 200, { code: 0, data: { buildId: readMockBuildId() }, message: 'ok' })
      return
    }

    if (req.method === 'POST' && path === '/api/version/bump') {
      if (!requireLogin(req, res)) return
      sendJson(res, 200, { code: 0, data: { buildId: bumpMockBuildId() }, message: 'ok' })
      return
    }

    if (req.method === 'GET' && path === '/api/notices') {
      const username = requireLogin(req, res)
      if (!username) return
      sendJson(res, 200, { code: 0, data: listMockNotices(username), message: 'ok' })
      return
    }

    if (req.method === 'POST' && path === '/api/notices/read') {
      const username = requireLogin(req, res)
      if (!username) return
      const id = String((await readJson(req)).id ?? '')
      sendJson(res, 200, {
        code: 0,
        data: markMockNoticeRead(username, id || undefined),
        message: 'ok',
      })
      return
    }

    if (req.method === 'POST' && path === '/api/auth/logout') {
      sendJson(res, 200, { code: 0, data: null, message: 'ok' })
      return
    }

    if (req.method === 'POST' && path === '/api/auth/unlock') {
      const username = requireLogin(req, res)
      if (!username) return
      const account = ACCOUNTS[username]
      const password = readUnlockPassword((await readJson(req)).password)
      if (!account || !passwordsMatch(password, account.password)) {
        sendJson(res, 200, { code: 1, data: null, message: '密码错误' })
        return
      }
      sendJson(res, 200, { code: 0, data: null, message: 'ok' })
      return
    }

    if (req.method === 'POST' && path === '/api/auth/password') {
      const username = requireLogin(req, res)
      if (!username) return
      const account = ACCOUNTS[username]
      if (!account) {
        sendJson(res, 401, { code: 401, data: null, message: '未登录或登录已过期' })
        return
      }
      const checked = validatePasswordChange(await readJson(req))
      if (!checked.ok) {
        sendJson(res, 200, { code: 1, data: null, message: checked.message })
        return
      }
      if (!passwordsMatch(checked.value.currentPassword, account.password)) {
        sendJson(res, 200, { code: 1, data: null, message: '当前密码不对' })
        return
      }
      account.password = checked.value.newPassword
      recordAudit(username, 'update', 'profile', '登录密码')
      sendJson(res, 200, { code: 0, data: null, message: 'ok' })
      return
    }

    if (req.method === 'GET' && path === '/api/user/info') {
      const username = usernameFromToken(req.headers.authorization)
      if (!username) {
        sendJson(res, 401, { code: 401, data: null, message: '未登录或登录已过期' })
        return
      }
      const account = ACCOUNTS[username]
      if (!account) {
        sendJson(res, 401, { code: 401, data: null, message: '未登录或登录已过期' })
        return
      }
      sendJson(res, 200, {
        code: 0,
        data: sessionPayload(username, account),
        message: 'ok',
      })
      return
    }

    if (req.method === 'PUT' && path === '/api/user/profile') {
      const username = requireLogin(req, res)
      if (!username) return
      const account = ACCOUNTS[username]
      if (!account) {
        sendJson(res, 401, { code: 401, data: null, message: '未登录或登录已过期' })
        return
      }
      const checked = validateProfileForm(await readJson(req))
      if (!checked.ok) {
        sendJson(res, 200, { code: 1, data: null, message: checked.message })
        return
      }
      account.realName = checked.value.realName
      recordAudit(username, 'update', 'profile', checked.value.realName)
      sendJson(res, 200, {
        code: 0,
        data: sessionPayload(username, account),
        message: 'ok',
      })
      return
    }

    if (req.method === 'GET' && path === '/api/system/audit/list') {
      if (!requireLogin(req, res)) return
      const search = new URL(url, 'http://local.invalid').searchParams
      sendJson(res, 200, { code: 0, data: listMockAudit(search), message: 'ok' })
      return
    }

    if (req.method === 'POST' && path === '/api/system/audit/import') {
      if (!requireLogin(req, res)) return
      const body = await readJson(req)
      const result = applyAuditImports(body.items, (entry) => {
        appendMockAudit(entry)
      })
      sendJson(res, 200, { code: 0, data: result, message: 'ok' })
      return
    }

    if (path.startsWith('/api/system/user')) {
      if (req.method === 'GET' && path === '/api/system/user/list') {
        if (!requireLogin(req, res)) return

        const search = new URL(url, 'http://local.invalid').searchParams
        sendJson(res, 200, { code: 0, data: listMockUsers(search), message: 'ok' })
        return
      }

      if (req.method === 'POST' && path === '/api/system/user/batch-delete') {
        if (!requireAction(req, res, 'user:delete')) return
        const body = await readJson(req)
        const ids = normalizeUserIds(body.ids)
        if (!ids.length) {
          sendJson(res, 200, { code: 1, data: null, message: '请选择要删除的用户' })
          return
        }
        if (ids.length > USER_BATCH_DELETE_MAX) {
          sendJson(res, 200, {
            code: 1,
            data: null,
            message: `一次最多删 ${USER_BATCH_DELETE_MAX} 人`,
          })
          return
        }
        let deleted = 0
        for (const id of ids) {
          const name = mockUserName(id) ?? id
          const result = deleteMockUser(id)
          if ('error' in result) continue
          recordAudit(actorName(req), 'delete', 'user', name)
          deleted += 1
        }
        sendJson(res, 200, { code: 0, data: { deleted }, message: 'ok' })
        return
      }

      if (req.method === 'POST' && path === '/api/system/user') {
        if (!requireAction(req, res, 'user:create')) return
        const body = await readJson(req)
        const result = createMockUser({
          deptId: readDeptId(body.deptId),
          name: String(body.name ?? ''),
          remark: String(body.remark ?? ''),
          roleIds: readRoleIds(body.roleIds),
          status: body.status === 0 ? 0 : 1,
        })
        if ('error' in result) {
          sendJson(res, 200, { code: 1, data: null, message: result.error })
          return
        }
        recordAudit(actorName(req), 'create', 'user', result.user.name)
        sendJson(res, 200, { code: 0, data: result.user, message: 'ok' })
        return
      }

      const userMatch = path.match(/^\/api\/system\/user\/([^/]+)$/)
      const userId = userMatch?.[1]
      if (userId && req.method === 'PUT') {
        if (!requireAction(req, res, 'user:update')) return
        const body = await readJson(req)
        const result = updateMockUser(userId, {
          deptId: readDeptId(body.deptId),
          name: String(body.name ?? ''),
          remark: String(body.remark ?? ''),
          roleIds: readRoleIds(body.roleIds),
          status: body.status === 0 ? 0 : 1,
        })
        if ('error' in result) {
          sendJson(res, 200, { code: 1, data: null, message: result.error })
          return
        }
        recordAudit(actorName(req), 'update', 'user', result.user.name)
        sendJson(res, 200, { code: 0, data: result.user, message: 'ok' })
        return
      }

      if (userId && req.method === 'DELETE') {
        if (!requireAction(req, res, 'user:delete')) return
        const name = mockUserName(userId) ?? userId
        const result = deleteMockUser(userId)
        if ('error' in result) {
          sendJson(res, 200, { code: 1, data: null, message: result.error })
          return
        }
        recordAudit(actorName(req), 'delete', 'user', name)
        sendJson(res, 200, { code: 0, data: null, message: 'ok' })
        return
      }
    }

    if (path.startsWith('/api/system/dept')) {
      if (req.method === 'GET' && path === '/api/system/dept/list') {
        if (!requireLogin(req, res)) return

        const search = new URL(url, 'http://local.invalid').searchParams
        sendJson(res, 200, {
          code: 0,
          data: attachUserCount(listMockDepts(search)),
          message: 'ok',
        })
        return
      }

      if (req.method === 'POST' && path === '/api/system/dept/batch-delete') {
        const body = await readJson(req)
        handleBatchDelete(
          req,
          res,
          'dept:delete',
          orderDeptIdsForDelete(body.ids, listMockDeptFlat()),
          '请选择要删除的部门',
          mockDeptName,
          (id) => deleteMockDept(id, countMockUsersInDept(id)),
          'dept',
        )
        return
      }

      if (req.method === 'POST' && path === '/api/system/dept') {
        if (!requireAction(req, res, 'dept:create')) return
        const body = await readJson(req)
        const result = createMockDept({
          name: String(body.name ?? ''),
          parentId: body.parentId == null || body.parentId === '' ? null : String(body.parentId),
          remark: String(body.remark ?? ''),
          status: body.status === 0 ? 0 : 1,
        })
        if ('error' in result) {
          sendJson(res, 200, { code: 1, data: null, message: result.error })
          return
        }
        recordAudit(actorName(req), 'create', 'dept', result.dept.name)
        sendJson(res, 200, { code: 0, data: result.dept, message: 'ok' })
        return
      }

      const deptMatch = path.match(/^\/api\/system\/dept\/([^/]+)$/)
      const deptId = deptMatch?.[1]
      if (deptId && req.method === 'PUT') {
        if (!requireAction(req, res, 'dept:update')) return
        const body = await readJson(req)
        const result = updateMockDept(deptId, {
          name: String(body.name ?? ''),
          parentId: body.parentId == null || body.parentId === '' ? null : String(body.parentId),
          remark: String(body.remark ?? ''),
          status: body.status === 0 ? 0 : 1,
        })
        if ('error' in result) {
          sendJson(res, 200, { code: 1, data: null, message: result.error })
          return
        }
        recordAudit(actorName(req), 'update', 'dept', result.dept.name)
        sendJson(res, 200, { code: 0, data: result.dept, message: 'ok' })
        return
      }

      if (deptId && req.method === 'DELETE') {
        if (!requireAction(req, res, 'dept:delete')) return
        const name = mockDeptName(deptId) ?? deptId
        const result = deleteMockDept(deptId, countMockUsersInDept(deptId))
        if ('error' in result) {
          sendJson(res, 200, { code: 1, data: null, message: result.error })
          return
        }
        recordAudit(actorName(req), 'delete', 'dept', name)
        sendJson(res, 200, { code: 0, data: null, message: 'ok' })
        return
      }
    }

    if (path.startsWith('/api/system/role')) {
      if (req.method === 'GET' && path === '/api/system/role/list') {
        if (!requireLogin(req, res)) return

        const search = new URL(url, 'http://local.invalid').searchParams
        const result = listMockRoles(search)
        sendJson(res, 200, {
          code: 0,
          data: {
            items: result.items.map((item) => ({
              ...item,
              userCount: countMockUsersInRole(item.id),
            })),
            total: result.total,
          },
          message: 'ok',
        })
        return
      }

      if (req.method === 'POST' && path === '/api/system/role/batch-delete') {
        const body = await readJson(req)
        handleBatchDelete(
          req,
          res,
          'role:delete',
          normalizeIds(body.ids),
          '请选择要删除的角色',
          mockRoleName,
          (id) => deleteMockRole(id, countMockUsersInRole(id)),
          'role',
        )
        return
      }

      if (req.method === 'POST' && path === '/api/system/role') {
        if (!requireAction(req, res, 'role:create')) return
        const body = await readJson(req)
        const created = createMockRole({
          actionCodes: Array.isArray(body.actionCodes) ? body.actionCodes.map(String) : [],
          code: String(body.code ?? ''),
          menuCodes: Array.isArray(body.menuCodes) ? body.menuCodes.map(String) : [],
          name: String(body.name ?? ''),
          remark: String(body.remark ?? ''),
          status: body.status === 0 ? 0 : 1,
        })
        if ('error' in created) {
          sendJson(res, 200, { code: 1, data: null, message: created.error })
          return
        }
        recordAudit(actorName(req), 'create', 'role', created.role.name)
        sendJson(res, 200, { code: 0, data: created.role, message: 'ok' })
        return
      }

      const roleMatch = path.match(/^\/api\/system\/role\/([^/]+)$/)
      const roleId = roleMatch?.[1]
      if (roleId && req.method === 'PUT') {
        if (!requireAction(req, res, 'role:update')) return
        const body = await readJson(req)
        const updated = updateMockRole(roleId, {
          actionCodes: Array.isArray(body.actionCodes) ? body.actionCodes.map(String) : [],
          code: String(body.code ?? ''),
          menuCodes: Array.isArray(body.menuCodes) ? body.menuCodes.map(String) : [],
          name: String(body.name ?? ''),
          remark: String(body.remark ?? ''),
          status: body.status === 0 ? 0 : 1,
        })
        if ('error' in updated) {
          sendJson(res, 200, { code: 1, data: null, message: updated.error })
          return
        }
        recordAudit(actorName(req), 'update', 'role', updated.role.name)
        sendJson(res, 200, { code: 0, data: updated.role, message: 'ok' })
        return
      }

      if (roleId && req.method === 'DELETE') {
        if (!requireAction(req, res, 'role:delete')) return
        const name = mockRoleName(roleId) ?? roleId
        const removed = deleteMockRole(roleId, countMockUsersInRole(roleId))
        if ('error' in removed) {
          sendJson(res, 200, { code: 1, data: null, message: removed.error })
          return
        }
        recordAudit(actorName(req), 'delete', 'role', name)
        sendJson(res, 200, { code: 0, data: null, message: 'ok' })
        return
      }
    }

    if (path.startsWith('/api/system/link')) {
      if (req.method === 'GET' && path === '/api/system/link/list') {
        if (!requireLogin(req, res)) return
        const search = new URL(url, 'http://local.invalid').searchParams
        sendJson(res, 200, { code: 0, data: listMockLinks(search), message: 'ok' })
        return
      }

      if (req.method === 'POST' && path === '/api/system/link/batch-delete') {
        const body = await readJson(req)
        handleBatchDelete(
          req,
          res,
          'link:delete',
          normalizeIds(body.ids),
          '请选择要删除的外链',
          mockLinkName,
          deleteMockLink,
          'link',
        )
        return
      }

      if (req.method === 'POST' && path === '/api/system/link') {
        if (!requireAction(req, res, 'link:create')) return
        const body = await readJson(req)
        const created = createMockLink({
          code: String(body.code ?? ''),
          iframeSrc: String(body.iframeSrc ?? ''),
          status: body.status === 0 ? 0 : 1,
          title: String(body.title ?? ''),
        })
        if ('error' in created) {
          sendJson(res, 200, { code: 1, data: null, message: created.error })
          return
        }
        recordAudit(actorName(req), 'create', 'link', created.link.title)
        sendJson(res, 200, { code: 0, data: created.link, message: 'ok' })
        return
      }

      const linkMatch = path.match(/^\/api\/system\/link\/([^/]+)$/)
      const linkId = linkMatch?.[1]
      if (linkId && req.method === 'PUT') {
        if (!requireAction(req, res, 'link:update')) return
        const body = await readJson(req)
        const updated = updateMockLink(linkId, {
          code: String(body.code ?? ''),
          iframeSrc: String(body.iframeSrc ?? ''),
          status: body.status === 0 ? 0 : 1,
          title: String(body.title ?? ''),
        })
        if ('error' in updated) {
          sendJson(res, 200, { code: 1, data: null, message: updated.error })
          return
        }
        recordAudit(actorName(req), 'update', 'link', updated.link.title)
        sendJson(res, 200, { code: 0, data: updated.link, message: 'ok' })
        return
      }

      if (linkId && req.method === 'DELETE') {
        if (!requireAction(req, res, 'link:delete')) return
        const name = mockLinkName(linkId) ?? linkId
        const removed = deleteMockLink(linkId)
        if ('error' in removed) {
          sendJson(res, 200, { code: 1, data: null, message: removed.error })
          return
        }
        recordAudit(actorName(req), 'delete', 'link', name)
        sendJson(res, 200, { code: 0, data: null, message: 'ok' })
        return
      }
    }

    sendJson(res, 404, { code: 404, data: null, message: '接口不存在' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'mock 处理失败'
    sendJson(res, 500, { code: 500, data: null, message })
  }
}

export function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use(mockMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(mockMiddleware)
    },
  }
}
