export const BACK_TOP_THRESHOLD = 320

export function shouldShowBackTop(scrollTop: number, threshold = BACK_TOP_THRESHOLD): boolean {
  return scrollTop >= threshold
}
