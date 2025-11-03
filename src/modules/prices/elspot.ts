export type Zone = 'SE1' | 'SE2' | 'SE3' | 'SE4'

export type PriceEntry = {
  start: Date
  end: Date
  sekPerKwh: number
}

export type ZoneDayPrices = Record<Zone, PriceEntry[]>

const ZONES: Zone[] = ['SE1', 'SE2', 'SE3', 'SE4']
const TZ = 'Europe/Stockholm'

function stockholmDateParts(d = new Date()) {
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(d)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
  }
}

export function formatTimeStockholm(date: Date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateStockholm(date: Date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function normalizePrice(item: any): number {
  if (typeof item?.SEK_per_kWh === 'number') return item.SEK_per_kWh
  if (typeof item?.['SEK_per_kWh'] === 'number') return item['SEK_per_kWh']
  // Some sources return öre/kWh
  const ore = item?.Öre_per_kWh ?? item?.['Öre_per_kWh'] ?? item?.Ore_per_kWh ?? item?.['Ore_per_kWh']
  if (typeof ore === 'number') return ore / 100
  const raw = item?.price ?? item?.value
  if (typeof raw === 'number' && raw > 10) return raw / 100 // assume öre
  if (typeof raw === 'number') return raw
  throw new Error('Unknown price format')
}

async function fetchZoneDay(zone: Zone, date = new Date()): Promise<PriceEntry[]> {
  const { year, month, day } = stockholmDateParts(date)
  const url = `https://www.elprisetjustnu.se/api/v1/prices/${year}/${month}-${day}_${zone}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed fetching ${zone} prices`)
  const data = (await res.json()) as any[]
  return data.map((it) => ({
    start: new Date(it.time_start),
    end: new Date(it.time_end),
    sekPerKwh: normalizePrice(it),
  }))
}

export async function fetchTodaySwedenPrices(date = new Date()): Promise<ZoneDayPrices> {
  const entries = await Promise.all(
    ZONES.map(async (z) => [z, await fetchZoneDay(z as Zone, date)] as const)
  )
  return Object.fromEntries(entries) as ZoneDayPrices
}

export function bestWindows(prices: PriceEntry[], windowHours: number) {
  if (windowHours <= 0 || prices.length < windowHours) return null
  let bestIdx = 0
  let bestSum = Number.POSITIVE_INFINITY
  let sum = 0
  for (let i = 0; i < windowHours; i++) sum += prices[i].sekPerKwh
  bestSum = sum
  bestIdx = 0
  for (let i = windowHours; i < prices.length; i++) {
    sum += prices[i].sekPerKwh - prices[i - windowHours].sekPerKwh
    if (sum < bestSum) {
      bestSum = sum
      bestIdx = i - windowHours + 1
    }
  }
  const window = prices.slice(bestIdx, bestIdx + windowHours)
  const avg = bestSum / windowHours
  return { start: window[0].start, end: window[window.length - 1].end, average: avg }
}

export function bestSellHour(prices: PriceEntry[]) {
  if (prices.length === 0) return null
  let idx = 0
  for (let i = 1; i < prices.length; i++) if (prices[i].sekPerKwh > prices[idx].sekPerKwh) idx = i
  return { start: prices[idx].start, end: prices[idx].end, price: prices[idx].sekPerKwh }
}

