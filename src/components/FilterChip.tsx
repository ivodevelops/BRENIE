import type { ReactNode } from 'react'

export default function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors ${
        active
          ? 'border-bone bg-bone text-on-bone'
          : 'border-edge text-ink-3 hover:border-edge-strong hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
