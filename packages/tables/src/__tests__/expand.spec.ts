import { describe, expect, it } from 'vitest'

import { mergeExpandedKeys, normalizeExpandKeys, normalizeTableExpandState } from '../expand.ts'

describe('normalizeExpandKeys / mergeExpandedKeys', () => {
  it('expands every row until the user changes one', () => {
    expect(normalizeExpandKeys(null, ['a', 'b'])).toEqual(['a', 'b'])
    expect(normalizeExpandKeys(['b', 'ghost'], ['a', 'b'])).toEqual(['b'])
    expect(normalizeTableExpandState(undefined).depts).toBeNull()
  })

  it('keeps hidden branches when the filtered tree reports a change', () => {
    expect(mergeExpandedKeys(['a'], ['a', 'b'], null, ['a', 'b', 'c'])).toEqual(['c', 'a'])
    expect(mergeExpandedKeys([], ['b'], ['a', 'b'], ['a', 'b'])).toEqual(['a'])
  })
})
