export type ObjectiveType = 'album' | 'single' | 'ep' | 'video' | 'general'
export type ObjectiveStatus = 'active' | 'paused' | 'done' | 'archived'
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'done'
export type Priority = 'low' | 'medium' | 'high'

export interface Profile {
  id: string
  display_name: string
  role: string
}

export interface ArtistProfile {
  id: number
  name: string
  era: string
  tagline: string
  hero_photo_url: string
}

export interface Objective {
  id: string
  title: string
  type: ObjectiveType
  description: string
  due_date: string | null
  status: ObjectiveStatus
  created_by: string | null
  created_at: string
}

export interface Workstream {
  id: string
  objective_id: string
  name: string
  position: number
}

export interface Task {
  id: string
  workstream_id: string
  title: string
  assignee: string | null
  due_date: string | null
  status: TaskStatus
  priority: Priority
  notes: string
  link: string
  position: number
  completed_at: string | null
  created_at: string
}

export interface ObjectiveInput {
  title: string
  type: ObjectiveType
  description: string
  due_date: string | null
  status: ObjectiveStatus
}

export interface TaskInput {
  workstream_id: string
  title: string
  assignee: string | null
  due_date: string | null
  status: TaskStatus
  priority: Priority
  notes: string
  link: string
}
