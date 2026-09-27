import type { ObjectiveStatus, ObjectiveType, Priority, TaskStatus } from './types'

export const OBJECTIVE_TYPES: { value: ObjectiveType; label: string }[] = [
  { value: 'album', label: 'Álbum' },
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'video', label: 'Video' },
  { value: 'general', label: 'General' },
]

export const OBJECTIVE_TYPE_LABEL: Record<ObjectiveType, string> = {
  album: 'Álbum',
  single: 'Single',
  ep: 'EP',
  video: 'Video',
  general: 'General',
}

export const OBJECTIVE_STATUSES: { value: ObjectiveStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'done', label: 'Completado' },
  { value: 'archived', label: 'Archivado' },
]

export const OBJECTIVE_STATUS_LABEL: Record<ObjectiveStatus, string> = {
  active: 'Activo',
  paused: 'Pausado',
  done: 'Completado',
  archived: 'Archivado',
}

export const OBJECTIVE_STATUS_DOT: Record<ObjectiveStatus, string> = {
  active: 'bg-ok',
  paused: 'bg-warn',
  done: 'bg-flat',
  archived: 'bg-flat',
}

export const TASK_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'blocked', 'done']

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  blocked: 'Bloqueado',
  done: 'Hecho',
}

export const TASK_STATUS_DOT: Record<TaskStatus, string> = {
  pending: 'bg-flat',
  in_progress: 'bg-info',
  blocked: 'bg-danger',
  done: 'bg-ok',
}

export const TASK_STATUS_TEXT: Record<TaskStatus, string> = {
  pending: 'text-ink-3',
  in_progress: 'text-info',
  blocked: 'text-danger',
  done: 'text-ok',
}

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
]

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export const PRIORITY_DOT: Record<Priority, string> = {
  low: 'bg-flat',
  medium: 'bg-info',
  high: 'bg-warn',
}

export function nextStatus(current: TaskStatus): TaskStatus {
  const i = TASK_STATUSES.indexOf(current)
  return TASK_STATUSES[(i + 1) % TASK_STATUSES.length]
}
