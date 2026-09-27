import type { ObjectiveType } from './types'

export interface TemplateWorkstream {
  name: string
  tasks: string[]
}

export const TEMPLATES: Record<ObjectiveType, TemplateWorkstream[]> = {
  album: [
    {
      name: 'Canciones',
      tasks: [
        'Definir tracklist final',
        'Recibir masters finales',
        'Subir masters a distribución',
        'Registrar obras y splits',
        'Créditos y metadatos',
      ],
    },
    {
      name: 'Fotos y videos',
      tasks: [
        'Elegir fotógrafo/a y fecha',
        'Sesión de fotos',
        'Portada / arte final',
        'Video principal (guion, rodaje, edición)',
      ],
    },
    {
      name: 'Entrevistas y prensa',
      tasks: [
        'Armar lista de medios',
        'Contactar medios',
        'Agendar entrevistas',
        'Publicar notas y difundir',
      ],
    },
    {
      name: 'Difusión y playlists',
      tasks: [
        'Pre-save / link de pre-guardado',
        'Pitch a playlists',
        'Calendario de redes',
        'Anuncio y countdown',
      ],
    },
    {
      name: 'Shows',
      tasks: ['Definir fecha de presentación', 'Cerrar venue', 'Producción del show'],
    },
    {
      name: 'Legal y registro',
      tasks: ['Registro de obras', 'Contratos y splits'],
    },
    {
      name: 'Presupuesto',
      tasks: [
        'Definir presupuesto del lanzamiento',
        'Cotizar video y fotos',
        'Registrar gastos',
      ],
    },
  ],
  single: [
    {
      name: 'Canciones',
      tasks: ['Recibir master final', 'Subir a distribución', 'Registro de obra'],
    },
    {
      name: 'Fotos y videos',
      tasks: ['Arte de portada', 'Contenido para redes (foto/video)'],
    },
    {
      name: 'Entrevistas y prensa',
      tasks: ['Nota de lanzamiento', 'Contactar 5 medios'],
    },
    {
      name: 'Difusión y playlists',
      tasks: ['Pre-save', 'Pitch a playlists', 'Calendario de redes'],
    },
    {
      name: 'Legal y registro',
      tasks: ['Registro de obra y splits'],
    },
    {
      name: 'Presupuesto',
      tasks: ['Definir presupuesto'],
    },
  ],
  ep: [
    {
      name: 'Canciones',
      tasks: [
        'Definir tracklist',
        'Recibir masters',
        'Subir a distribución',
        'Registrar obras y splits',
      ],
    },
    {
      name: 'Fotos y videos',
      tasks: ['Sesión de fotos', 'Portada / arte final', 'Contenido para redes'],
    },
    {
      name: 'Entrevistas y prensa',
      tasks: ['Armar lista de medios', 'Contactar medios'],
    },
    {
      name: 'Difusión y playlists',
      tasks: ['Pre-save', 'Pitch a playlists', 'Calendario de redes'],
    },
    {
      name: 'Legal y registro',
      tasks: ['Registro de obras'],
    },
    {
      name: 'Presupuesto',
      tasks: ['Definir presupuesto'],
    },
  ],
  video: [
    {
      name: 'Fotos y videos',
      tasks: ['Guion', 'Elegir locación y fecha', 'Rodaje', 'Edición', 'Publicación'],
    },
    {
      name: 'Difusión y playlists',
      tasks: ['Teaser en redes', 'Estreno en YouTube'],
    },
    {
      name: 'Presupuesto',
      tasks: ['Definir presupuesto y cotizar'],
    },
  ],
  general: [],
}
