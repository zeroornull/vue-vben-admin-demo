import { describe, expect, it } from 'vitest'

import {
  BATCH_DELETE_MAX,
  batchDeleteConfirmText,
  batchDeleteDoneText,
  nextPageAfterDeletes,
  normalizeIds,
} from '../batch'

describe('normalizeIds / nextPageAfterDeletes', () => {
  it('dedupes ids and steps back when the page is emptied', () => {
    expect(normalizeIds(['a', ' a ', '', 'b', 'a'])).toEqual(['a', 'b'])
    expect(normalizeIds('nope')).toEqual([])
    expect(nextPageAfterDeletes(2, 1, 1)).toBe(1)
    expect(nextPageAfterDeletes(2, 3, 1)).toBe(2)
    expect(nextPageAfterDeletes(1, 1, 1)).toBe(1)
  })
})

describe('batch delete copy', () => {
  it('keeps the cap and mentions skips', () => {
    expect(BATCH_DELETE_MAX).toBe(20)
    expect(batchDeleteConfirmText(3, '个角色')).toContain('3')
    expect(batchDeleteDoneText(2, '个角色', 1)).toContain('跳过 1')
    expect(batchDeleteDoneText(2, '条外链', 0)).toBe('已删除 2 条外链')
  })
})
