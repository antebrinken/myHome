import { ChangeEvent, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import Page from '../components/Page'
import Card from '../components/Card'
import { useSupabaseSession } from '@/components/SupabaseAuthGate'
import { useProfile, DEFAULT_AVATAR_SIZE } from '@/modules/profile/ProfileContext'

const CROP_SIZE = 240

type CropEditorState = {
  src: string
  image: HTMLImageElement
  zoom: number
  minZoom: number
  maxZoom: number
  offset: { x: number; y: number }
  imageWidth: number
  imageHeight: number
}

export default function ProfilePage() {
  const session = useSupabaseSession()
  const user = session.user
  const { avatarDataUrl, setAvatarDataUrl, resetProfile } = useProfile()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [cropEditor, setCropEditor] = useState<CropEditorState | null>(null)
  const avatarSize = DEFAULT_AVATAR_SIZE

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setIsUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const image = await loadImageElement(dataUrl)
      const minZoom = Math.max(CROP_SIZE / image.width, CROP_SIZE / image.height)
      const maxZoom = minZoom * 4
      const initialDisplayWidth = image.width * minZoom
      const initialDisplayHeight = image.height * minZoom
      setCropEditor({
        src: dataUrl,
        image,
        zoom: minZoom,
        minZoom,
        maxZoom,
        offset: {
          x: (CROP_SIZE - initialDisplayWidth) / 2,
          y: (CROP_SIZE - initialDisplayHeight) / 2,
        },
        imageWidth: image.width,
        imageHeight: image.height,
      })
    } finally {
      setIsUploading(false)
    }
  }

  function clearAvatar() {
    setAvatarDataUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Page id="profile">
      <h2 className="mb-4 text-2xl font-semibold">Profile</h2>
      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <Card className="p-5">
          <div className="space-y-5 text-sm">
            <div>
              <div className="text-white/60">Email (obligatoriskt)</div>
              <div className="text-base font-medium text-white">{user?.email ?? 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <label className="text-white/60" htmlFor="profile-nickname">Smeknamn (valfritt)</label>
              <input
                id="profile-nickname"
                type="text"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Smeknamn"
              />
            </div>
            <div className="space-y-2">
              <label className="text-white/60" htmlFor="profile-phone">Telefonnummer (valfritt)</label>
              <input
                id="profile-phone"
                type="tel"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="+46..."
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Avatar</h3>
            <button
              type="button"
              className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wide hover:bg-white/10"
              onClick={() => {
                resetProfile()
                setCropEditor(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
            >
              Reset
            </button>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-4">
              <div
                className="rounded-full border border-white/10 bg-white/5 p-1"
                style={{ width: avatarSize + 8, height: avatarSize + 8 }}
              >
                <div
                  className="h-full w-full overflow-hidden rounded-full border border-indigo-400/50 bg-slate-800 object-cover"
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  {avatarDataUrl ? (
                    <img
                      src={avatarDataUrl}
                      alt="Profile avatar preview"
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
                      Ingen bild
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="rounded-md border border-indigo-400/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-100 hover:bg-indigo-500/30"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Laddar...' : 'Välj bild'}
                </button>
                {avatarDataUrl && (
                  <button
                    type="button"
                    className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white hover:bg-white/10"
                    onClick={clearAvatar}
                  >
                    Ta bort bild
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
      {cropEditor && (
        <CropEditorOverlay
          state={cropEditor}
          onClose={() => {
            setCropEditor(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
          onConfirm={(result) => {
            setAvatarDataUrl(result)
            setCropEditor(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
        />
      )}
    </Page>
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      resolve(result)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = (error) => reject(error)
    image.src = src
  })
}

type CropEditorOverlayProps = {
  state: CropEditorState
  onClose: () => void
  onConfirm: (dataUrl: string) => void
}

function CropEditorOverlay({ state, onClose, onConfirm }: CropEditorOverlayProps) {
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null)
  const [currentState, setCurrentState] = useState(state)

  useEffect(() => {
    setCurrentState(state)
  }, [state])

  const displayWidth = currentState.imageWidth * currentState.zoom
  const displayHeight = currentState.imageHeight * currentState.zoom
  const zoomStep = Math.max((currentState.maxZoom - currentState.minZoom) / 50, currentState.minZoom / 10)

  function clampOffsets(x: number, y: number, width: number, height: number) {
    const minX = CROP_SIZE - width
    const minY = CROP_SIZE - height
    return {
      x: clamp(x, minX, 0),
      y: clamp(y, minY, 0),
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault()
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialX: currentState.offset.x,
      initialY: currentState.offset.y,
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragRef.current) return
      const { startX, startY, initialX, initialY } = dragRef.current
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      setCurrentState((prev) => {
        const width = prev.imageWidth * prev.zoom
        const height = prev.imageHeight * prev.zoom
        const next = clampOffsets(initialX + deltaX, initialY + deltaY, width, height)
        if (next.x === prev.offset.x && next.y === prev.offset.y) {
          return prev
        }
        return { ...prev, offset: next }
      })
    }

    const handlePointerUp = () => {
      dragRef.current = null
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  function handleZoomChange(value: number) {
    setCurrentState((prev) => {
      const newZoom = value
      const prevDisplayWidth = prev.imageWidth * prev.zoom
      const prevDisplayHeight = prev.imageHeight * prev.zoom
      const centerRatioX = (CROP_SIZE / 2 - prev.offset.x) / prevDisplayWidth
      const centerRatioY = (CROP_SIZE / 2 - prev.offset.y) / prevDisplayHeight
      const newDisplayWidth = prev.imageWidth * newZoom
      const newDisplayHeight = prev.imageHeight * newZoom
      let nextX = CROP_SIZE / 2 - centerRatioX * newDisplayWidth
      let nextY = CROP_SIZE / 2 - centerRatioY * newDisplayHeight
      const clamped = clampOffsets(nextX, nextY, newDisplayWidth, newDisplayHeight)
      return { ...prev, zoom: newZoom, offset: clamped }
    })
  }

  function handleConfirm() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onConfirm(currentState.src)
      return
    }
    canvas.width = DEFAULT_AVATAR_SIZE
    canvas.height = DEFAULT_AVATAR_SIZE

    const sourceX = (-currentState.offset.x / displayWidth) * currentState.imageWidth
    const sourceY = (-currentState.offset.y / displayHeight) * currentState.imageHeight
    const sourceWidth = (CROP_SIZE / displayWidth) * currentState.imageWidth
    const sourceHeight = (CROP_SIZE / displayHeight) * currentState.imageHeight

    ctx.drawImage(
      currentState.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    )

    onConfirm(canvas.toDataURL('image/png'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <h3 className="text-lg font-semibold">Justera din bild</h3>
        <p className="mt-1 text-xs text-white/60">Dra bilden för att ändra utsnittet och använd reglaget för att zooma.</p>
        <div className="mt-5 flex flex-col items-center gap-5">
          <div
            className="rounded-full border border-white/10 bg-slate-900/40 p-2"
            style={{ width: CROP_SIZE + 16, height: CROP_SIZE + 16 }}
          >
            <div
              className="relative h-full w-full overflow-hidden rounded-full bg-slate-800"
              style={{ width: CROP_SIZE, height: CROP_SIZE }}
              onPointerDown={handlePointerDown}
            >
              <img
                src={currentState.src}
                alt="Bildredigerare"
                className="absolute select-none cursor-grab active:cursor-grabbing"
                style={{
                  width: displayWidth,
                  height: displayHeight,
                  left: currentState.offset.x,
                  top: currentState.offset.y,
                }}
                draggable={false}
              />
            </div>
          </div>
          <label className="flex w-full flex-col gap-2 text-xs text-white/60">
            Zoom
            <input
              type="range"
              min={currentState.minZoom}
              max={currentState.maxZoom}
              step={zoomStep}
              value={currentState.zoom}
              onChange={(event) => handleZoomChange(Number(event.target.value))}
            />
          </label>
          <div className="flex w-full justify-end gap-3 text-sm">
            <button
              type="button"
              className="rounded-md border border-white/20 bg-white/5 px-4 py-2 font-medium hover:bg-white/10"
              onClick={onClose}
            >
              Avbryt
            </button>
            <button
              type="button"
              className="rounded-md border border-indigo-400/50 bg-indigo-500/20 px-4 py-2 font-semibold text-indigo-100 hover:bg-indigo-500/30"
              onClick={handleConfirm}
            >
              Spara bild
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
