import { Check, ChevronDown, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { NivelTerritorialOpcao } from '../types'
import { buscarMunicipios, buscarUfs, type Localidade } from '../lib/ibgeLocalidades'
import { normalize } from '../lib/normalize'

interface Props {
  niveis: NivelTerritorialOpcao[]
  nivelTerritorial: string
  codigosTerritoriais: string[]
  onChange: (nivelTerritorial: string, codigosTerritoriais: string[]) => void
}

/**
 * Dropdown único de localização: "Brasil" aparece como mais uma opção da lista de UFs
 * (ou municípios), em vez de um seletor de nível separado. Multi-select para os níveis
 * que aceitam mais de uma localidade (comparação/ranking).
 */
export function LocationDropdown({ niveis, nivelTerritorial, codigosTerritoriais, onChange }: Props) {
  const [aberto, setAberto] = useState(false)
  const [termo, setTermo] = useState('')
  const [ufs, setUfs] = useState<Localidade[]>([])
  const [municipios, setMunicipios] = useState<Localidade[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const nivelBrasil = niveis.find((n) => !n.requerSelecao)
  const nivelUf = niveis.find((n) => n.nivel === 'N3' && n.requerSelecao)
  const nivelMunicipio = niveis.find((n) => n.nivel === 'N6' && n.requerSelecao)

  useEffect(() => {
    if (nivelUf) buscarUfs().then(setUfs)
    if (nivelMunicipio) buscarMunicipios().then(setMunicipios)
  }, [nivelUf, nivelMunicipio])

  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto])

  const mapaLocalidades = useMemo(
    () => new Map([...ufs, ...municipios].map((l) => [l.id, l])),
    [ufs, municipios],
  )

  const resumo =
    nivelTerritorial === nivelBrasil?.nivel
      ? nivelBrasil.label
      : codigosTerritoriais.length === 0
        ? 'Selecione'
        : codigosTerritoriais.length <= 2
          ? codigosTerritoriais.map((id) => mapaLocalidades.get(id)?.nome ?? id).join(', ')
          : `${codigosTerritoriais.length} selecionadas`

  function selecionarBrasil() {
    if (!nivelBrasil) return
    onChange(nivelBrasil.nivel, [])
    setAberto(false)
  }

  function alternarLocalidade(nivel: NivelTerritorialOpcao['nivel'], id: string) {
    if (nivelTerritorial !== nivel) {
      onChange(nivel, [id])
      return
    }
    const novos = codigosTerritoriais.includes(id)
      ? codigosTerritoriais.filter((c) => c !== id)
      : [...codigosTerritoriais, id]
    onChange(nivel, novos)
  }

  function grupoFiltrado(lista: Localidade[]) {
    const termoNorm = normalize(termo)
    if (!termoNorm) return lista
    return lista.filter((l) => normalize(l.nome).includes(termoNorm))
  }

  return (
    <div ref={ref} className="relative">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Localização</label>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <span className="truncate">{resumo}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="absolute z-20 mt-1 w-full min-w-max rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {(nivelUf || nivelMunicipio) && (
            <div className="relative border-b border-slate-100 p-2 dark:border-slate-800">
              <Search size={14} className="pointer-events-none absolute left-4 top-4.5 text-slate-400" />
              <input
                type="text"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Filtrar…"
                className="w-full rounded border border-slate-200 py-1.5 pl-7 pr-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          )}
          <ul className="max-h-56 overflow-y-auto py-1">
            {nivelBrasil && !termo && (
              <li>
                <button
                  type="button"
                  onClick={selecionarBrasil}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span>{nivelBrasil.label}</span>
                  {nivelTerritorial === nivelBrasil.nivel && <Check size={14} className="text-emerald-600" />}
                </button>
              </li>
            )}
            {nivelUf && (
              <>
                <li className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {nivelUf.label}
                </li>
                {grupoFiltrado(ufs).map((uf) => (
                  <li key={uf.id}>
                    <button
                      type="button"
                      onClick={() => alternarLocalidade('N3', uf.id)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span>{uf.nome}</span>
                      {nivelTerritorial === 'N3' && codigosTerritoriais.includes(uf.id) && (
                        <Check size={14} className="shrink-0 text-emerald-600" />
                      )}
                    </button>
                  </li>
                ))}
              </>
            )}
            {nivelMunicipio && termo && (
              <>
                <li className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {nivelMunicipio.label}
                </li>
                {grupoFiltrado(municipios)
                  .slice(0, 30)
                  .map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => alternarLocalidade('N6', m.id)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span>
                          {m.nome} <span className="text-xs text-slate-400">{m.subtitulo}</span>
                        </span>
                        {nivelTerritorial === 'N6' && codigosTerritoriais.includes(m.id) && (
                          <Check size={14} className="shrink-0 text-emerald-600" />
                        )}
                      </button>
                    </li>
                  ))}
              </>
            )}
            {nivelMunicipio && !termo && (
              <li className="px-3 py-2 text-xs text-slate-400">Digite para buscar um município…</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
