import { GitCompareArrows, X } from 'lucide-react'
import { useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CATALOGO } from '../data/catalog'
import { selecaoInicial } from '../lib/facets'
import { useSerie } from '../lib/useSerie'
import { alinharPorPeriodo, normalizarBase100 } from '../lib/comparacao'
import type { Indicador, SerieResultado } from '../types'
import { SingleSelectDropdown } from './ui/Dropdown'

interface Props {
  indicadorAtual: Indicador
  serieAtual: SerieResultado
}

// Comparação inline só faz sentido de cara para indicadores que já respondem no nível Brasil
// (sem exigir escolher UF/município primeiro).
const ELEGIVEIS = CATALOGO.filter((i) => !i.niveisTerritoriais[0].requerSelecao)

/** Overlay de outro indicador (reescalado para base 100) sobre o gráfico atual, substituindo a antiga tela "Comparar". */
export function CompareInline({ indicadorAtual, serieAtual }: Props) {
  const [ativo, setAtivo] = useState(false)
  const opcoes = ELEGIVEIS.filter((i) => i.id !== indicadorAtual.id)
  const [idB, setIdB] = useState(opcoes[0]?.id ?? '')
  const indicadorB = CATALOGO.find((i) => i.id === idB) ?? null
  const selecaoB = indicadorB ? selecaoInicial(indicadorB) : null

  const { series: seriesB, carregando, erro } = useSerie(indicadorB, selecaoB, ativo)

  if (opcoes.length === 0) return null

  if (!ativo) {
    return (
      <button
        onClick={() => setAtivo(true)}
        aria-label="Comparar com outro indicador"
        title="Comparar com outro indicador"
        className="flex w-fit items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <GitCompareArrows size={14} /> Comparar com outro indicador
      </button>
    )
  }

  const periodicidadesDivergem = indicadorB && indicadorAtual.periodicidade !== indicadorB.periodicidade

  const alinhado = seriesB?.[0] ? alinharPorPeriodo(serieAtual, seriesB[0]) : null
  const baseA = alinhado ? normalizarBase100(alinhado.map((p) => ({ periodo: p.periodo, valor: p.a }))) : null
  const baseB = alinhado ? normalizarBase100(alinhado.map((p) => ({ periodo: p.periodo, valor: p.b }))) : null
  const dados =
    alinhado && baseA && baseB
      ? alinhado.map((p, i) => ({ periodo: p.periodo, a: baseA[i].valor, b: baseB[i].valor }))
      : []

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="w-full max-w-xs">
          <SingleSelectDropdown
            label="Comparar com"
            opcoes={opcoes.map((i) => ({ valor: i.id, label: i.nome }))}
            valor={idB}
            onChange={setIdB}
          />
        </div>
        <button
          onClick={() => setAtivo(false)}
          aria-label="Remover comparação"
          title="Remover comparação"
          className="shrink-0 self-end rounded-md p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={16} />
        </button>
      </div>

      {periodicidadesDivergem && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Periodicidades diferentes ({indicadorAtual.periodicidade} vs {indicadorB?.periodicidade}) — os períodos
          podem não coincidir, deixando trechos do gráfico incompletos de um dos lados.
        </p>
      )}
      {carregando && <p className="text-sm text-slate-500">Consultando…</p>}
      {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}

      {dados.length > 0 && indicadorB && (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'base 100', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(chave) => (chave === 'a' ? indicadorAtual.nome : indicadorB.nome)}
              />
              <Line type="monotone" dataKey="a" name={indicadorAtual.nome} stroke="#059669" connectNulls dot={{ r: 3 }} />
              <Line type="monotone" dataKey="b" name={indicadorB.nome} stroke="#2563eb" connectNulls dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
