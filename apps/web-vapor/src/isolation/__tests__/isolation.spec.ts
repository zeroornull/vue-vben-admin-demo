import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createVaporApp } from '@vue/runtime-vapor'
import { version } from 'vue'
import { describe, expect, it } from 'vitest'

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')
const appRoot = join(srcRoot, '..')
const repoRoot = join(appRoot, '../..')

const uiLibraries = [
  'ant-design-vue',
  'antdv-next',
  'element-plus',
  'naive-ui',
  'tdesign-vue-next',
  'vxe-pc-ui',
  'vxe-table',
]

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8')) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    workspaces?: { catalog?: Record<string, string> }
  }
}

describe('vue 3.6 experiment isolation', () => {
  it('resolves Vue 3.6 in this app only', () => {
    expect(version.startsWith('3.6.')).toBe(true)
    expect(typeof createVaporApp).toBe('function')
  })

  it('pins vue 3.6 rc, not catalog', () => {
    const pkg = readJson(join(appRoot, 'package.json'))
    expect(pkg.dependencies?.vue).toMatch(/^3\.6\./)
    expect(pkg.dependencies?.vue).not.toBe('catalog:')
  })

  it('keeps the default catalog on Vue 3.5', () => {
    const root = readJson(join(repoRoot, 'package.json'))
    const web = readJson(join(repoRoot, 'apps/web/package.json'))
    expect(root.workspaces?.catalog?.vue).toMatch(/3\.5/)
    expect(web.dependencies?.vue).toBe('catalog:')
  })

  it('does not depend on a UI library', () => {
    const pkg = readJson(join(appRoot, 'package.json'))
    for (const name of uiLibraries) {
      expect(pkg.dependencies?.[name], name).toBeUndefined()
      expect(pkg.devDependencies?.[name], name).toBeUndefined()
    }
  })

  it('never imports a UI library from source', () => {
    const pattern = new RegExp(`from ['"](?:${uiLibraries.join('|')})['"]`)
    const hits = walk(srcRoot).filter((file) => {
      if (!/\.(ts|vue)$/.test(file)) return false
      return pattern.test(readFileSync(file, 'utf8'))
    })
    expect(hits).toEqual([])
  })
})
