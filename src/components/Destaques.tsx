import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { CATALOGO } from '../data/catalog'
import { selecaoInicial } from '../lib/facets'
import { useSerie } from '../lib/useSerie'
import type { Indicador } from '../types'

interface Props {
  onExplorar: (indicador: Indicador) => void
}

const IDS_DESTAQUE = ['ipca-variacao-mensal', 'meta-selic', 'cambio-dolar', 'taxa-desocupacao-idade']

function fmt(n: number, unidade: string): string {
  return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${unidade === '%' ? '%' : ` ${unidade}`}`
}

function CardDestaque({ indicador, onExplorar }: { indicador: Indicador; onExplorar: (i: Indicador) => void }) {
  const selecao = selecaoInicial(indicador)
  const { series, carregando } = useSerie(indicador, selecao, true)
  const pontos = series?.[0]?.pontos.filter((p) => p.valor !== null) ?? []
  const ultimo = pontos.at(-1)

  return (
    <button
      onClick={() => onExplorar(indicador)}
      className="flex flex-col gap-1 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
    >
      <span className="truncate text-xs font-medium text-slate-500">{indicador.nome}</span>
      {!ultimo && <span className="text-lg font-semibold text-slate-300 dark:text-slate-700">{carregando ? '…' : '—'}</span>}
      {ultimo && <span className="text-lg font-semibold">{fmt(ultimo.valor as number, indicador.unidade)}</span>}
      {pontos.length > 1 && (
        <div className="h-8 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pontos}>
              <Line type="monotone" dataKey="valor" stroke="#059669" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </button>
  )
}

/** Cards de destaque na home: último valor + minigráfico dos indicadores mais consultados, sem digitar nada. */
export function Destaques({ onExplorar }: Props) {
  const indicadores = IDS_DESTAQUE.map((id) => CATALOGO.find((i) => i.id === id)).filter(
    (i): i is Indicador => !!i,
  )
  if (indicadores.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Destaques</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {indicadores.map((indicador) => (
          <CardDestaque key={indicador.id} indicador={indicador} onExplorar={onExplorar} />
        ))}
      </div>
    </div>
  )
}
