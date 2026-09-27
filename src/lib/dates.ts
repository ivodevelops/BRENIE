import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function toDate(iso: string): Date {
  return parseISO(iso.length === 10 ? `${iso}T00:00:00` : iso)
}

export function fmtDate(iso: string | null | undefined, pattern = "d 'de' MMM"): string {
  if (!iso) return 'Sin fecha'
  return format(toDate(iso), pattern, { locale: es })
}

export function daysUntil(iso: string): number {
  return differenceInCalendarDays(toDate(iso), new Date())
}

export function dueLabel(iso: string | null | undefined): string {
  if (!iso) return 'Sin fecha'
  const d = daysUntil(iso)
  if (d === 0) return 'Hoy'
  if (d === 1) return 'Mañana'
  if (d === -1) return 'Ayer'
  if (d < 0) return `Vencida hace ${Math.abs(d)} días`
  if (d <= 14) return `En ${d} días`
  return fmtDate(iso)
}

export function isOverdue(iso: string | null | undefined): boolean {
  if (!iso) return false
  return daysUntil(iso) < 0
}

export function countdown(iso: string): string {
  const d = daysUntil(iso)
  if (d === 0) return 'HOY'
  if (d === 1) return 'MAÑANA'
  if (d < 0) return `HACE ${Math.abs(d)} DÍAS`
  return `EN ${d} DÍAS`
}

export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
