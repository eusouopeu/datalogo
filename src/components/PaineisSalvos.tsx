import { LayoutDashboard, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CATALOGO } from '../data/catalog'
import { listarPaineis, removerPainel, type Painel } from '../lib/paineis'

interface Props {
  onAbrir: (painel: Painel) => void
}

/** Painéis (indicador + filtros) salvos pelo usuário na home, para reabrir sem reconfigurar. */
export function PaineisSalvos({ onAbrir }: Props) {
  const [paineis, setPaineis] = useState<Painel[]>([])

  useEffect(() => {
    setPaineis(listarPaineis())
  }, [])

  function remover(id: string) {
    removerPainel(id)
    setPaineis(listarPaineis())
  }

  if (paineis.length === 0) return null

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <LayoutDashboard size={14} /> Painéis salvos
      </p>
      <ul className="flex flex-col gap-2">
        {paineis.map((painel) => {
          const indicador = CATALOGO.find((i) => i.id === painel.indicadorId)
          if (!indicador) return null
          return (
            <li
              key={painel.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
            >
              <button onClick={() => onAbrir(painel)} className="min-w-0 flex-1 text-left">
                <span className="block truncate font-medium">{painel.nome}</span>
                <span className="block truncate text-xs text-slate-400">{indicador.nome}</span>
              </button>
              <button
                onClick={() => remover(painel.id)}
                aria-label="Remover painel"
                title="Remover painel"
                className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={14} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
