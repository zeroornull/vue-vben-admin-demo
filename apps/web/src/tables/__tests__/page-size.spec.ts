import { describe, expect, it } from 'vitest'

import {
  emptyTablePageSizes,
  nextTablePage,
  normalizeTablePageSize,
  normalizeTablePageSizes,
  TABLE_PAGE_SIZE_DEFAULT,
} from '../page-size'

describe('normalizeTablePageSize', () => {
  it('keeps 10 / 20 / 50 / 100 and falls back to 10', () => {
    expect(normalizeTablePageSize(20)).toBe(20)
    expect(normalizeTablePageSize('50')).toBe(50)
    expect(normalizeTablePageSize(15)).toBe(TABLE_PAGE_SIZE_DEFAULT)
    expect(normalizeTablePageSize('nope')).toBe(TABLE_PAGE_SIZE_DEFAULT)
  })
})

describe('normalizeTablePageSizes', () => {
  it('fills missing keys and ignores junk', () => {
    expect(normalizeTablePageSizes({ users: 50, roles: 7 })).toEqual({
      ...emptyTablePageSizes(),
      users: 50,
    })
  })
})

describe('nextTablePage', () => {
  it('resets to page 1 when the size changes, keeps the page otherwise', () => {
    expect(nextTablePage(3, 10, 3, 50)).toEqual({ page: 1, pageSize: 50 })
    expect(nextTablePage(3, 10, 2, 10)).toEqual({ page: 2, pageSize: 10 })
    expect(nextTablePage(3, 10, 0, 10)).toEqual({ page: 3, pageSize: 10 })
    expect(nextTablePage(3, 50, 4, undefined)).toEqual({ page: 4, pageSize: 50 })
  })
})
