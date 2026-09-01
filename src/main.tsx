import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CATALOGO } from './data/catalog.ts'
import { validarCatalogo } from './lib/catalogValidation.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.DEV) {
  const problemas = validarCatalogo(CATALOGO)
  if (problemas.length > 0) {
    console.warn(`[catálogo] ${problemas.length} problema(s) encontrado(s):\n${problemas.join('\n')}`)
  }
}

// PWA offline-first: cacheia o shell do app para abrir sem rede (não interfere em dev/HMR).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
  })
}
