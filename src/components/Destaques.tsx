import { useEffect } from 'react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { CATALOGO } from '../data/catalog'
import { selecaoInicial } from '../lib/facets'
import { formatarPeriodo } from '../lib/leitura'
import { registrarUltimoPeriodo, temNovidade } from '../lib/novidades'
import { useSerie } from '../lib/useSerie'
import type { Indicador } from '../types'

/** Valor mais recente de um destaque, repassado para o widget nativo da tela inicial. */
export interface ValorDestaque {
  indicadorId: string
  nome: string
  valor: string
  periodo: string
}

interface Props {
  /** ids fixados pelo usuário; vazio cai nos destaques padrão */
  ids: string[]
  onExplorar: (indicador: Indicador) => void
  onValor?: (valor: ValorDestaque) => void
}

const IDS_PADRAO = ['ipca-variacao-mensal', 'meta-selic', 'cambio-dolar', 'taxa-desocupacao-idade']

function fmt(n: number, unidade: string): string {
  return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${unidade === '%' ? '%' : ` ${unidade}`}`
}

function CardDestaque({
  indicador,
  onExplorar,
  onValor,
}: {
  indicador: Indicador
  onExplorar: (i: Indicador) => void
  onValor?: (valor: ValorDestaque) => void
}) {
  const selecao = selecaoInicial(indicador)
  const { series, carregando } = useSerie(indicador, selecao, true)
  const pontos = series?.[0]?.pontos.filter((p) => p.valor !== null) ?? []
  const ultimo = pontos.at(-1)

  useEffect(() => {
    if (!ultimo) return
    registrarUltimoPeriodo(indicador.id, ultimo.periodo)
    onValor?.({
      indicadorId: indicador.id,
      nome: indicador.nome,
      valor: fmt(ultimo.valor as number, indicador.unidade),
      periodo: formatarPeriodo(ultimo.periodo, indicador.periodicidade),
    })
    // onValor é recriado a cada render do App: dependência só no dado que importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicador.id, ultimo?.periodo, ultimo?.valor])

  const novidade = ultimo ? temNovidade(indicador.id) : false

  return (
    <button
      onClick={() => onExplorar(indicador)}
      className="flex flex-col gap-1 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
    >
      <span className="flex items-center gap-1.5">
        {novidade && (
          <span
            aria-label="Dado novo desde a última visita"
            title="Dado novo desde a última visita"
            className="size-1.5 shrink-0 rounded-full bg-emerald-500"
          />
        )}
        <span className="truncate text-xs font-medium text-slate-500">{indicador.nome}</span>
      </span>
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

/** Cards da home: último valor + minigráfico dos indicadores fixados pelo usuário (ou os padrão). */
export function Destaques({ ids, onExplorar, onValor }: Props) {
  const escolhidos = ids.length > 0 ? ids : IDS_PADRAO
  const indicadores = escolhidos
    .map((id) => CATALOGO.find((i) => i.id === id))
    .filter((i): i is Indicador => !!i)
    .slice(0, 6)
  if (indicadores.length === 0) return null

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {indicadores.map((indicador) => (
          <CardDestaque key={indicador.id} indicador={indicador} onExplorar={onExplorar} onValor={onValor} />
        ))}
      </div>
    </div>
  )
}
