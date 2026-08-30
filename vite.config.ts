import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Repo name is used as the base path so the build works on GitHub Pages
// (https://<user>.github.io/datalogo/). Override with VITE_BASE if needed.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/datalogo/',
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
