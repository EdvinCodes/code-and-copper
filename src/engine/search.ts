export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function matchesQuery(query: string, ...parts: string[]): boolean {
  const needle = normalizeSearch(query.trim())
  if (!needle) return true
  return normalizeSearch(parts.join(' ')).includes(needle)
}
