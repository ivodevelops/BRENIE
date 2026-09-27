import { ChevronRight, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FilterChip from '../components/FilterChip'
import Progress from '../components/Progress'
import TaskModal from '../components/TaskModal'
import TaskRow from '../components/TaskRow'
import { useAppData } from '../context/AppData'
import { progressOf, sortTasks } from '../lib/compute'
import { setTaskStatus } from '../lib/data'
import { countdown, daysUntil, fmtDate } from '../lib/dates'
import { nextStatus } from '../lib/meta'
import type { Task } from '../lib/types'

interface CalEvent {
  key: string
  date: string
  title: string
  objectiveId?: string
}

export default function Home() {
  const { objectives, workstreams, tasks, profiles, artist, run, refresh } = useAppData()
  const [weekFilter, setWeekFilter] = useState('all')
  const [editTask, setEditTask] = useState<Task | null>(null)

  const actives = useMemo(
    () =>
      objectives
        .filter((o) => o.status === 'active' || o.status === 'paused')
        .sort((a, b) => {
          if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
          if (a.due_date) return -1
          if (b.due_date) return 1
          return 0
        }),
    [objectives],
  )

  const primary = actives.find((o) => o.status === 'active' && o.due_date) ?? actives[0] ?? null
  const primaryProgress = primary ? progressOf(primary.id, workstreams, tasks) : null

  const weekTasks = useMemo(() => {
    const list = tasks.filter(
      (t) =>
        t.status !== 'done' &&
        (t.status === 'blocked' || (t.due_date !== null && daysUntil(t.due_date) <= 7)),
    )
    const filtered = weekFilter === 'all' ? list : list.filter((t) => t.assignee === weekFilter)
    return sortTasks(filtered).slice(0, 12)
  }, [tasks, weekFilter])

  const events = useMemo(() => {
    const list: CalEvent[] = []
    tasks.forEach((t) => {
      if (t.due_date && t.status !== 'done') {
        list.push({ key: `t-${t.id}`, date: t.due_date, title: t.title })
      }
    })
    objectives.forEach((o) => {
      if (o.due_date && o.status !== 'done') {
        list.push({ key: `o-${o.id}`, date: o.due_date, title: o.title, objectiveId: o.id })
      }
    })
    return list
      .filter((e) => daysUntil(e.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6)
  }, [tasks, objectives])

  async function toggleTask(task: Task) {
    await run(() => setTaskStatus(task.id, task.status === 'done' ? 'pending' : 'done'))
  }

  async function cycleTask(task: Task) {
    await run(() => setTaskStatus(task.id, nextStatus(task.status)))
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-card border border-edge shadow-hero">
        {artist?.hero_photo_url ? (
          <img src={artist.hero_photo_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-float via-card to-canvas" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/55 to-transparent" />
        <div className="relative flex min-h-[62svh] flex-col justify-end p-6 md:min-h-[56vh] md:p-10">
          <p className="label">{artist?.era ? `Era ${artist.era}` : 'Hub de proyecto'}</p>
          <h1 className="mt-2 font-display text-5xl leading-[0.95] md:text-7xl">
            {artist?.name || 'BRENIE'}
          </h1>
          {artist?.tagline && <p className="mt-3 max-w-xl text-sm text-ink-2 md:text-base">{artist.tagline}</p>}
          {primary && (
            <div className="mt-8 w-full max-w-md rounded-card border border-edge bg-canvas/60 p-4 backdrop-blur-md md:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="label">Próximo hito</p>
                {primary.due_date && <span className="chip num">{countdown(primary.due_date)}</span>}
              </div>
              <Link
                to={`/objetivos/${primary.id}`}
                className="mt-2 block truncate font-display text-lg text-ink transition-colors hover:text-bone-hover"
              >
                {primary.title}
              </Link>
              {primaryProgress && (
                <div className="mt-3 flex items-center gap-3">
                  <Progress pct={primaryProgress.pct} />
                  <span className="num font-mono text-xs text-ink-3">{primaryProgress.pct}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="card p-5 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="label">Mi semana</h2>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={weekFilter === 'all'} onClick={() => setWeekFilter('all')}>
                Todo
              </FilterChip>
              {profiles.map((p) => (
                <FilterChip key={p.id} active={weekFilter === p.id} onClick={() => setWeekFilter(p.id)}>
                  {p.display_name || 'Sin nombre'}
                </FilterChip>
              ))}
            </div>
          </div>
          <div className="mt-3 divide-y divide-edge-faint">
            {weekTasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-3">
                Nada urgente por acá. Buen momento para adelantar trabajo.
              </p>
            ) : (
              weekTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  profiles={profiles}
                  onEdit={setEditTask}
                  onToggle={toggleTask}
                  onCycle={cycleTask}
                />
              ))
            )}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="label">Próximos eventos</h2>
              <Link
                to="/calendario"
                className="inline-flex items-center text-xs text-ink-3 transition-colors hover:text-ink"
              >
                Calendario <ChevronRight size={13} />
              </Link>
            </div>
            <ul className="mt-3 space-y-1">
              {events.length === 0 && (
                <li className="py-6 text-center text-sm text-ink-3">Sin eventos próximos.</li>
              )}
              {events.map((e) => {
                const content = (
                  <>
                    <span className="chip num shrink-0">{fmtDate(e.date, 'd MMM')}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{e.title}</span>
                    {e.objectiveId && <Target size={13} className="shrink-0 text-ink-3" />}
                  </>
                )
                return (
                  <li key={e.key}>
                    {e.objectiveId ? (
                      <Link
                        to={`/objetivos/${e.objectiveId}`}
                        className="flex items-center gap-3 rounded-btn px-1 py-1.5 transition-colors hover:bg-card-hover"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 rounded-btn px-1 py-1.5">{content}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="label">Objetivos activos</h2>
              <Link
                to="/objetivos"
                className="inline-flex items-center text-xs text-ink-3 transition-colors hover:text-ink"
              >
                Ver todos <ChevronRight size={13} />
              </Link>
            </div>
            <div className="mt-1">
              {actives.length === 0 && (
                <p className="py-6 text-center text-sm text-ink-3">Sin objetivos activos todavía.</p>
              )}
              {actives.slice(0, 4).map((o) => {
                const p = progressOf(o.id, workstreams, tasks)
                return (
                  <Link key={o.id} to={`/objetivos/${o.id}`} className="block py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm text-ink">{o.title}</span>
                      <span className="num font-mono text-xs text-ink-3">{p.pct}%</span>
                    </div>
                    <Progress pct={p.pct} className="mt-2" />
                  </Link>
                )
              })}
            </div>
          </section>
        </div>
      </div>

      <TaskModal
        open={editTask !== null}
        onClose={() => setEditTask(null)}
        onSaved={() => void refresh()}
        initial={editTask}
        profiles={profiles}
        objectives={objectives}
        workstreams={workstreams}
      />
    </div>
  )
}
