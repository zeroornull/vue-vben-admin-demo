import { describe, expect, it } from 'vitest'

import { isCustomEmbedLink } from '../display'

describe('isCustomEmbedLink', () => {
  it('keeps user-authored embed titles out of route i18n', () => {
    expect(isCustomEmbedLink({ name: 'embed', path: '/embed' })).toBe(false)
    expect(isCustomEmbedLink({ name: 'embed-link', path: '/embed' })).toBe(false)
    expect(isCustomEmbedLink({ name: 'embed-link', path: '/embed/docs' })).toBe(true)
  })
})
