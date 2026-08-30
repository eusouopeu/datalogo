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
import type { SerieResultado } from '../types'

interface Props {
  series: SerieResultado[]
  unidade: string
}

const CORES = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2']

export function ChartView({ series, unidade }: Props) {
  const periodos = Array.from(new Set(series.flatMap((s) => s.pontos.map((p) => p.periodo)))).sort()

  const dados = periodos.map((periodo) => {
    const linha: Record<string, string | number | null> = { periodo }
    series.forEach((serie) => {
      const chave = [serie.localidadeNome, ...serie.categoriaLabels].filter(Boolean).join(' / ')
      const ponto = serie.pontos.find((p) => p.periodo === periodo)
      linha[chave] = ponto?.valor ?? null
    })
    return linha
  })

  const chaves = series.map((serie) =>
    [serie.localidadeNome, ...serie.categoriaLabels].filter(Boolean).join(' / '),
  )

  return (
    <div className="h-72 w-full rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
          <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit={unidade === '%' ? '%' : ''} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {chaves.map((chave, i) => (
            <Line
              key={chave}
              type="monotone"
              dataKey={chave}
              stroke={CORES[i % CORES.length]}
              connectNulls
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
