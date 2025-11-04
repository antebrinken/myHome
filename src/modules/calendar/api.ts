export type ApiEvent = {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  time: string
  text: string
  createdAt: number
}

export async function fetchEvents(userId: string, date?: string): Promise<ApiEvent[]> {
  const qs = new URLSearchParams({ userId, ...(date ? { date } : {}) })
  const res = await fetch(`/api/events?${qs.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch events')
  const data = await res.json()
  return data.events as ApiEvent[]
}

export async function createEvent(input: { userId: string; date: string; time: string; text: string }): Promise<ApiEvent> {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create event')
  const data = await res.json()
  return data.event as ApiEvent
}

export async function deleteEvent(userId: string, id: string): Promise<void> {
  const res = await fetch(`/api/events/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete event')
}

