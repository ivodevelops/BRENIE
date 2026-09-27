export default function Setup() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="card w-full max-w-lg p-7">
        <p className="label">Backstage OS</p>
        <h1 className="mt-2 font-display text-2xl">Falta conectar Supabase</h1>
        <p className="mt-2 text-sm text-ink-2">
          Seguí estos pasos una sola vez. El detalle completo está en el README del proyecto.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-2">
          <li>
            Creá un proyecto gratis en <span className="font-mono text-xs">supabase.com</span>.
          </li>
          <li>
            En el SQL Editor, pegá el contenido de{' '}
            <span className="font-mono text-xs">supabase/schema.sql</span> y dale Run.
          </li>
          <li>
            En Authentication → Users, creá las 2 cuentas (Add user, con "Auto Confirm" activado).
          </li>
          <li>Copiá la URL y la anon key (Project Settings → API) a un archivo .env.local.</li>
          <li>Reiniciá la app (npm run dev).</li>
        </ol>
        <pre className="mt-4 overflow-x-auto rounded-btn border border-edge bg-canvas p-3 font-mono text-xs text-ink-2">
          {`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\nVITE_SUPABASE_ANON_KEY=tu-anon-key`}
        </pre>
      </div>
    </div>
  )
}
