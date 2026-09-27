import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawBase = env.VITE_BASE_PATH || '/'
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

  return {
    base,
    plugins: [react(), tailwindcss()],
  }
})
