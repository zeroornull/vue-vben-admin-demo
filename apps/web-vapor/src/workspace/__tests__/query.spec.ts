import { describe, expect, it } from 'vitest'

import { sparkBars, totalOf } from '../query.ts'

describe('workspace spark', () => {
  it('scales bars to the max value', () => {
    expect(sparkBars([0, 5, 10])).toEqual([
      { percent: 0, value: 0 },
      { percent: 50, value: 5 },
      { percent: 100, value: 10 },
    ])
  })

  it('stays at zero when the series is empty of magnitude', () => {
    expect(sparkBars([0, 0])).toEqual([
      { percent: 0, value: 0 },
      { percent: 0, value: 0 },
    ])
  })

  it('sums visits', () => {
    expect(totalOf([12, 19, 15])).toBe(46)
  })
})
