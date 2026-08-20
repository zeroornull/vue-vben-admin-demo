import { describe, expect, it } from 'vitest'

import {
  clampSearchCursor,
  flattenSearchHits,
  moveSearchCursor,
  jumpSearchCursor,
  searchCursorKey,
  searchDigitIndex,
  searchHitAt,
} from '../cursor'

describe('moveSearchCursor / clampSearchCursor', () => {
  it('wraps at both ends and stays empty when there are no hits', () => {
    expect(moveSearchCursor(0, 1, 3)).toBe(1)
    expect(moveSearchCursor(2, 1, 3)).toBe(0)
    expect(moveSearchCursor(0, -1, 3)).toBe(2)
    expect(moveSearchCursor(-1, 1, 3)).toBe(0)
    expect(moveSearchCursor(0, 1, 0)).toBe(-1)
    expect(clampSearchCursor(8, 3)).toBe(2)
    expect(clampSearchCursor(-2, 3)).toBe(0)
    expect(clampSearchCursor(0, 0)).toBe(-1)
  })
})

describe('flattenSearchHits / searchHitAt', () => {
  it('walks recents then the rest, and Enter uses the cursor', () => {
    expect(flattenSearchHits(['a'], ['b', 'c'])).toEqual(['a', 'b', 'c'])
    expect(searchHitAt(['a', 'b'], 1)).toBe('b')
    expect(searchHitAt(['a', 'b'], 9)).toBe('a')
    expect(searchHitAt([], 0)).toBeUndefined()
    expect(searchCursorKey({ key: 'ArrowDown' })).toBe(1)
    expect(searchCursorKey({ key: 'ArrowUp' })).toBe(-1)
    expect(searchCursorKey({ key: 'Enter' })).toBe(0)
    expect(jumpSearchCursor('Home', 4)).toBe(0)
    expect(jumpSearchCursor('End', 4)).toBe(3)
    expect(jumpSearchCursor('End', 0)).toBe(-1)
    expect(jumpSearchCursor('ArrowDown', 4)).toBeNull()
    expect(searchDigitIndex('2', '', 5)).toBe(1)
    expect(searchDigitIndex('9', '', 3)).toBeNull()
    expect(searchDigitIndex('2', '用', 5)).toBeNull()
    expect(searchDigitIndex('0', '', 10)).toBe(9)
    expect(searchDigitIndex('0', '', 9)).toBeNull()
    expect(searchDigitIndex('0', '用', 10)).toBeNull()
  })
})
