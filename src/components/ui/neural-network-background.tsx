import { useEffect, useRef } from 'react'

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

    function fit() {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    type Node = { x: number; y: number; vx: number; vy: number; r: number }
    const nodes: Node[] = []
    const max = 80

    function seed() {
      nodes.length = 0
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      for (let i = 0; i < max; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 1.2 + Math.random() * 1.6,
        })
      }
    }

    function draw() {
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      ctx.clearRect(0, 0, W, H)

      const grad = ctx.createRadialGradient(W * 0.5, H * 0.6, 10, W * 0.5, H * 0.6, Math.max(W, H) * 0.9)
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.14)') // indigo glow
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < -10) n.x = W + 10
        if (n.x > W + 10) n.x = -10
        if (n.y < -10) n.y = H + 10
        if (n.y > H + 10) n.y = -10
      }

      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist2 = dx * dx + dy * dy
          const maxDist = 110
          if (dist2 < maxDist * maxDist) {
            const t = 1 - Math.sqrt(dist2) / maxDist
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 + t * 0.22})`
            ctx.lineWidth = 0.7 + t * 0.7
            ctx.stroke()
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over'

      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)'
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      fit()
      seed()
    }

    fit()
    seed()
    window.addEventListener('resize', onResize)
    raf = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
    </div>
  )
}

