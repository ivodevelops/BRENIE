import type { Objective, Task, Workstream } from './types'

export interface ProgressInfo {
  total: number
  done: number
  pct: number
}

export function progressOf(objectiveId: string, workstreams: Workstream[], tasks: Task[]): ProgressInfo {
  const ids = new Set(workstreams.filter((w) => w.objective_id === objectiveId).map((w) => w.id))
  const list = tasks.filter((t) => ids.has(t.workstream_id))
  const done = list.filter((t) => t.status === 'done').length
  const total = list.length
  return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export function workstreamsOf(objectiveId: string, workstreams: Workstream[]): Workstream[] {
  return workstreams
    .filter((w) => w.objective_id === objectiveId)
    .sort((a, b) => a.position - b.position)
}

export function tasksOfWorkstream(workstreamId: string, tasks: Task[]): Task[] {
  return sortTasks(tasks.filter((t) => t.workstream_id === workstreamId))
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
    if (a.due_date) return -1
    if (b.due_date) return 1
    return a.position - b.position
  })
}

export function objectiveOfTask(task: Task, workstreams: Workstream[], objectives: Objective[]): Objective | null {
  const ws = workstreams.find((w) => w.id === task.workstream_id)
  if (!ws) return null
  return objectives.find((o) => o.id === ws.objective_id) ?? null
}

export function initials(name: string): string {
  const clean = name.trim()
  if (!clean) return '?'
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
