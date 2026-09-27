import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AppDataProvider } from './context/AppData'
import { AuthProvider, useAuth } from './context/Auth'
import { isConfigured } from './lib/supabase'
import CalendarPage from './pages/CalendarPage'
import Home from './pages/Home'
import Login from './pages/Login'
import ObjectiveDetail from './pages/ObjectiveDetail'
import Objectives from './pages/Objectives'
import SettingsPage from './pages/Settings'
import Setup from './pages/Setup'

function Shell() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="label animate-pulse">Cargando…</p>
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <AppDataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/objetivos" element={<Objectives />} />
          <Route path="/objetivos/:id" element={<ObjectiveDetail />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/ajustes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppDataProvider>
  )
}

export default function App() {
  if (!isConfigured) return <Setup />
  const base = import.meta.env.BASE_URL
  const basename = base === '/' ? undefined : base.replace(/\/$/, '')
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  )
}
