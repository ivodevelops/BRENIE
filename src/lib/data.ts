import { supabase } from './supabase'
import { TEMPLATES } from './templates'
import type {
  ArtistProfile,
  Objective,
  ObjectiveInput,
  Profile,
  Task,
  TaskInput,
  TaskStatus,
  Workstream,
} from './types'

export interface AllData {
  objectives: Objective[]
  workstreams: Workstream[]
  tasks: Task[]
  profiles: Profile[]
  artist: ArtistProfile | null
}

export async function fetchAll(): Promise<AllData> {
  const [objectives, workstreams, tasks, profiles, artist] = await Promise.all([
    supabase.from('objectives').select('*').order('created_at', { ascending: false }),
    supabase.from('workstreams').select('*').order('position'),
    supabase.from('tasks').select('*').order('position'),
    supabase.from('profiles').select('*'),
    supabase.from('artist_profile').select('*').eq('id', 1).maybeSingle(),
  ])
  const error = objectives.error ?? workstreams.error ?? tasks.error ?? profiles.error ?? artist.error
  if (error) throw new Error(error.message)
  return {
    objectives: (objectives.data ?? []) as Objective[],
    workstreams: (workstreams.data ?? []) as Workstream[],
    tasks: (tasks.data ?? []) as Task[],
    profiles: (profiles.data ?? []) as Profile[],
    artist: (artist.data ?? null) as ArtistProfile | null,
  }
}

export async function createObjective(input: ObjectiveInput, withTemplate: boolean): Promise<void> {
  const { data, error } = await supabase.from('objectives').insert(input).select().single()
  if (error) throw new Error(error.message)
  const objective = data as Objective

  const template = withTemplate ? TEMPLATES[input.type] : []
  if (template.length === 0) return

  const { data: created, error: wsError } = await supabase
    .from('workstreams')
    .insert(template.map((w, i) => ({ objective_id: objective.id, name: w.name, position: i })))
    .select()
  if (wsError) throw new Error(wsError.message)

  const rows = template.flatMap((w, i) => {
    const ws = (created as Workstream[]).find((c) => c.position === i)
    if (!ws) return []
    return w.tasks.map((title, j) => ({ workstream_id: ws.id, title, position: j }))
  })
  if (rows.length > 0) {
    const { error: tError } = await supabase.from('tasks').insert(rows)
    if (tError) throw new Error(tError.message)
  }
}

export async function updateObjective(id: string, patch: Partial<ObjectiveInput>): Promise<void> {
  const { error } = await supabase.from('objectives').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteObjective(id: string): Promise<void> {
  const { error } = await supabase.from('objectives').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function createWorkstream(objectiveId: string, name: string, position: number): Promise<void> {
  const { error } = await supabase.from('workstreams').insert({ objective_id: objectiveId, name, position })
  if (error) throw new Error(error.message)
}

export async function renameWorkstream(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('workstreams').update({ name }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteWorkstream(id: string): Promise<void> {
  const { error } = await supabase.from('workstreams').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function createTask(input: TaskInput): Promise<void> {
  const { error } = await supabase.from('tasks').insert(input)
  if (error) throw new Error(error.message)
}

export async function updateTask(id: string, patch: Partial<TaskInput>): Promise<void> {
  const clean: Partial<TaskInput> & { completed_at?: string | null } = { ...patch }
  if (patch.status) {
    clean.completed_at = patch.status === 'done' ? new Date().toISOString() : null
  }
  const { error } = await supabase.from('tasks').update(clean).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<void> {
  await updateTask(id, { status })
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateProfile(id: string, displayName: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateArtistProfile(patch: Partial<Omit<ArtistProfile, 'id'>>): Promise<void> {
  const { error } = await supabase
    .from('artist_profile')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) throw new Error(error.message)
}

export async function uploadHeroPhoto(file: File): Promise<string> {
  const { resizeImage } = await import('./image')
  const blob = await resizeImage(file)
  const path = `hero-${Date.now()}.jpg`
  const { error } = await supabase.storage.from('artist').upload(path, blob, {
    contentType: 'image/jpeg',
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('artist').getPublicUrl(path)
  return data.publicUrl
}
