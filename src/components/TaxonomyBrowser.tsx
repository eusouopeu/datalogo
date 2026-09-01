import { Briefcase, ChevronRight, HeartPulse, Map, TrendingUp, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Indicador } from '../types'
import { agruparPorTema } from '../lib/search'

interface Props {
  onSelecionar: (indicador: Indicador) => void
}

const ICONE_POR_TEMA: Record<string, typeof Briefcase> = {
  Trabalho: Briefcase,
  Economia: TrendingUp,
  Demografia: Users,
  Geografia: Map,
  Saúde: HeartPulse,
}

/** Navegação por Tema > Subtema, para quem não sabe o nome exato do indicador que procura — pílulas só com ícone. */
export function TaxonomyBrowser({ onSelecionar }: Props) {
  const grupos = useMemo(() => agruparPorTema(), [])
  const temas = useMemo(() => Array.from(grupos.keys()), [grupos])
  const [temaAtivo, setTemaAtivo] = useState<string | null>(null)

  const indicadores = temaAtivo ? (grupos.get(temaAtivo) ?? []) : []

  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Ou navegue por tema
      </p>
      <div className="inline-flex gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
        {temas.map((tema) => {
          const Icone = ICONE_POR_TEMA[tema] ?? Map
          const ativo = tema === temaAtivo
          return (
            <button
              key={tema}
              onClick={() => setTemaAtivo(ativo ? null : tema)}
              aria-label={tema}
              aria-pressed={ativo}
              title={tema}
              className={
                ativo
                  ? 'rounded-full bg-white p-2.5 text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                  : 'rounded-full p-2.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
              }
            >
              <Icone size={18} />
            </button>
          )
        })}
      </div>
      {temaAtivo && (
        <ul className="mt-3 flex flex-col gap-2">
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
      )}
    </div>
  )
}
