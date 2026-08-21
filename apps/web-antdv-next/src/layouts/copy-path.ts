export const COPY_FEEDBACK_MS = 1500

export function copyableFullPath(fullPath: string): string | null {
  if (!fullPath.startsWith('/') || fullPath.startsWith('//')) return null
  const withoutHash = fullPath.split('#')[0] ?? ''
  const pathPart = withoutHash.split('?')[0] ?? ''
  if (!pathPart.startsWith('/') || pathPart.startsWith('//')) return null
  const query = withoutHash.slice(pathPart.length + 1)
  return query ? `${pathPart}?${query}` : pathPart
}

export function copyPathLabel(copied: boolean): string {
  return copied ? '已复制' : '复制路径'
}

export async function writeClipboardText(
  text: string,
  clipboard: { writeText: (value: string) => Promise<void> },
): Promise<boolean> {
  try {
    await clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
