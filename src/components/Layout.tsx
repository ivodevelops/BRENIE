import { CalendarDays, ClipboardList, Home, LogOut, Plus, Settings, Target } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAppData } from '../context/AppData'
import { useAuth } from '../context/Auth'
import { initials } from '../lib/compute'
import Modal from './Modal'
import ObjectiveModal from './ObjectiveModal'
import TaskModal from './TaskModal'

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/objetivos', label: 'Objetivos', icon: Target, end: false },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays, end: false },
  { to: '/ajustes', label: 'Ajustes', icon: Settings, end: false },
]

export default function Layout() {
  const { artist, profiles, objectives, workstreams, loading, error, refresh } = useAppData()
  const { session, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [creating, setCreating] = useState<null | 'objective' | 'task'>(null)

  const me = profiles.find((p) => p.id === session?.user.id)
  const artistName = artist?.name || 'BRENIE'

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-btn px-3 py-2 text-sm transition-colors ${
      isActive ? 'bg-card text-ink shadow-rim' : 'text-ink-2 hover:bg-card hover:text-ink'
    }`

  const artistBadge = (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-edge bg-float">
        {artist?.hero_photo_url ? (
          <img src={artist.hero_photo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-sm text-ink-2">
            {initials(artistName)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-sm text-ink">{artistName}</p>
        <p className="label">Backstage OS</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-edge bg-canvas px-4 py-6 md:flex">
        {artistBadge}
        <button className="btn btn-primary mt-6 w-full" onClick={() => setMenuOpen(true)}>
          <Plus size={16} />
          Nuevo
        </button>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-edge-faint pt-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{me?.display_name || 'Miembro'}</p>
              <p className="truncate text-[11px] text-ink-3">{session?.user.email}</p>
            </div>
            <button
              onClick={() => void signOut()}
              className="rounded-btn p-2 text-ink-3 transition-colors hover:bg-card hover:text-ink"
              title="Cerrar sesión"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Barra superior móvil */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-edge-faint bg-canvas/85 px-4 py-3 backdrop-blur md:hidden">
        {artistBadge}
        <button
          onClick={() => void signOut()}
          className="rounded-btn p-2 text-ink-3 transition-colors hover:text-ink"
          title="Cerrar sesión"
        >
          <LogOut size={15} />
        </button>
      </header>

      {/* Contenido */}
      <main className="md:pl-60">
        <div className="mx-auto w-full max-w-5xl px-4 pb-32 pt-6 md:px-10 md:pb-16 md:pt-10">
          {error && (
            <div className="mb-6 rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="label animate-pulse">Cargando…</p>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>

      {/* Nav inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-edge bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                isActive ? 'text-ink' : 'text-ink-3'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* FAB móvil */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-bone text-on-bone shadow-float transition-transform hover:scale-105 active:scale-95 md:hidden"
        aria-label="Crear"
      >
        <Plus size={20} />
      </button>

      {/* Menú de creación */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Crear" subtitle="¿Qué querés sumar?">
        <div className="grid gap-2">
          <button
            className="btn btn-ghost justify-start px-4 py-3"
            onClick={() => {
              setMenuOpen(false)
              setCreating('objective')
            }}
          >
            <Target size={16} />
            Objetivo (álbum, single, gira…)
          </button>
          <button
            className="btn btn-ghost justify-start px-4 py-3"
            onClick={() => {
              setMenuOpen(false)
              setCreating('task')
            }}
          >
            <ClipboardList size={16} />
            Tarea (va dentro de un objetivo)
          </button>
        </div>
      </Modal>

      <ObjectiveModal
        open={creating === 'objective'}
        onClose={() => setCreating(null)}
        onSaved={() => void refresh()}
      />
      <TaskModal
        open={creating === 'task'}
        onClose={() => setCreating(null)}
        onSaved={() => void refresh()}
        profiles={profiles}
        objectives={objectives}
        workstreams={workstreams}
      />
    </div>
  )
}
