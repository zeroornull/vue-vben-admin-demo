export const UNSAVED_LEAVE_MESSAGE = '有未保存的修改，确定离开？'

function normalizeSnapshot(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items = value.map(normalizeSnapshot)
    if (items.every((item) => typeof item === 'string')) {
      return [...items].sort()
    }
    return items
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizeSnapshot(item)]),
    )
  }
  return value
}

export function snapshotForm(value: unknown): string {
  return JSON.stringify(normalizeSnapshot(value))
}

export function isDirtyForm(baseline: string, value: unknown): boolean {
  if (!baseline) return false
  return snapshotForm(value) !== baseline
}

export function shouldBlockLeave(dirty: boolean): boolean {
  return dirty
}
