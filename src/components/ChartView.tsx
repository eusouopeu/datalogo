import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Indicador, SerieResultado } from '../types'
import { SingleSelectDropdown } from './ui/Dropdown'
import { aplicarTransformacao, OPCOES_TRANSFORMACAO, type Transformacao } from '../lib/transformacoes'

interface Props {
  series: SerieResultado[]
  unidade: string
  periodicidade: Indicador['periodicidade']
}

const CORES = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2']

type TipoGrafico = 'linha' | 'barra' | 'area'

const OPCOES_TIPO = [
  { valor: 'linha' as const, label: 'Linha' },
  { valor: 'barra' as const, label: 'Barra' },
  { valor: 'area' as const, label: 'Área' },
]

export function ChartView({ series, unidade, periodicidade }: Props) {
  const [tipo, setTipo] = useState<TipoGrafico>('linha')
  const [transformacao, setTransformacao] = useState<Transformacao>('nenhuma')

  // Acumulado 12m só faz sentido para variação mensal (%) — outras periodicidades ficam só com média móvel.
  const opcoesTransformacao =
    periodicidade === 'mensal' ? OPCOES_TRANSFORMACAO : OPCOES_TRANSFORMACAO.filter((o) => o.valor !== 'acumulado12m')
  const seriesTransformadas = series.map((s) => aplicarTransformacao(s, transformacao))

  const periodos = Array.from(new Set(seriesTransformadas.flatMap((s) => s.pontos.map((p) => p.periodo)))).sort()

  const dados = periodos.map((periodo) => {
    const linha: Record<string, string | number | null> = { periodo }
    seriesTransformadas.forEach((serie) => {
      const chave = [serie.localidadeNome, ...serie.categoriaLabels].filter(Boolean).join(' / ')
      const ponto = serie.pontos.find((p) => p.periodo === periodo)
      linha[chave] = ponto?.valor ?? null
    })
    return linha
  })

  const chaves = seriesTransformadas.map((serie) =>
    [serie.localidadeNome, ...serie.categoriaLabels].filter(Boolean).join(' / '),
  )

  const ComponenteGrafico = tipo === 'barra' ? BarChart : tipo === 'area' ? AreaChart : LineChart
  const unidadeGrafico = transformacao === 'nenhuma' ? unidade : '%'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {opcoesTransformacao.length > 1 && (
          <div className="w-44">
            <SingleSelectDropdown
              label="Cálculo"
              opcoes={opcoesTransformacao}
              valor={transformacao}
              onChange={setTransformacao}
            />
          </div>
        )}
        <div className="w-40">
          <SingleSelectDropdown label="Tipo de gráfico" opcoes={OPCOES_TIPO} valor={tipo} onChange={setTipo} />
        </div>
      </div>
      <div id="datalogo-chart" className="h-72 w-full rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <ResponsiveContainer width="100%" height="100%">
          <ComponenteGrafico data={dados}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit={unidadeGrafico === '%' ? '%' : ''} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {chaves.map((chave, i) =>
              tipo === 'barra' ? (
                <Bar key={chave} dataKey={chave} fill={CORES[i % CORES.length]} />
              ) : tipo === 'area' ? (
                <Area
                  key={chave}
                  type="monotone"
                  dataKey={chave}
                  stroke={CORES[i % CORES.length]}
                  fill={CORES[i % CORES.length]}
                  fillOpacity={0.2}
                  connectNulls
                />
              ) : (
                <Line
                  key={chave}
                  type="monotone"
                  dataKey={chave}
                  stroke={CORES[i % CORES.length]}
                  connectNulls
                  dot={{ r: 3 }}
                />
              ),
            )}
          </ComponenteGrafico>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
