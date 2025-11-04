import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext'
import { getUserById } from '../modules/auth/storage'
import Modal from '../components/Modal'

export default function ProfilePage() {
  const { user, logout, updateEmail, updateProfile } = useAuth()
  if (!user) return null
  const created = new Date(user.createdAt).toLocaleString()

  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState<string>('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarDataUrl ?? null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // Cropping state
  const [cropOpen, setCropOpen] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropScale, setCropScale] = useState(1)
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const cropImgRef = useRef<HTMLImageElement | null>(null)
  const draggingRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const full = getUserById(user.id)
    if (full) {
      setPhone(full.phone ?? '')
      setAvatarPreview(full.avatarDataUrl ?? null)
    }
  }, [user.id])

  function isValidE164(input: string) {
    // E.164: + followed by 7-15 digits, no spaces
    return /^\+[1-9]\d{6,14}$/.test(input)
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setPhoneError(null)
    // Update email first (it validates uniqueness)
    if (email.trim() !== user.email) {
      const res = await updateEmail(email.trim())
      if (!res.ok) {
        setSaving(false)
        setMessage(res.message)
        return
      }
    }
    // Validate phone (optional)
    const trimmedPhone = phone.trim()
    if (trimmedPhone && !isValidE164(trimmedPhone)) {
      setSaving(false)
      setPhoneError('Ange telefon i E.164-format, t.ex. +46701234567')
      return
    }

    // Update phone/avatar
    const res2 = await updateProfile({ phone: trimmedPhone || undefined, avatarDataUrl: avatarPreview || undefined })
    if (!res2.ok) setMessage(res2.message)
    else setMessage('Profil uppdaterad')
    setSaving(false)
  }

  function onPickFile() { fileInputRef.current?.click() }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError(null)
    const allowed = ['image/png', 'image/jpeg', 'image/webp']
    const maxBytes = 2 * 1024 * 1024 // 2 MB
    if (!allowed.includes(file.type)) {
      setAvatarError('Endast PNG, JPEG eller WEBP tillåts')
      return
    }
    if (file.size > maxBytes) {
      setAvatarError('Bilden är för stor (max 2 MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setCropSrc(result)
      setCropOpen(true)
      setCropScale(1)
      setCropX(0)
      setCropY(0)
    }
    reader.readAsDataURL(file)
  }
  return (
    <div className="max-w-lg mx-auto p-6 mt-10 bg-white/5 border border-white/10 rounded-2xl">
      <h1 className="text-2xl mb-4">Profil</h1>
      <form className="grid gap-4" onSubmit={onSave}>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full border border-white/20 bg-white/5 overflow-hidden flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-semibold">{user.email.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <button type="button" onClick={onPickFile} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">Byt bild</button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFileChange} />
            <div className="text-xs text-white/50 mt-1">PNG/JPEG/WEBP · max 2 MB · visas i menyn</div>
            {avatarError && <div className="text-xs text-rose-400 mt-1">{avatarError}</div>}
          </div>
        </div>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">E‑post (krävs)</span>
          <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">Telefon (valfritt)</span>
          <input className={`bg-white/10 border ${phoneError ? 'border-rose-400' : 'border-white/20'} rounded-lg px-3 py-2`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+46 ..." />
          {phoneError && <span className="text-xs text-rose-400">{phoneError}</span>}
        </label>

        <div className="text-xs text-white/50">Skapad: {created}</div>

        {message && <div className="text-sm text-sky-300">{message}</div>}
        <div className="flex gap-2">
          <button disabled={saving} className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20 disabled:opacity-60" type="submit">Spara</button>
          <button onClick={logout} type="button" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20 ml-auto">Logga ut</button>
        </div>
      </form>

      {/* Cropper Modal */}
      <Modal open={cropOpen} onClose={() => setCropOpen(false)} title="Justera profilbild">
        <div className="grid gap-3">
          <div className="mx-auto" style={{ width: 320 }}>
            <div className="relative w-[320px] h-[320px] overflow-hidden rounded-xl border border-white/10 bg-black/30">
              {cropSrc && (
                <img
                  ref={cropImgRef}
                  src={cropSrc}
                  alt="Crop"
                  className="absolute left-1/2 top-1/2 select-none"
                  style={{ transform: `translate(-50%,-50%) translate(${cropX}px, ${cropY}px) scale(${cropScale})`, transformOrigin: 'center center', userSelect: 'none' as any }}
                  onLoad={(e) => {
                    const img = e.currentTarget
                    const w = img.naturalWidth
                    const h = img.naturalHeight
                    const s = Math.max(320 / w, 320 / h)
                    setCropScale(s)
                    setCropX(0)
                    setCropY(0)
                  }}
                  onMouseDown={(e) => { draggingRef.current = { x: e.clientX, y: e.clientY } }}
                  onMouseMove={(e) => {
                    if (!draggingRef.current) return
                    const dx = e.clientX - draggingRef.current.x
                    const dy = e.clientY - draggingRef.current.y
                    draggingRef.current = { x: e.clientX, y: e.clientY }
                    setCropX((v) => v + dx)
                    setCropY((v) => v + dy)
                  }}
                  onMouseUp={() => { draggingRef.current = null }}
                  onMouseLeave={() => { draggingRef.current = null }}
                  onTouchStart={(e) => { const t = e.touches[0]; draggingRef.current = { x: t.clientX, y: t.clientY } }}
                  onTouchMove={(e) => { if (!draggingRef.current) return; const t = e.touches[0]; const dx = t.clientX - draggingRef.current.x; const dy = t.clientY - draggingRef.current.y; draggingRef.current = { x: t.clientX, y: t.clientY }; setCropX((v)=>v+dx); setCropY((v)=>v+dy) }}
                  onTouchEnd={() => { draggingRef.current = null }}
                />
              )}
              {/* circular mask indicator */}
              <div className="pointer-events-none absolute inset-0">
                <svg width="320" height="320" viewBox="0 0 320 320" className="absolute inset-0">
                  <defs>
                    <mask id="circleMask">
                      <rect width="320" height="320" fill="white" />
                      <circle cx="160" cy="160" r="140" fill="black" />
                    </mask>
                  </defs>
                  <rect width="320" height="320" fill="rgba(0,0,0,0.4)" mask="url(#circleMask)" />
                  <circle cx="160" cy="160" r="140" fill="none" stroke="rgba(255,255,255,0.5)" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.01}
              value={cropScale}
              onChange={(e) => setCropScale(parseFloat(e.target.value))}
              className="w-full mt-3"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 hover:bg-white/20" onClick={() => setCropOpen(false)} type="button">Avbryt</button>
            <button
              className="rounded-lg border border-sky-300/30 bg-sky-500/15 text-sky-200 hover:bg-sky-500/25 px-3 py-1.5"
              type="button"
              onClick={() => {
                const img = cropImgRef.current
                if (!img) return
                const canvas = document.createElement('canvas')
                const out = 512
                canvas.width = out
                canvas.height = out
                const ctx = canvas.getContext('2d')!
                const vw = 320
                const vh = 320
                const cx = img.naturalWidth / 2
                const cy = img.naturalHeight / 2
                const sx = cx + ((0 - vw / 2 - cropX) / cropScale)
                const sy = cy + ((0 - vh / 2 - cropY) / cropScale)
                const sw = vw / cropScale
                const sh = vh / cropScale
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, out, out)
                const url = canvas.toDataURL('image/png')
                setAvatarPreview(url)
                setCropOpen(false)
              }}
            >
              Använd bild
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
