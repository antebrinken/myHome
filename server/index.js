// Minimal calendar events server using Node's HTTP module
// Endpoints:
// GET    /api/events?userId=... [&date=YYYY-MM-DD]
// POST   /api/events    { userId, date, time, text }
// DELETE /api/events/:id?userId=...

import http from 'http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATA_DIR = join(__dirname, 'data')
const EVENTS_FILE = join(DATA_DIR, 'events.json')
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let supabaseAdmin = null
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
} else {
  console.warn('[server] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Account deletion will be disabled.')
}

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(EVENTS_FILE)) writeFileSync(EVENTS_FILE, '[]', 'utf8')
}

function readEvents() {
  ensureStore()
  try {
    const raw = readFileSync(EVENTS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeEvents(events) {
  ensureStore()
  writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8')
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}) } catch (e) { reject(e) }
    })
  })
}

const server = http.createServer(async (req, res) => {
  // Only handle /api/*
  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname

  // Basic CORS for direct access (Vite proxy will also be used)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  try {
    if (req.method === 'GET' && path === '/api/events') {
      const userId = url.searchParams.get('userId')
      const date = url.searchParams.get('date')
      if (!userId) return sendJson(res, 400, { error: 'userId required' })
      const events = readEvents().filter((e) => e.userId === userId && (!date || e.date === date))
      return sendJson(res, 200, { events })
    }

    if (req.method === 'POST' && path === '/api/events') {
      const body = await parseBody(req)
      const { userId, date, time, text } = body || {}
      if (!userId || !date || !time || !text) return sendJson(res, 400, { error: 'userId, date, time, text required' })
      const ev = {
        id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        userId,
        date,
        time,
        text: String(text).trim(),
        createdAt: Date.now(),
      }
      const all = readEvents()
      all.push(ev)
      writeEvents(all)
      return sendJson(res, 201, { event: ev })
    }

    if (req.method === 'DELETE' && path.startsWith('/api/events/')) {
      const id = path.split('/').pop()
      const userId = url.searchParams.get('userId')
      if (!id || !userId) return sendJson(res, 400, { error: 'id and userId required' })
      const all = readEvents()
      const before = all.length
      const kept = all.filter((e) => !(e.id === id && e.userId === userId))
      if (kept.length === before) return sendJson(res, 404, { error: 'Not found' })
      writeEvents(kept)
      return sendJson(res, 200, { ok: true })
    }

    if (req.method === 'DELETE' && path === '/api/account') {
      if (!supabaseAdmin) return sendJson(res, 503, { error: 'Account deletion is not configured.' })
      const authHeader = req.headers.authorization || ''
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
      if (!token) return sendJson(res, 401, { error: 'Authorization token missing.' })

      const { data: { user }, error: getUserError } = await supabaseAdmin.auth.getUser(token)
      if (getUserError || !user) {
        return sendJson(res, 401, { error: 'Invalid or expired session.' })
      }

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (deleteError) {
        console.error('[server] Failed to delete user', deleteError)
        return sendJson(res, 500, { error: 'Could not delete user.' })
      }

      const avatarPath = user.user_metadata?.avatar_path
      if (avatarPath) {
        await supabaseAdmin.storage
          .from('SupaBucket')
          .remove([avatarPath])
          .catch((storageError) => console.warn('[server] Failed to remove avatar', storageError))
      }

      try {
        const events = readEvents()
        const filtered = events.filter((event) => event.userId !== user.id)
        writeEvents(filtered)
      } catch (cleanupError) {
        console.warn('[server] Failed to clean up user events', cleanupError)
        // continue, deletion already succeeded
      }

      return sendJson(res, 200, { ok: true })
    }

    if (path === '/health') { res.writeHead(200); res.end('ok'); return }

    res.writeHead(404)
    res.end('Not Found')
  } catch (e) {
    console.error('Server error', e)
    sendJson(res, 500, { error: 'Internal Server Error' })
  }
})

server.listen(PORT, () => {
  console.log(`Calendar server running on http://localhost:${PORT}`)
})
