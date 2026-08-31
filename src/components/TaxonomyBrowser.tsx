import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Indicador } from '../types'
import { agruparPorTema } from '../lib/search'

interface Props {
  onSelecionar: (indicador: Indicador) => void
}

/** Navegação por Tema > Subtema, para quem não sabe o nome exato do indicador que procura. */
export function TaxonomyBrowser({ onSelecionar }: Props) {
  const grupos = useMemo(() => agruparPorTema(), [])
  const [temaAtivo, setTemaAtivo] = useState<string | null>(null)

  if (!temaAtivo) {
    return (
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Ou navegue por tema
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from(grupos.keys()).map((tema) => (
            <button
              key={tema}
              onClick={() => setTemaAtivo(tema)}
              className="rounded-full bg-slate-100 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {tema}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const indicadores = grupos.get(temaAtivo) ?? []

  return (
    <div className="mt-6">
      <button
        onClick={() => setTemaAtivo(null)}
        className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <ChevronLeft size={14} /> {temaAtivo}
      </button>
      <ul className="flex flex-col gap-2">
        {indicadores.map((indicador) => (
          <li key={indicador.id}>
            <button
              onClick={() => onSelecionar(indicador)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 text-left text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <span>
                <span className="font-medium">{indicador.nome}</span>
                <span className="block text-xs text-slate-400">{indicador.tema.slice(1).join(' → ')}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-slate-400" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
