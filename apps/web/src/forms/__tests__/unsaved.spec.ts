import { describe, expect, it } from 'vitest'

import { isDirtyForm, shouldBlockLeave, snapshotForm } from '../unsaved'

describe('snapshotForm / isDirtyForm', () => {
  it('treats key order and string-array order as the same snapshot', () => {
    expect(snapshotForm({ b: 1, a: ['r-2', 'r-1'] })).toBe(snapshotForm({ a: ['r-1', 'r-2'], b: 1 }))
    expect(isDirtyForm(snapshotForm({ name: 'Ada' }), { name: 'Ada' })).toBe(false)
    expect(isDirtyForm(snapshotForm({ name: 'Ada' }), { name: 'Bob' })).toBe(true)
    expect(isDirtyForm('', { name: 'Ada' })).toBe(false)
    expect(shouldBlockLeave(true)).toBe(true)
    expect(shouldBlockLeave(false)).toBe(false)
  })

  it('keeps object-array order and treats null as a value', () => {
    expect(
      isDirtyForm(snapshotForm({ items: [{ id: '1' }, { id: '2' }] }), {
        items: [{ id: '2' }, { id: '1' }],
      }),
    ).toBe(true)
    expect(isDirtyForm(snapshotForm({ deptId: null }), { deptId: null })).toBe(false)
    expect(isDirtyForm(snapshotForm({ deptId: null }), { deptId: 'd-1' })).toBe(true)
  })
})
