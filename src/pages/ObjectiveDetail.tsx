import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ObjectiveModal from '../components/ObjectiveModal'
import Progress from '../components/Progress'
import TaskModal from '../components/TaskModal'
import TaskRow from '../components/TaskRow'
import { useAppData } from '../context/AppData'
import { progressOf, tasksOfWorkstream, workstreamsOf } from '../lib/compute'
import { deleteObjective, deleteTask, deleteWorkstream, createWorkstream, renameWorkstream, setTaskStatus } from '../lib/data'
import { dueLabel, isOverdue } from '../lib/dates'
import { nextStatus, OBJECTIVE_STATUS_DOT, OBJECTIVE_STATUS_LABEL, OBJECTIVE_TYPE_LABEL } from '../lib/meta'
import type { Task } from '../lib/types'

interface TaskModalState {
  open: boolean
  task: Task | null
  workstreamId?: string
}

export default function ObjectiveDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { objectives, workstreams, tasks, profiles, run, refresh } = useAppData()
  const [editOpen, setEditOpen] = useState(false)
  const [taskModal, setTaskModal] = useState<TaskModalState>({ open: false, task: null })
  const [editingWs, setEditingWs] = useState<string | null>(null)
  const [wsDraft, setWsDraft] = useState('')
  const [newWs, setNewWs] = useState('')

  const objective = objectives.find((o) => o.id === id)
  const frentes = useMemo(
    () => (objective ? workstreamsOf(objective.id, workstreams) : []),
    [objective, workstreams],
  )
  const progress = useMemo(
    () => (objective ? progressOf(objective.id, workstreams, tasks) : null),
    [objective, workstreams, tasks],
  )

  if (!objective || !progress) {
    return (
      <div className="card p-10 text-center">
        <p className="text-ink-2">No encontramos este objetivo.</p>
        <Link to="/objetivos" className="mt-3 inline-block text-sm text-ink underline">
          Volver a objetivos
        </Link>
      </div>
    )
  }

  const obj = objective
  const prog = progress
  const overdue = obj.status !== 'done' && isOverdue(obj.due_date)

  async function toggleTask(task: Task) {
    await run(() => setTaskStatus(task.id, task.status === 'done' ? 'pending' : 'done'))
  }

  async function cycleTask(task: Task) {
    await run(() => setTaskStatus(task.id, nextStatus(task.status)))
  }

  async function deleteFromModal(task: Task) {
    await run(() => deleteTask(task.id))
    setTaskModal({ open: false, task: null })
  }

  async function removeObjective() {
    if (!window.confirm(`¿Eliminar "${obj.title}" y todas sus tareas? Esta acción no se puede deshacer.`)) return
    await deleteObjective(obj.id)
    navigate('/objetivos')
  }

  async function addFrente() {
    const name = newWs.trim()
    if (!name) return
    await run(() => createWorkstream(obj.id, name, frentes.length))
    setNewWs('')
  }

  async function saveWsName(wsId: string) {
    const name = wsDraft.trim()
    if (name) await run(() => renameWorkstream(wsId, name))
    setEditingWs(null)
  }

  async function removeWs(wsId: string, name: string) {
    if (!window.confirm(`¿Eliminar el frente "${name}" y todas sus tareas?`)) return
    await run(() => deleteWorkstream(wsId))
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/objetivos"
          className="inline-flex items-center gap-1 text-xs text-ink-3 transition-colors hover:text-ink"
        >
          <ChevronLeft size={14} /> Objetivos
        </Link>

        <div className="card mt-3 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{OBJECTIVE_TYPE_LABEL[obj.type]}</span>
                <span className="chip">
                  <span className={`h-1.5 w-1.5 rounded-full ${OBJECTIVE_STATUS_DOT[obj.status]}`} />
                  {OBJECTIVE_STATUS_LABEL[obj.status]}
                </span>
                <span className={`chip num ${overdue ? 'text-danger' : ''}`}>
                  {obj.due_date ? `Cierre · ${dueLabel(obj.due_date)}` : 'Sin fecha límite'}
                </span>
              </div>
              <h1 className="mt-3 font-display text-2xl md:text-3xl">{obj.title}</h1>
              {obj.description && <p className="mt-2 max-w-2xl text-sm text-ink-2">{obj.description}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button className="btn btn-ghost" onClick={() => setEditOpen(true)}>
                <Pencil size={14} /> Editar
              </button>
              <button className="btn btn-danger" onClick={() => void removeObjective()}>
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Progress pct={prog.pct} />
            <span className="num shrink-0 font-mono text-xs text-ink-3">
              {prog.pct}% · {prog.done}/{prog.total} tareas
            </span>
          </div>
        </div>
      </div>

      {frentes.map((ws) => {
        const wsTasks = tasksOfWorkstream(ws.id, tasks)
        const doneCount = wsTasks.filter((t) => t.status === 'done').length
        return (
          <section key={ws.id} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              {editingWs === ws.id ? (
                <input
                  className="input max-w-xs"
                  value={wsDraft}
                  autoFocus
                  onChange={(e) => setWsDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void saveWsName(ws.id)
                    if (e.key === 'Escape') setEditingWs(null)
                  }}
                  onBlur={() => void saveWsName(ws.id)}
                />
              ) : (
                <h2 className="font-display text-lg">
                  {ws.name}{' '}
                  <span className="num ml-1 font-mono text-xs text-ink-3">
                    {doneCount}/{wsTasks.length}
                  </span>
                </h2>
              )}
              <div className="flex shrink-0 gap-1">
                <button
                  className="rounded-btn p-1.5 text-ink-3 transition-colors hover:bg-card-hover hover:text-ink"
                  title="Renombrar frente"
                  onClick={() => {
                    setEditingWs(ws.id)
                    setWsDraft(ws.name)
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  className="rounded-btn p-1.5 text-ink-3 transition-colors hover:bg-card-hover hover:text-danger"
                  title="Eliminar frente"
                  onClick={() => void removeWs(ws.id, ws.name)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="mt-2 divide-y divide-edge-faint">
              {wsTasks.length === 0 ? (
                <p className="py-4 text-center text-xs text-ink-3">Sin tareas en este frente.</p>
              ) : (
                wsTasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    profiles={profiles}
                    onEdit={(task) => setTaskModal({ open: true, task })}
                    onToggle={toggleTask}
                    onCycle={cycleTask}
                  />
                ))
              )}
            </div>

            <button
              className="btn btn-ghost mt-3 w-full justify-start border-dashed text-ink-3"
              onClick={() => setTaskModal({ open: true, task: null, workstreamId: ws.id })}
            >
              <Plus size={14} /> Agregar tarea
            </button>
          </section>
        )
      })}

      <section className="card p-5">
        <h2 className="label">Agregar frente de trabajo</h2>
        <div className="mt-3 flex gap-2">
          <input
            className="input"
            placeholder="Ej: Merch, Radio, Sincronizaciones…"
            value={newWs}
            onChange={(e) => setNewWs(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void addFrente()
            }}
          />
          <button className="btn btn-ghost shrink-0" onClick={() => void addFrente()} disabled={!newWs.trim()}>
            <Plus size={14} /> Agregar
          </button>
        </div>
      </section>

      <ObjectiveModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => void refresh()}
        initial={obj}
      />
      <TaskModal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false, task: null })}
        onSaved={() => void refresh()}
        onDelete={(t) => void deleteFromModal(t)}
        initial={taskModal.task}
        fixedWorkstreamId={taskModal.workstreamId}
        profiles={profiles}
        objectives={objectives}
        workstreams={workstreams}
      />
    </div>
  )
}
