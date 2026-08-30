import type { SerieResultado } from '../types'

interface Props {
  series: SerieResultado[]
  unidade: string
}

export function DataTable({ series, unidade }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-3 py-2">Localidade</th>
            <th className="px-3 py-2">Categoria</th>
            <th className="px-3 py-2">Período</th>
            <th className="px-3 py-2">Valor ({unidade})</th>
          </tr>
        </thead>
        <tbody>
          {series.flatMap((serie) =>
            serie.pontos.map((ponto) => (
              <tr
                key={`${serie.localidadeNome}-${serie.categoriaLabels.join('-')}-${ponto.periodo}`}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="px-3 py-1.5">{serie.localidadeNome}</td>
                <td className="px-3 py-1.5">{serie.categoriaLabels.join(' / ') || '—'}</td>
                <td className="px-3 py-1.5">{ponto.periodo}</td>
                <td className="px-3 py-1.5">{ponto.valor ?? '—'}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  )
}
