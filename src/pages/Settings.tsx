import { LogOut, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useAppData } from '../context/AppData'
import { useAuth } from '../context/Auth'
import { initials } from '../lib/compute'
import { updateArtistProfile, updateProfile, uploadHeroPhoto } from '../lib/data'

export default function SettingsPage() {
  const { session, signOut } = useAuth()
  const { profiles, artist, refresh } = useAppData()
  const me = profiles.find((p) => p.id === session?.user.id)

  const [name, setName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [era, setEra] = useState('')
  const [tagline, setTagline] = useState('')
  const [flash, setFlash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(me?.display_name ?? '')
  }, [me?.display_name])

  useEffect(() => {
    if (artist) {
      setArtistName(artist.name)
      setEra(artist.era)
      setTagline(artist.tagline)
    }
  }, [artist])

  function showFlash(msg: string) {
    setFlash(msg)
    setError(null)
    window.setTimeout(() => setFlash(null), 2500)
  }

  function showError(err: unknown) {
    setError(err instanceof Error ? err.message : 'Algo salió mal')
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    if (!me) return
    try {
      await updateProfile(me.id, name.trim())
      await refresh()
      showFlash('Perfil guardado')
    } catch (err) {
      showError(err)
    }
  }

  async function saveArtist(e: FormEvent) {
    e.preventDefault()
    try {
      await updateArtistProfile({
        name: artistName.trim() || 'BRENIE',
        era: era.trim(),
        tagline: tagline.trim(),
      })
      await refresh()
      showFlash('Ficha guardada')
    } catch (err) {
      showError(err)
    }
  }

  async function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const url = await uploadHeroPhoto(file)
      await updateArtistProfile({ hero_photo_url: url })
      await refresh()
      showFlash('Foto actualizada')
    } catch (err) {
      showError(err)
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="label">Configuración</p>
        <h1 className="mt-1 font-display text-3xl md:text-4xl">Ajustes</h1>
      </header>

      {(flash || error) && (
        <div
          className={`rounded-card border px-4 py-3 text-sm ${
            error ? 'border-danger/30 bg-danger/10 text-danger' : 'border-ok/30 bg-ok/10 text-ok'
          }`}
        >
          {error ?? flash}
        </div>
      )}

      <section className="card p-5 md:p-6">
        <h2 className="label">Tu perfil</h2>
        <form onSubmit={saveProfile} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label" htmlFor="me-name">
              Tu nombre en el equipo
            </label>
            <input
              id="me-name"
              className="input mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Director creativo"
            />
          </div>
          <button type="submit" className="btn btn-primary shrink-0" disabled={!me}>
            Guardar
          </button>
        </form>
        <p className="mt-2 text-xs text-ink-3">{session?.user.email}</p>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="label">Ficha de la artista</h2>
        <form onSubmit={saveArtist} className="mt-3 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="artist-name">
                Nombre
              </label>
              <input
                id="artist-name"
                className="input mt-1.5"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="BRENIE"
              />
            </div>
            <div>
              <label className="label" htmlFor="artist-era">
                Era / proyecto actual
              </label>
              <input
                id="artist-era"
                className="input mt-1.5"
                value={era}
                onChange={(e) => setEra(e.target.value)}
                placeholder='Ej: "PORTAL"'
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="artist-tagline">
              Frase corta
            </label>
            <input
              id="artist-tagline"
              className="input mt-1.5"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej: Primer álbum — otoño 2026"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar ficha
          </button>
        </form>

        <div className="mt-6 border-t border-edge-faint pt-5">
          <h3 className="label">Foto del Home</h3>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="aspect-[16/9] w-full max-w-xs overflow-hidden rounded-card border border-edge bg-float">
              {artist?.hero_photo_url ? (
                <img src={artist.hero_photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl text-ink-3">
                  {initials(artist?.name || 'BRENIE')}
                </div>
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={14} />
                {busy ? 'Subiendo…' : 'Subir foto'}
              </button>
              <p className="mt-2 max-w-[220px] text-xs text-ink-3">
                Se optimiza automáticamente. Los archivos pesados (RAW, video) van en Drive y se
                linkean en las tareas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="label">Equipo</h2>
        <ul className="mt-3 space-y-2">
          {profiles.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-float font-mono text-[11px] text-ink-2">
                {initials(p.display_name || '?')}
              </span>
              <span className="text-sm text-ink">{p.display_name || 'Sin nombre'}</span>
              {p.id === session?.user.id && <span className="chip">Vos</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="label">Sesión</h2>
        <button className="btn btn-danger mt-3" onClick={() => void signOut()}>
          <LogOut size={14} /> Cerrar sesión
        </button>
      </section>
    </div>
  )
}
