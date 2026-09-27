# Backstage OS · BRENIE

Hub privado de gestión de proyecto para BRENIE (2 usuarios: artista + management).
Todo se organiza con un solo modelo: **Objetivo → Frentes de trabajo → Tareas**.

## Qué incluye (Fase 1)

- **Home hub** con foto de la artista, era actual, próximo hito con countdown y progreso.
- **Objetivos** (álbum / single / EP / video / general) con fecha límite, estado y progreso automático.
- **Frentes de trabajo** por objetivo: Canciones, Fotos y videos, Entrevistas y prensa, Difusión y playlists, Shows, Legal y registro, Presupuesto. Editables.
- **Plantillas**: al crear un objetivo, los frentes y tareas estándar se generan solos.
- **Tareas** con responsable (vos o BRENIE), fecha, estado (pendiente / en curso / bloqueado / hecho), prioridad, notas y link.
- **Dashboard "Mi semana"**: tareas de los próximos 7 días, vencidas y bloqueadas, con filtro por persona.
- **Calendario unificado**: objetivos + tareas en una vista mensual.
- **Tiempo real**: lo que carga uno lo ve el otro al instante.
- **Ajustes**: nombres del equipo, ficha de la artista y foto del Home.

## Stack y costo

- React + Vite + TypeScript + Tailwind (estética inspirada en ArtistHQ).
- Supabase: base de datos, login y storage para la foto (free tier).
- Netlify: hosting gratis.
- **Costo: $0/mes.** Nota: el free tier de Supabase se pausa tras ~1 semana sin uso; se reactiva con un click desde el panel.

## Puesta en marcha (una sola vez)

### 1. Crear el proyecto en Supabase

1. Entrá a https://supabase.com y creá una cuenta (gratis) y un proyecto nuevo.
2. En el panel del proyecto: **SQL Editor → New query**, pegá TODO el contenido de [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**.
3. En **Authentication → Users → Add user**, creá las 2 cuentas (email + contraseña). Marcá **Auto Confirm User** en cada una. Repetí para la segunda.
4. En **Project Settings → API**, copiá la **Project URL** y la **anon public key**.

### 2. Variables de entorno

Creá un archivo `.env.local` en la raíz del proyecto (copiá `.env.example`):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Correr localmente

```
npm install
npm run dev
```

Abrí http://localhost:5173 y entrá con una de las 2 cuentas.

### 4. Deploy en Netlify

**Opción A — Con GitHub (recomendada):**

1. Subí el repo a GitHub.
2. En Netlify: **Add new site → Import an existing project** y elegí el repo.
3. Netlify lee `netlify.toml` solo: build `npm run build`, publish `dist`.
4. En **Site configuration → Environment variables**, cargá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. Deploy. Listo: URL fija para ambos, accesible desde el celular.

**Opción B — Sin GitHub (CLI):**

```
npm run build
npx netlify-cli deploy --prod --dir=dist
```

(La primera vez te va a pedir iniciar sesión en Netlify con el navegador. Cargá también las variables de entorno en el panel del sitio.)

### 5. Servir la app bajo una ruta de otro sitio (ej: ivoiovivo.netlify.app/brenie)

Cada proyecto se actualiza por separado, pero el link público queda en el dominio que ya usan.

1. Desplegá Backstage OS como sitio propio de Netlify (Opción A o B) y anotá su URL, ej: `backstage-brenie.netlify.app`.
2. En **ese sitio** (el de Backstage): Site configuration → Environment variables → agregá
   `VITE_BASE_PATH` = `/brenie` → hacé **Trigger deploy**. (El build pasa a servir todo bajo esa ruta.)
3. En el sitio de **ivoiovivo**, agregá una regla de proxy:
   - Si el repo ya tiene `netlify.toml`, agregá este bloque al final:

     ```toml
     [[redirects]]
       from = "/brenie/*"
       to = "https://backstage-brenie.netlify.app/:splat"
       status = 200
     ```

   - Si no tiene, creá un `netlify.toml` en la raíz del repo con solo ese bloque
     (no afecta el build que ya esté configurado en Netlify).
   - Commit + push → Netlify redeploya ese sitio automáticamente.

4. Listo: `https://ivoiovivo.netlify.app/brenie`.

Notas: usá `/brenie` en minúsculas (las rutas distinguen mayúsculas). No hace falta tocar nada más: los assets, el login y las rutas internas se resuelven solos bajo esa ruta.

## Uso diario

- **Home**: mirá "Mi semana" (tus tareas de los próximos 7 días) y el countdown del próximo hito.
- **Crear algo rápido**: botón **+ Nuevo** (o el botón flotante en el celular) → Objetivo o Tarea.
- **Estados de tarea**: tocá el círculo para marcar hecho; tocá el chip de estado para rotar (pendiente → en curso → bloqueado → hecho).
- **Regla de oro**: cada tarea tiene 1 responsable y 1 fecha. El progreso del objetivo se calcula solo.
- **Archivos pesados** (videos, masters, fotos RAW): van a Google Drive; en la tarea se pega el link.

## Estructura del proyecto

```
src/
  components/   UI (Layout, modales, TaskRow, tarjetas…)
  context/      Auth (sesión) y AppData (datos + tiempo real)
  lib/          Supabase, tipos, plantillas, fechas, cálculos, CRUD
  pages/        Home, Objetivos, Detalle, Calendario, Ajustes, Login
supabase/
  schema.sql    Esquema completo de la base (pegar en Supabase)
```

## Siguientes fases (roadmap)

- **Fase 2**: módulo Shows (fechas en vivo con estado y cachet), Librería de assets (links a Drive + tags), Prensa (contactos y gestiones).
- **Fase 3**: Presskit editable con link público + export PDF, Métricas y links por lanzamiento.
- **Fase 4**: PWA instalable en el celular, historial de cambios.

## Problemas comunes

- **"Falta conectar Supabase"**: no existe `.env.local` o está mal cargado. Reiniciá `npm run dev` después de crearlo.
- **No puedo entrar**: verificá que el usuario exista en Supabase → Authentication → Users con "Auto Confirm".
- **La app quedó "Cargando…" para siempre**: el proyecto de Supabase está pausado (free tier). Entrá a supabase.com y dale Restore.
