import { Clock, Star } from 'lucide-react'
import { CATALOGO } from '../data/catalog'
import type { Indicador } from '../types'

interface Props {
  favoritos: string[]
  recentes: string[]
  onExplorar: (indicador: Indicador) => void
}

function Lista({
  titulo,
  icone: Icone,
  ids,
  onExplorar,
}: {
  titulo: string
  icone: typeof Star
  ids: string[]
  onExplorar: (i: Indicador) => void
}) {
  const indicadores = ids.map((id) => CATALOGO.find((i) => i.id === id)).filter((i): i is Indicador => !!i)
  if (indicadores.length === 0) return null

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icone size={14} /> {titulo}
      </p>
      <div className="flex flex-wrap gap-2">
        {indicadores.map((indicador) => (
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
  )
}

/** Seções de acesso rápido na home: favoritos marcados pelo usuário e últimos indicadores visitados. */
export function FavoritosRecentes({ favoritos, recentes, onExplorar }: Props) {
  if (favoritos.length === 0 && recentes.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <Lista titulo="Favoritos" icone={Star} ids={favoritos} onExplorar={onExplorar} />
      <Lista titulo="Recentes" icone={Clock} ids={recentes} onExplorar={onExplorar} />
    </div>
  )
}
