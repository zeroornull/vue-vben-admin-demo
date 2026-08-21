export function shouldClosePopover(
  event: { target: EventTarget | null },
  root: { contains: (node: Node) => boolean } | null,
  open: boolean,
): boolean {
  if (!open || !root) return false
  if (event.target instanceof Node && root.contains(event.target)) return false
  return true
}
