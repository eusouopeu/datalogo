import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import type { FacetSelection, Indicador } from '../types'
import { LocationDropdown } from './LocationDropdown'
import { MultiSelectDropdown, SingleSelectDropdown } from './ui/Dropdown'

interface Props {
  indicador: Indicador
  selecao: FacetSelection
  onChange: (selecao: FacetSelection) => void
}

const OPCOES_PERIODOS = [
  { valor: '4', label: 'Últimos 4' },
  { valor: '8', label: 'Últimos 8' },
  { valor: '12', label: 'Últimos 12' },
  { valor: '20', label: 'Últimos 20' },
]

const LABEL_PERIODICIDADE: Record<Indicador['periodicidade'], string> = {
  diaria: 'diária',
  mensal: 'mensal',
  trimestral: 'trimestral',
  anual: 'anual',
}

/** Seção de filtros: accordion fechado por padrão, todos os campos como dropdowns (compacto em mobile). */
export function QueryBuilder({ indicador, selecao, onChange }: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="rounded-lg border border-slate-200 text-left dark:border-slate-800">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="flex w-full items-center justify-between gap-2 p-4"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <SlidersHorizontal size={16} /> Filtros
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="flex flex-col gap-4 border-t border-slate-200 p-4 pt-4 dark:border-slate-800">
          <LocationDropdown
            niveis={indicador.niveisTerritoriais}
            nivelTerritorial={selecao.nivelTerritorial}
            codigosTerritoriais={selecao.codigosTerritoriais}
            onChange={(nivelTerritorial, codigosTerritoriais) =>
              onChange({ ...selecao, nivelTerritorial: nivelTerritorial as FacetSelection['nivelTerritorial'], codigosTerritoriais })
            }
          />

          {indicador.classificacoes.map((classificacao) => (
            <MultiSelectDropdown
              key={classificacao.id}
              label={classificacao.nome}
              opcoes={classificacao.categorias.map((c) => ({ valor: c.id, label: c.nome }))}
              valores={selecao.categorias[classificacao.id] ?? []}
              onChange={(ids) =>
                onChange({ ...selecao, categorias: { ...selecao.categorias, [classificacao.id]: ids } })
              }
            />
          ))}

          <SingleSelectDropdown
            label={`Período (${LABEL_PERIODICIDADE[indicador.periodicidade]})`}
            opcoes={OPCOES_PERIODOS}
            valor={String(selecao.quantidadePeriodos)}
            onChange={(v) => onChange({ ...selecao, quantidadePeriodos: Number(v) })}
          />
        </div>
      )}
    </div>
  )
}
