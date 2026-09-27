export default function Progress({ pct, className = '' }: { pct: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-edge ${className}`}>
      <div
        className="h-full rounded-full bg-bone transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  )
}
