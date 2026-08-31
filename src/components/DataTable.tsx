import { useState } from 'react'
import type { SerieResultado } from '../types'
import { MultiSelectDropdown } from './ui/Dropdown'

interface Props {
  series: SerieResultado[]
  unidade: string
}

const COLUNAS = [
  { valor: 'localidade', label: 'Localidade' },
  { valor: 'categoria', label: 'Categoria' },
  { valor: 'periodo', label: 'Período' },
  { valor: 'valor', label: 'Valor' },
] as const

type ColunaId = (typeof COLUNAS)[number]['valor']

export function DataTable({ series, unidade }: Props) {
  const [colunasVisiveis, setColunasVisiveis] = useState<string[]>(COLUNAS.map((c) => c.valor))
  const mostra = (id: ColunaId) => colunasVisiveis.includes(id)

  return (
    <div className="flex flex-col gap-2">
      <div className="w-48 self-end">
        <MultiSelectDropdown
          label="Colunas"
          opcoes={[...COLUNAS]}
          valores={colunasVisiveis}
          onChange={setColunasVisiveis}
          placeholder="Nenhuma coluna"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {mostra('localidade') && <th className="px-3 py-2">Localidade</th>}
              {mostra('categoria') && <th className="px-3 py-2">Categoria</th>}
              {mostra('periodo') && <th className="px-3 py-2">Período</th>}
              {mostra('valor') && <th className="px-3 py-2">Valor ({unidade})</th>}
            </tr>
          </thead>
          <tbody>
            {series.flatMap((serie) =>
              serie.pontos.map((ponto) => (
                <tr
                  key={`${serie.localidadeNome}-${serie.categoriaLabels.join('-')}-${ponto.periodo}`}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  {mostra('localidade') && <td className="px-3 py-1.5">{serie.localidadeNome}</td>}
                  {mostra('categoria') && <td className="px-3 py-1.5">{serie.categoriaLabels.join(' / ') || '—'}</td>}
                  {mostra('periodo') && <td className="px-3 py-1.5">{ponto.periodo}</td>}
                  {mostra('valor') && <td className="px-3 py-1.5">{ponto.valor ?? '—'}</td>}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
