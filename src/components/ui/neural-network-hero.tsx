type Cta = { text: string; href: string; primary?: boolean }

type HeroProps = {
  title: string
  description?: string
  badgeText?: string
  badgeLabel?: string
  ctaButtons?: Cta[]
  microDetails?: string[]
  centered?: boolean
}

export default function Hero({
  title,
  description,
  badgeText,
  badgeLabel,
  ctaButtons = [],
  microDetails = [],
  centered,
}: HeroProps) {
  // No canvas/background here; the global background component handles visuals

  const isCentered = centered || (
    !description && !badgeText && !badgeLabel && (!ctaButtons?.length) && (!microDetails?.length)
  )

  return (
    <div className="relative isolate w-full flex-1 min-h-[60vh]">
      {/* Content only; background provided globally */}
      {isCentered ? (
        <div className="relative z-10 min-h-[60vh] flex items-center justify-center text-center px-6">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">{title}</h1>
        </div>
      ) : (
        <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-14 sm:py-24">
        {badgeText && (
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur">
            {badgeLabel && (
              <span className="inline-flex items-center rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-2 py-0.5 border border-sky-300/30">
                {badgeLabel}
              </span>
            )}
            <span className="text-xs text-white/80">{badgeText}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-white/70 text-sm sm:text-base">
            {description}
          </p>
        )}

        {ctaButtons.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {ctaButtons.map((c, i) => (
              <a
                key={i}
                href={c.href}
                className={
                  c.primary
                    ? 'rounded-lg border border-sky-300/30 bg-sky-500/15 text-sky-200 hover:bg-sky-500/25 px-4 py-2 text-sm'
                    : 'rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm'
                }
              >
                {c.text}
              </a>
            ))}
          </div>
        )}

        {microDetails.length > 0 && (
          <ul className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/60">
            {microDetails.map((m, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        )}
        </div>
      )}
    </div>
  )
}
