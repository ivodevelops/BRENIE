import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/Auth'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,227,216,0.07),transparent_60%)]" />
      <div className="card relative w-full max-w-sm p-7">
        <p className="label">Backstage OS</p>
        <h1 className="mt-2 font-display text-3xl">BRENIE</h1>
        <p className="mt-1 text-sm text-ink-3">Hub de gestión del proyecto. Entrá con tu cuenta.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              className="input mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              className="input mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="mt-5 text-center font-mono text-[11px] text-ink-3">
          Si no tenés cuenta, pedila al equipo.
        </p>
      </div>
    </div>
  )
}
