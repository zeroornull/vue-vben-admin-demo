import type { IncomingMessage, ServerResponse } from 'node:http'

import type { Connect, Plugin } from 'vite'

import { hasAccessCode, resolveActionCodes, resolveMenuCodes } from '../src/access/resolve.ts'
import { passwordsMatch, readUnlockPassword } from '../src/auth/unlock.ts'
import type { SystemDept } from '../src/views/depts/types.ts'
import { validateProfileForm } from '../src/views/profile/query.ts'

import {
  createMockDept,
  deleteMockDept,
  listMockDepts,
  updateMockDept,
} from './depts-store.ts'
import {
  createMockRole,
  deleteMockRole,
  listMockRoleFlat,
  listMockRoles,
  updateMockRole,
} from './roles-store.ts'
import {
  countMockUsersInDept,
  countMockUsersInRole,
  createMockUser,
  deleteMockUser,
  listMockUsers,
  updateMockUser,
} from './users-store.ts'
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
      const account = ACCOUNTS[username]
      if (!account || !passwordsMatch(password, account.password)) {
        sendJson(res, 200, { code: 1, data: null, message: '账号或密码错误' })
        return
      }
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
      sendJson(res, 200, {
        code: 0,
        data: sessionPayload(username, account),
        message: 'ok',
      })
      return
    }

    if (path.startsWith('/api/system/user')) {
      if (req.method === 'GET' && path === '/api/system/user/list') {
        if (!requireLogin(req, res)) return

        const search = new URL(url, 'http://local.invalid').searchParams
        sendJson(res, 200, { code: 0, data: listMockUsers(search), message: 'ok' })
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
        sendJson(res, 200, { code: 0, data: result.user, message: 'ok' })
        return
      }

      if (userId && req.method === 'DELETE') {
        if (!requireAction(req, res, 'user:delete')) return
        const result = deleteMockUser(userId)
        if ('error' in result) {
          sendJson(res, 200, { code: 1, data: null, message: result.error })
          return
        }
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
        sendJson(res, 200, { code: 0, data: result.dept, message: 'ok' })
        return
      }

      if (deptId && req.method === 'DELETE') {
        if (!requireAction(req, res, 'dept:delete')) return
        const result = deleteMockDept(deptId, countMockUsersInDept(deptId))
        if ('error' in result) {
          sendJson(res, 200, { code: 1, data: null, message: result.error })
          return
        }
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
        sendJson(res, 200, { code: 0, data: updated.role, message: 'ok' })
        return
      }

      if (roleId && req.method === 'DELETE') {
        if (!requireAction(req, res, 'role:delete')) return
        const removed = deleteMockRole(roleId, countMockUsersInRole(roleId))
        if ('error' in removed) {
          sendJson(res, 200, { code: 1, data: null, message: removed.error })
          return
        }
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
