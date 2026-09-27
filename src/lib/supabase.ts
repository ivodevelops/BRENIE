import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isConfigured = Boolean(url && anonKey && url.startsWith('http'))

export const supabase: SupabaseClient = createClient(
  url && url.startsWith('http') ? url : 'https://sin-configurar.supabase.co',
  anonKey ?? 'sin-configurar',
)
