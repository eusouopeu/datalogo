import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { NivelTerritorial } from '../types'
import { buscarMunicipios, buscarUfs, type Localidade } from '../lib/ibgeLocalidades'
import { normalize } from '../lib/normalize'

interface Props {
  nivel: Extract<NivelTerritorial, 'N3' | 'N6'>
  selecionados: string[]
  onChange: (ids: string[]) => void
}

/** Seletor multi-escolha de UF ou município, buscado ao vivo na API de Localidades do IBGE. */
export function LocalidadeSeletor({ nivel, selecionados, onChange }: Props) {
  const [todas, setTodas] = useState<Localidade[]>([])
  const [nivelCarregado, setNivelCarregado] = useState<string | null>(null)
  const [termo, setTermo] = useState('')
  const [nivelAnterior, setNivelAnterior] = useState(nivel)

  // Reseta a busca de texto ao trocar de nível (UF <-> município) — ajuste de estado durante
  // a renderização, sem passar por um efeito (evita o flash de um frame com o termo antigo).
  if (nivel !== nivelAnterior) {
    setNivelAnterior(nivel)
    setTermo('')
  }

  const carregando = nivelCarregado !== nivel

  useEffect(() => {
    let cancelado = false
    const buscar = nivel === 'N3' ? buscarUfs : buscarMunicipios
    buscar().then((lista) => {
      if (!cancelado) {
        setTodas(lista)
        setNivelCarregado(nivel)
      }
    })
    return () => {
      cancelado = true
    }
  }, [nivel])

  const mapaLocalidades = useMemo(() => new Map(todas.map((l) => [l.id, l])), [todas])

  const filtradas = useMemo(() => {
    const termoNorm = normalize(termo)
    if (!termoNorm) return nivel === 'N3' ? todas : []
    return todas.filter((l) => normalize(l.nome).includes(termoNorm)).slice(0, 30)
  }, [todas, termo, nivel])

  function alternar(id: string) {
    onChange(
      selecionados.includes(id) ? selecionados.filter((s) => s !== id) : [...selecionados, id],
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      {selecionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selecionados.map((id) => (
            <button
              key={id}
              onClick={() => alternar(id)}
              aria-label={`Remover ${mapaLocalidades.get(id)?.nome ?? id}`}
              title={`Remover ${mapaLocalidades.get(id)?.nome ?? id}`}
              className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs text-white"
            >
              {mapaLocalidades.get(id)?.nome ?? id}
              <X size={12} />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-2.5 top-2.5 text-slate-400" />
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder={nivel === 'N3' ? 'Filtrar UFs…' : 'Digite o nome do município…'}
          className="w-full rounded-md border border-slate-300 py-2 pl-8 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {carregando && <p className="text-xs text-slate-400">Carregando localidades do IBGE…</p>}

      {!carregando && (termo || nivel === 'N3') && (
        <ul className="max-h-48 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800">
          {filtradas.length === 0 && (
            <li className="px-3 py-2 text-xs text-slate-400">Nenhuma localidade encontrada.</li>
          )}
          {filtradas.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => alternar(l.id)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  selecionados.includes(l.id) ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
                }`}
              >
                <span>{l.nome}</span>
                <span className="text-xs text-slate-400">{l.subtitulo}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
