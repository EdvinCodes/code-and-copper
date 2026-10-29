const formatters = new Map<number, Intl.NumberFormat>()

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  let formatter = formatters.get(maximumFractionDigits)
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-ES', {
      maximumFractionDigits,
      minimumFractionDigits: 0,
      useGrouping: true,
    })
    formatters.set(maximumFractionDigits, formatter)
  }
  return formatter.format(value)
}

export function parseDecimal(input: string): number | null {
  const trimmed = input.trim().replace(',', '.')
  if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

export function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}
