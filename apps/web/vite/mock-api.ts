import type { IncomingMessage, ServerResponse } from 'node:http'

import type { Connect, Plugin } from 'vite'

type MockUser = {
  password: string
  realName: string
  roles: string[]
  userId: string
}

const ACCOUNTS: Record<string, MockUser> = {
  vben: {
    password: '123456',
    realName: 'Vben',
    roles: ['admin', 'user'],
    userId: '1',
  },
  admin: {
    password: '123456',
    realName: 'Admin',
    roles: ['admin'],
    userId: '2',
  },
  user: {
    password: '123456',
    realName: 'User',
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

function usernameFromToken(header: string | undefined): string | undefined {
  if (!header?.startsWith('Bearer mock.')) {
    return undefined
  }
  const username = header.slice('Bearer mock.'.length)
  return username in ACCOUNTS ? username : undefined
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
      const password = String(body.password ?? '')
      const account = ACCOUNTS[username]
      if (!account || account.password !== password) {
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

    if (req.method === 'POST' && path === '/api/auth/logout') {
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
        data: {
          homePath: '/',
          realName: account.realName,
          roles: account.roles,
          userId: account.userId,
          username,
        },
        message: 'ok',
      })
      return
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
