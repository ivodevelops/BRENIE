import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { fetchAll, type AllData } from '../lib/data'
import { supabase } from '../lib/supabase'

interface AppDataValue extends AllData {
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  run: (op: () => Promise<void>) => Promise<void>
}

const EMPTY: AllData = { objectives: [], workstreams: [], tasks: [], profiles: [], artist: null }

const AppDataContext = createContext<AppDataValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AllData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const refresh = useCallback(async () => {
    try {
      const next = await fetchAll()
      setData(next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  const run = useCallback(
    async (op: () => Promise<void>) => {
      await op()
      await refresh()
    },
    [refresh],
  )

  const scheduleRefresh = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      void refresh()
    }, 150)
  }, [refresh])

  useEffect(() => {
    void refresh()
    const channel = supabase
      .channel('backstage-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'objectives' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workstreams' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, scheduleRefresh)
      .subscribe()
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
      void supabase.removeChannel(channel)
    }
  }, [refresh, scheduleRefresh])

  const value = useMemo<AppDataValue>(
    () => ({ ...data, loading, error, refresh, run }),
    [data, loading, error, refresh, run],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataValue {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData debe usarse dentro de AppDataProvider')
  return value
}
