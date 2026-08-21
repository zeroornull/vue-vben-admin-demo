export function readUnlockPassword(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function passwordsMatch(input: string, expected: string): boolean {
  return input === expected
}
