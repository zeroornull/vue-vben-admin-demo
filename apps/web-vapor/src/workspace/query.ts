export const WEEK_VISITS = [12, 19, 15, 28, 22, 31, 24] as const

export type SparkBar = {
  percent: number
  value: number
}

export function sparkBars(values: readonly number[]): SparkBar[] {
  const max = values.reduce((highest, value) => (value > highest ? value : highest), 0)
  return values.map((value) => ({
    percent: max === 0 ? 0 : Math.round((value / max) * 100),
    value,
  }))
}

export function totalOf(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0)
}
