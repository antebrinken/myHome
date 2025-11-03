export type Holiday = {
  date: string // YYYY-MM-DD
  localName: string
  name: string
}

const CACHE_PREFIX = 'holidays.SE.'

export async function fetchSwedishHolidays(year: number): Promise<Record<string, Holiday[]>> {
  const cacheKey = `${CACHE_PREFIX}${year}`
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) return JSON.parse(raw) as Record<string, Holiday[]>
  } catch {}

  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/SE`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch holidays')
  const data = (await res.json()) as Array<{ date: string; localName: string; name: string }>

  const byDate: Record<string, Holiday[]> = {}
  for (const h of data) {
    const item: Holiday = { date: h.date, localName: h.localName, name: h.name }
    if (!byDate[h.date]) byDate[h.date] = []
    byDate[h.date].push(item)
  }
  try { localStorage.setItem(cacheKey, JSON.stringify(byDate)) } catch {}
  return byDate
}

