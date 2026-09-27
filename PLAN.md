# PLAN · Backstage OS (v1.1)

Acordado entre management (director creativo) y desarrollo, septiembre 2026.

## Visión

Software simple y robusto para que BRENIE y su management (equipo de 2) trabajen
el lanzamiento del primer álbum desde un solo lugar, en tiempo real, a costo $0.

## Modelo central

**Objetivo → Frentes de trabajo → Tareas**

- Un lanzamiento ES un objetivo (tipo álbum / single / EP / video / general).
- Frentes estándar (plantilla editable): Canciones · Fotos y videos · Entrevistas y prensa ·
  Difusión y playlists · Shows · Legal y registro · Presupuesto.
- Plantillas por tipo de objetivo: precargan frentes + tareas típicas.
- Cada tarea: 1 responsable, 1 fecha, 1 estado (pendiente / en curso / bloqueado / hecho),
  prioridad, notas y link.
- El progreso del objetivo se calcula automáticamente.
- La producción musical (letra, mezcla) queda en herramientas privadas; acá la canción
  aparece como entregable de gestión.

## Módulos

- **Home hub**: foto de la artista (full-bleed), era, próximo hito con countdown, progreso,
  "Mi semana" (tareas propias a 7 días + vencidas + bloqueadas), próximos eventos, objetivos activos.
- **Objetivos**: lista con filtros (activos / completados / todos), detalle con frentes y tareas.
- **Calendario unificado**: objetivos + tareas por mes, panel del día seleccionado.
- **Tiempo real** entre los 2 usuarios (Supabase Realtime).
- **Quick add** global (+ objetivo / + tarea).
- **Ajustes**: nombres del equipo, ficha de artista (nombre, era, frase, foto del Home).

## Decisiones tomadas

- Hosting: **Netlify** (no Vercel).
- Backend: **Supabase** free (auth email+contraseña, 2 cuentas, RLS solo autenticados, storage para la foto).
- Archivos pesados: quedan en **Drive/Dropbox** y se linkean (no se suben a la app).
- Recordatorios: **solo dentro de la app** (badges/panel), sin mails.
- Presskit (Fase 3): **link público + export PDF**.
- Estética: sistema de diseño inspirado en **artisthq.app** — dark warm (#0b0b0c / #161618),
  texto hueso #e8e3d8, acento bone, estados apagados (salvia/ámbar/rojo suave/azul acero),
  bordes de luz 1px, radios 9/14/16, tipografías Switzer (UI), Clash Display (títulos),
  IBM Plex Mono (datos y etiquetas). Mobile-first.

## Fases y estado

- [x] **Fase 0** — setup: Vite + React + Tailwind, Supabase, login, deploy Netlify (config listo).
- [x] **Fase 1** — núcleo: objetivos + frentes + tareas + plantillas + Home + dashboard "Mi semana" + calendario + tiempo real + ajustes.
- [ ] **Fase 2** — Shows (fechas, estado, cachet) · Librería de assets (links + tags) · Prensa (contactos y gestiones).
- [ ] **Fase 3** — Presskit editable (link público + PDF) · Métricas y links por lanzamiento.
- [ ] **Fase 4** — PWA instalable · historial de cambios · export de datos.

## Pendientes de gestión

- Emails de los 2 usuarios para crear las cuentas en Supabase (ver README).
- Logo / colores de BRENIE para personalizar el tema (opcional; hoy usa hueso neutro).
- Fotos para el Home (se suben desde Ajustes).
