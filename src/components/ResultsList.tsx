import type { SearchMatch } from '../types'

interface Props {
  resultados: SearchMatch[]
  consulta: string
  onExplorar: (match: SearchMatch) => void
}

export function ResultsList({ resultados, consulta, onExplorar }: Props) {
  if (consulta && resultados.length === 0) {
    return (
      <p className="mt-6 text-slate-500">
        Nenhum indicador encontrado para "{consulta}". Tente outros termos, como "inflação",
        "população" ou "desemprego".
      </p>
    )
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {resultados.map((match) => (
        <li
          key={match.indicador.id}
          className="rounded-lg border border-slate-200 p-4 text-left dark:border-slate-800"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                {match.indicador.fonte}
              </span>
              <h3 className="text-lg font-medium">{match.indicador.nome}</h3>
              <p className="text-sm text-slate-500">{match.indicador.pesquisa}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {match.indicador.descricao}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {match.indicador.tema.join(' → ')}
              </p>
            </div>
            <button
              onClick={() => onExplorar(match)}
              className="shrink-0 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Explorar
            </button>
          </div>
          <details className="mt-2 text-xs text-slate-500">
            <summary className="cursor-pointer">
              Por que esse resultado apareceu? (pontuação: {match.score})
            </summary>
            <ul className="mt-1 list-inside list-disc">
              {match.motivos.map((motivo, i) => (
                <li key={i}>{motivo}</li>
              ))}
            </ul>
          </details>
        </li>
      ))}
    </ul>
  )
}
