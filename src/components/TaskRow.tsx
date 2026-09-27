import { Check } from 'lucide-react'
import { initials } from '../lib/compute'
import { dueLabel, isOverdue } from '../lib/dates'
import { TASK_STATUS_DOT, TASK_STATUS_LABEL, TASK_STATUS_TEXT } from '../lib/meta'
import type { Profile, Task } from '../lib/types'

interface TaskRowProps {
  task: Task
  profiles: Profile[]
  onEdit: (task: Task) => void
  onToggle: (task: Task) => void
  onCycle: (task: Task) => void
}

export default function TaskRow({ task, profiles, onEdit, onToggle, onCycle }: TaskRowProps) {
  const done = task.status === 'done'
  const overdue = !done && isOverdue(task.due_date)
  const assignee = profiles.find((p) => p.id === task.assignee)

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-btn px-2 py-2 transition-colors hover:bg-card-hover"
      onClick={() => onEdit(task)}
    >
      <button
        aria-label={done ? 'Marcar como pendiente' : 'Marcar como hecho'}
        onClick={(e) => {
          e.stopPropagation()
          onToggle(task)
        }}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          done
            ? 'border-ok bg-ok text-on-bone'
            : 'border-edge-strong text-transparent hover:border-bone hover:text-ink-3'
        }`}
      >
        <Check size={11} strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${done ? 'text-ink-3 line-through' : 'text-ink'}`}>{task.title}</p>
        {(task.due_date || assignee || task.priority === 'high') && (
          <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px]">
            {task.due_date && (
              <span className={overdue ? 'text-danger' : 'text-ink-3'}>{dueLabel(task.due_date)}</span>
            )}
            {assignee && <span className="text-ink-3">{initials(assignee.display_name)}</span>}
            {task.priority === 'high' && !done && <span className="text-warn">ALTA</span>}
          </div>
        )}
      </div>

      <button
        title="Cambiar estado"
        onClick={(e) => {
          e.stopPropagation()
          onCycle(task)
        }}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-edge px-2 py-0.5 font-mono text-[11px] transition-colors hover:border-edge-strong ${TASK_STATUS_TEXT[task.status]}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${TASK_STATUS_DOT[task.status]}`} />
        <span className="hidden sm:inline">{TASK_STATUS_LABEL[task.status]}</span>
      </button>
    </div>
  )
}
