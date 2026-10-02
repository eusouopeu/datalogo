import { Clock, Pin, PinOff, X } from 'lucide-react'
import { CATALOGO } from '../data/catalog'
import { temNovidade } from '../lib/novidades'
import type { Salvo } from '../lib/salvos'
import type { FacetSelection, Indicador } from '../types'

interface Props {
  salvos: Salvo[]
  recentes: string[]
  onAbrir: (indicador: Indicador, selecao: FacetSelection) => void
  onExplorar: (indicador: Indicador) => void
  onAlternarFixado: (indicadorId: string) => void
  onRemover: (indicadorId: string) => void
}

/** Lista única de salvos (indicador + filtros) e trilha de recentes. */
export function SalvosRecentes({ salvos, recentes, onAbrir, onExplorar, onAlternarFixado, onRemover }: Props) {
  const itens = salvos
    .map((salvo) => ({ salvo, indicador: CATALOGO.find((i) => i.id === salvo.indicadorId) }))
    .filter((item): item is { salvo: Salvo; indicador: Indicador } => !!item.indicador)

  const indicadoresRecentes = recentes
    .map((id) => CATALOGO.find((i) => i.id === id))
    .filter((i): i is Indicador => !!i)

  if (itens.length === 0 && indicadoresRecentes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nada salvo ainda. Na tela de um indicador, use o botão de marcador para guardar a consulta com os filtros
        escolhidos.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {itens.length > 0 && (
        <ul className="flex flex-col gap-2">
          {itens.map(({ salvo, indicador }) => (
            <li key={salvo.indicadorId} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <button onClick={() => onAbrir(indicador, salvo.selecao)} className="min-w-0 flex-1 text-left">
                <span className="flex items-center gap-1.5">
                  {temNovidade(indicador.id) && (
                    <span
                      aria-label="Dado novo desde a última visita"
                      title="Dado novo desde a última visita"
                      className="size-1.5 shrink-0 rounded-full bg-emerald-500"
                    />
                  )}
                  <span className="truncate font-medium">{indicador.nome}</span>
                </span>
                <span className="block truncate text-xs text-slate-400">{indicador.tema.join(' → ')}</span>
              </button>
              <button
                onClick={() => onAlternarFixado(salvo.indicadorId)}
                aria-label={salvo.fixadoHome ? 'Tirar dos destaques da tela inicial' : 'Mostrar nos destaques da tela inicial'}
                title={salvo.fixadoHome ? 'Tirar dos destaques da tela inicial' : 'Mostrar nos destaques da tela inicial'}
                className={`shrink-0 rounded-md p-1.5 ${
                  salvo.fixadoHome
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {salvo.fixadoHome ? <PinOff size={16} /> : <Pin size={16} />}
              </button>
              <button
                onClick={() => onRemover(salvo.indicadorId)}
                aria-label="Remover dos salvos"
                title="Remover dos salvos"
                className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {indicadoresRecentes.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Clock size={14} /> Recentes
          </p>
          <div className="flex flex-wrap gap-2">
            {indicadoresRecentes.map((indicador) => (
              <button
                key={indicador.id}
                onClick={() => onExplorar(indicador)}
                className="rounded-full bg-slate-100 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {indicador.nome}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
