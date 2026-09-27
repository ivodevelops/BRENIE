import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createTask, updateTask } from '../lib/data'
import { PRIORITIES, TASK_STATUSES, TASK_STATUS_LABEL } from '../lib/meta'
import type { Objective, Priority, Profile, Task, TaskInput, TaskStatus, Workstream } from '../lib/types'
import Modal from './Modal'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  onDelete?: (task: Task) => void
  initial?: Task | null
  fixedWorkstreamId?: string
  profiles: Profile[]
  objectives: Objective[]
  workstreams: Workstream[]
}

export default function TaskModal({
  open,
  onClose,
  onSaved,
  onDelete,
  initial,
  fixedWorkstreamId,
  profiles,
  objectives,
  workstreams,
}: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [objectiveId, setObjectiveId] = useState('')
  const [workstreamId, setWorkstreamId] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<TaskStatus>('pending')
  const [priority, setPriority] = useState<Priority>('medium')
  const [notes, setNotes] = useState('')
  const [link, setLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSaving(false)
    if (initial) {
      setTitle(initial.title)
      setAssignee(initial.assignee ?? '')
      setDueDate(initial.due_date ?? '')
      setStatus(initial.status)
      setPriority(initial.priority)
      setNotes(initial.notes)
      setLink(initial.link)
      const ws = workstreams.find((w) => w.id === initial.workstream_id)
      setWorkstreamId(initial.workstream_id)
      setObjectiveId(ws?.objective_id ?? '')
    } else {
      setTitle('')
      setAssignee('')
      setDueDate('')
      setStatus('pending')
      setPriority('medium')
      setNotes('')
      setLink('')
      if (fixedWorkstreamId) {
        const ws = workstreams.find((w) => w.id === fixedWorkstreamId)
        setWorkstreamId(fixedWorkstreamId)
        setObjectiveId(ws?.objective_id ?? '')
      } else {
        const firstObjective = objectives[0]
        const firstWs = firstObjective
          ? workstreams
              .filter((w) => w.objective_id === firstObjective.id)
              .sort((a, b) => a.position - b.position)[0]
          : undefined
        setObjectiveId(firstObjective?.id ?? '')
        setWorkstreamId(firstWs?.id ?? '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id])

  const wsOptions = useMemo(
    () => workstreams.filter((w) => w.objective_id === objectiveId).sort((a, b) => a.position - b.position),
    [workstreams, objectiveId],
  )

  const objectiveOf = (wsId: string) => {
    const ws = workstreams.find((w) => w.id === wsId)
    return objectives.find((o) => o.id === ws?.objective_id)
  }

  function pickObjective(id: string) {
    setObjectiveId(id)
    const first = workstreams
      .filter((w) => w.objective_id === id)
      .sort((a, b) => a.position - b.position)[0]
    setWorkstreamId(first?.id ?? '')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('La tarea necesita un título.')
      return
    }
    if (!workstreamId) {
      setError('Elegí a qué objetivo y frente pertenece.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const input: TaskInput = {
        workstream_id: workstreamId,
        title: title.trim(),
        assignee: assignee || null,
        due_date: dueDate || null,
        status,
        priority,
        notes: notes.trim(),
        link: link.trim(),
      }
      if (initial) {
        await updateTask(initial.id, input)
      } else {
        await createTask(input)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la tarea.')
    } finally {
      setSaving(false)
    }
  }

  const editing = Boolean(initial)
  const ws = editing ? workstreams.find((w) => w.id === initial?.workstream_id) : null
  const obj = editing ? objectiveOf(initial?.workstream_id ?? '') : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar tarea' : 'Nueva tarea'}
      subtitle={editing && obj && ws ? `${obj.title} · ${ws.name}` : undefined}
    >
      {!editing && objectives.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-3">
          Primero creá un objetivo para poder colgarle tareas.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="task-title">
              Título
            </label>
            <input
              id="task-title"
              className="input mt-1.5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Subir video del track 1"
              autoFocus
            />
          </div>

          {!editing && !fixedWorkstreamId && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="task-objective">
                  Objetivo
                </label>
                <select
                  id="task-objective"
                  className="input mt-1.5"
                  value={objectiveId}
                  onChange={(e) => pickObjective(e.target.value)}
                >
                  {objectives.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="task-workstream">
                  Frente
                </label>
                <select
                  id="task-workstream"
                  className="input mt-1.5"
                  value={workstreamId}
                  onChange={(e) => setWorkstreamId(e.target.value)}
                >
                  {wsOptions.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="task-assignee">
                Responsable
              </label>
              <select
                id="task-assignee"
                className="input mt-1.5"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-due">
                Fecha
              </label>
              <input
                id="task-due"
                type="date"
                className="input mt-1.5"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="task-status">
                Estado
              </label>
              <select
                id="task-status"
                className="input mt-1.5"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-priority">
                Prioridad
              </label>
              <select
                id="task-priority"
                className="input mt-1.5"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="task-link">
              Link (Drive, YouTube, etc.)
            </label>
            <input
              id="task-link"
              type="url"
              className="input mt-1.5"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div>
            <label className="label" htmlFor="task-notes">
              Notas
            </label>
            <textarea
              id="task-notes"
              className="input mt-1.5"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles, contexto, acuerdos…"
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex items-center justify-between gap-2 pt-1">
            {editing && onDelete ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm(`¿Eliminar la tarea "${initial?.title}"?`)) {
                    onDelete(initial as Task)
                  }
                }}
              >
                Eliminar
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear tarea'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}
