import type { PropsWithChildren, HTMLAttributes } from 'react'

export default function Card({ children, className = '', ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl ${className}`} {...rest}>
      {children}
    </div>
  )
}

