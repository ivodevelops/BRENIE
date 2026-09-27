import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import FilterChip from '../components/FilterChip'
import ObjectiveCard from '../components/ObjectiveCard'
import ObjectiveModal from '../components/ObjectiveModal'
import { useAppData } from '../context/AppData'
import { progressOf } from '../lib/compute'

type Tab = 'active' | 'done' | 'all'

const TABS: { value: Tab; label: string }[] = [
  { value: 'active', label: 'Activos' },
  { value: 'done', label: 'Completados' },
  { value: 'all', label: 'Todos' },
]

export default function Objectives() {
  const { objectives, workstreams, tasks, refresh } = useAppData()
  const [tab, setTab] = useState<Tab>('active')
  const [showNew, setShowNew] = useState(false)

  const activeCount = objectives.filter((o) => o.status === 'active' || o.status === 'paused').length
  const doneCount = objectives.filter((o) => o.status === 'done').length

  const filtered = useMemo(() => {
    const list = objectives.filter((o) =>
      tab === 'active'
        ? o.status === 'active' || o.status === 'paused'
        : tab === 'done'
          ? o.status === 'done'
          : true,
    )
    return [...list].sort((a, b) => {
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
      if (a.due_date) return -1
      if (b.due_date) return 1
      return b.created_at.localeCompare(a.created_at)
    })
  }, [objectives, tab])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Planificación</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Objetivos</h1>
          <p className="mt-1 text-sm text-ink-3">
            {activeCount} activos · {doneCount} completados
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> Nuevo objetivo
        </button>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <FilterChip key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>
            {t.label}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <p className="font-display text-lg text-ink-2">No hay objetivos acá</p>
          <p className="max-w-sm text-sm text-ink-3">
            Creá un objetivo (ej: "Lanzar álbum") y la plantilla te despliega los frentes con sus
            tareas listas para editar.
          </p>
          <button className="btn btn-primary mt-1" onClick={() => setShowNew(true)}>
            <Plus size={16} /> Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((o) => (
            <ObjectiveCard key={o.id} objective={o} progress={progressOf(o.id, workstreams, tasks)} />
          ))}
        </div>
      )}

      <ObjectiveModal open={showNew} onClose={() => setShowNew(false)} onSaved={() => void refresh()} />
    </div>
  )
}
