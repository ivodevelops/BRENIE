import { useEffect, useState, type FormEvent } from 'react'
import { createObjective, updateObjective } from '../lib/data'
import { OBJECTIVE_STATUSES, OBJECTIVE_TYPES } from '../lib/meta'
import type { Objective, ObjectiveInput, ObjectiveStatus, ObjectiveType } from '../lib/types'
import Modal from './Modal'

interface ObjectiveModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  initial?: Objective | null
}

export default function ObjectiveModal({ open, onClose, onSaved, initial }: ObjectiveModalProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ObjectiveType>('album')
  const [status, setStatus] = useState<ObjectiveStatus>('active')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [withTemplate, setWithTemplate] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSaving(false)
    if (initial) {
      setTitle(initial.title)
      setType(initial.type)
      setStatus(initial.status)
      setDueDate(initial.due_date ?? '')
      setDescription(initial.description)
    } else {
      setTitle('')
      setType('album')
      setStatus('active')
      setDueDate('')
      setDescription('')
      setWithTemplate(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('El objetivo necesita un título.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const input: ObjectiveInput = {
        title: title.trim(),
        type,
        description: description.trim(),
        due_date: dueDate || null,
        status,
      }
      if (initial) {
        await updateObjective(initial.id, input)
      } else {
        await createObjective(input, withTemplate && type !== 'general')
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el objetivo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Editar objetivo' : 'Nuevo objetivo'}
      subtitle={
        initial ? undefined : 'Las plantillas precargan frentes y tareas estándar según el tipo.'
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="obj-title">
            Título
          </label>
          <input
            id="obj-title"
            className="input mt-1.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Ej: Lanzar álbum "PORTAL"'
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="obj-type">
              Tipo
            </label>
            <select
              id="obj-type"
              className="input mt-1.5"
              value={type}
              onChange={(e) => setType(e.target.value as ObjectiveType)}
              disabled={Boolean(initial)}
            >
              {OBJECTIVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="obj-due">
              Fecha límite
            </label>
            <input
              id="obj-due"
              type="date"
              className="input mt-1.5"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {initial && (
          <div>
            <label className="label" htmlFor="obj-status">
              Estado
            </label>
            <select
              id="obj-status"
              className="input mt-1.5"
              value={status}
              onChange={(e) => setStatus(e.target.value as ObjectiveStatus)}
            >
              {OBJECTIVE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label" htmlFor="obj-desc">
            Descripción
          </label>
          <textarea
            id="obj-desc"
            className="input mt-1.5"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qué significa cumplir este objetivo…"
          />
        </div>

        {!initial && type !== 'general' && (
          <label className="flex cursor-pointer items-center gap-3 rounded-btn border border-edge px-3 py-2.5 text-sm text-ink-2 transition-colors hover:border-edge-strong">
            <input
              type="checkbox"
              checked={withTemplate}
              onChange={(e) => setWithTemplate(e.target.checked)}
              className="h-4 w-4 accent-[#e8e3d8]"
            />
            Crear con plantilla de frentes y tareas (100% editable después)
          </label>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear objetivo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
