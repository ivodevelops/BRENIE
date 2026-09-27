import { Link } from 'react-router-dom'
import type { ProgressInfo } from '../lib/compute'
import { dueLabel, isOverdue } from '../lib/dates'
import { OBJECTIVE_STATUS_DOT, OBJECTIVE_STATUS_LABEL, OBJECTIVE_TYPE_LABEL } from '../lib/meta'
import type { Objective } from '../lib/types'
import Progress from './Progress'

export default function ObjectiveCard({
  objective,
  progress,
}: {
  objective: Objective
  progress: ProgressInfo
}) {
  const overdue = objective.status !== 'done' && isOverdue(objective.due_date)

  return (
    <Link to={`/objetivos/${objective.id}`} className="card block p-5 transition-colors hover:bg-card-hover">
      <div className="flex items-center justify-between gap-3">
        <span className="chip">{OBJECTIVE_TYPE_LABEL[objective.type]}</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
          <span className={`h-1.5 w-1.5 rounded-full ${OBJECTIVE_STATUS_DOT[objective.status]}`} />
          {OBJECTIVE_STATUS_LABEL[objective.status]}
        </span>
      </div>
      <h3 className="mt-3 font-display text-xl leading-snug text-ink">{objective.title}</h3>
      <p className={`mt-1 font-mono text-xs ${overdue ? 'text-danger' : 'text-ink-3'}`}>
        {objective.due_date ? `Cierre · ${dueLabel(objective.due_date)}` : 'Sin fecha límite'}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Progress pct={progress.pct} />
        <span className="num font-mono text-xs text-ink-3">
          {progress.done}/{progress.total}
        </span>
      </div>
    </Link>
  )
}
