import { describe, expect, it } from 'vitest'

import { hasNewBuild, nextBuildId, shouldPollVersion } from '../version'

describe('hasNewBuild', () => {
  it('needs two different non-empty ids', () => {
    expect(hasNewBuild('', 'dev-2')).toBe(false)
    expect(hasNewBuild('dev-1', 'dev-1')).toBe(false)
    expect(hasNewBuild('dev-1', 'dev-2')).toBe(true)
  })
})

describe('shouldPollVersion', () => {
  it('skips a hidden tab or a locked session', () => {
    expect(shouldPollVersion(false, false)).toBe(true)
    expect(shouldPollVersion(true, false)).toBe(false)
    expect(shouldPollVersion(false, true)).toBe(false)
  })
})

describe('nextBuildId', () => {
  it('bumps the trailing number', () => {
    expect(nextBuildId('dev-1')).toBe('dev-2')
    expect(nextBuildId('build')).toBe('build-2')
  })
})
