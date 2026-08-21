import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')
const appRoot = join(srcRoot, '..')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

describe('antd family isolation', () => {
  it('does not depend on ant-design-vue@4', () => {
    const pkg = JSON.parse(readFileSync(join(appRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    expect(pkg.dependencies?.['ant-design-vue']).toBeUndefined()
    expect(pkg.devDependencies?.['ant-design-vue']).toBeUndefined()
    expect(pkg.dependencies?.['antdv-next']).toBeTruthy()
  })

  it('never imports ant-design-vue from source', () => {
    const hits = walk(srcRoot).filter((file) => {
      if (!/\.(ts|vue)$/.test(file)) return false
      return /from ['"]ant-design-vue['"]/.test(readFileSync(file, 'utf8'))
    })
    expect(hits).toEqual([])
  })
})
