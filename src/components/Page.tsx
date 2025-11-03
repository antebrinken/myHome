import type { PropsWithChildren } from 'react'

export default function Page({ children, id }: PropsWithChildren<{ id?: string }>) {
  return (
    <main id={id} className="py-14 border-b border-white/5">
      <div className="max-w-[1100px] mx-auto px-5">
        {children}
      </div>
    </main>
  )
}

