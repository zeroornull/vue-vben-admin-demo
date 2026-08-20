export const BATCH_DELETE_MAX = 20

export type BatchDeleteResult = {
  deleted: number
  skipped: number
}

export function normalizeIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return []
  return [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))]
}

export function nextPageAfterDeletes(page: number, itemsOnPage: number, deletedOnPage: number): number {
  if (page <= 1) return 1
  if (itemsOnPage - deletedOnPage > 0) return page
  return page - 1
}

export function batchDeleteConfirmText(count: number, unit: string): string {
  return `确定删除选中的 ${count} ${unit}？内存 mock，刷新后种子会回来。`
}

export function batchDeleteDoneText(deleted: number, unit: string, skipped: number): string {
  if (skipped) return `已删除 ${deleted} ${unit}，跳过 ${skipped} 个`
  return `已删除 ${deleted} ${unit}`
}
