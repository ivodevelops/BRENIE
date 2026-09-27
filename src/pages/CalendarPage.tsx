import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TaskModal from '../components/TaskModal'
import TaskRow from '../components/TaskRow'
import { useAppData } from '../context/AppData'
import { setTaskStatus } from '../lib/data'
import { fmtDate, todayIso } from '../lib/dates'
import { nextStatus, TASK_STATUS_DOT } from '../lib/meta'
import type { Task } from '../lib/types'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

interface CalEvent {
  key: string
  title: string
  dot: string
  task?: Task
  objectiveId?: string
  dim?: boolean
}

export default function CalendarPage() {
  const { objectives, workstreams, tasks, profiles, run, refresh } = useAppData()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState(todayIso())
  const [editTask, setEditTask] = useState<Task | null>(null)

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(month, { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }),
    [month],
  )

  const byDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>()
    const push = (date: string, event: CalEvent) => {
      const list = map.get(date) ?? []
      list.push(event)
      map.set(date, list)
    }
    tasks.forEach((t) => {
      if (!t.due_date) return
      const ws = workstreams.find((w) => w.id === t.workstream_id)
      push(t.due_date, {
        key: `t-${t.id}`,
        title: t.title,
        dot: TASK_STATUS_DOT[t.status],
        task: t,
        objectiveId: ws?.objective_id,
        dim: t.status === 'done',
      })
    })
    objectives.forEach((o) => {
      if (!o.due_date) return
      push(o.due_date, {
        key: `o-${o.id}`,
        title: `Cierre · ${o.title}`,
        dot: 'bg-bone',
        objectiveId: o.id,
        dim: o.status === 'done',
      })
    })
    return map
  }, [tasks, objectives, workstreams])

  const selectedEvents = byDay.get(selected) ?? []

  async function toggleTask(task: Task) {
    await run(() => setTaskStatus(task.id, task.status === 'done' ? 'pending' : 'done'))
  }

  async function cycleTask(task: Task) {
    await run(() => setTaskStatus(task.id, nextStatus(task.status)))
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl capitalize md:text-4xl">
          {format(month, 'MMMM yyyy', { locale: es })}
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded-btn border border-edge p-2 text-ink-2 transition-colors hover:border-edge-strong hover:text-ink"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label="Mes anterior"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setMonth(startOfMonth(new Date()))
              setSelected(todayIso())
            }}
          >
            Hoy
          </button>
          <button
            className="rounded-btn border border-edge p-2 text-ink-2 transition-colors hover:border-edge-strong hover:text-ink"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-card border border-edge">
        <div className="grid grid-cols-7 gap-px bg-edge-faint">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-card px-2 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-ink-3"
            >
              {d}
            </div>
          ))}
          {days.map((day) => {
            const iso = format(day, 'yyyy-MM-dd')
            const events = byDay.get(iso) ?? []
            const inMonth = isSameMonth(day, month)
            const isSelected = selected === iso
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={`min-h-20 bg-canvas p-1.5 text-left align-top transition-colors md:min-h-28 md:p-2 ${
                  isSelected ? 'bg-card' : 'hover:bg-card'
                }`}
              >
                <span
                  className={`num inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] ${
                    isToday(day) ? 'bg-bone text-on-bone' : inMonth ? 'text-ink-3' : 'text-ink-disabled'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                <div className={`mt-1 space-y-0.5 ${inMonth ? '' : 'opacity-40'}`}>
                  {events.slice(0, 2).map((e) => (
                    <div key={e.key} className={`flex items-center gap-1.5 ${e.dim ? 'opacity-40' : ''}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${e.dot}`} />
                      <span className="truncate text-[10px] leading-tight text-ink-2 md:text-[11px]">
                        {e.title}
                      </span>
                    </div>
                  ))}
                  {events.length > 2 && (
                    <p className="pl-3 font-mono text-[10px] text-ink-3">+{events.length - 2} más</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <section className="card p-5">
        <h2 className="label capitalize">{fmtDate(selected, "EEEE d 'de' MMMM")}</h2>
        <div className="mt-3 divide-y divide-edge-faint">
          {selectedEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-3">Nada agendado este día.</p>
          ) : (
            selectedEvents.map((e) =>
              e.task ? (
                <TaskRow
                  key={e.key}
                  task={e.task}
                  profiles={profiles}
                  onEdit={setEditTask}
                  onToggle={toggleTask}
                  onCycle={cycleTask}
                />
              ) : (
                <Link
                  key={e.key}
                  to={`/objetivos/${e.objectiveId}`}
                  className="flex items-center gap-3 rounded-btn px-2 py-3 transition-colors hover:bg-card-hover"
                >
                  <Target size={15} className="shrink-0 text-ink-3" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{e.title}</span>
                  <ChevronRight size={14} className="shrink-0 text-ink-3" />
                </Link>
              ),
            )
          )}
        </div>
      </section>

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
