import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/** Fecha o painel ao clicar fora ou pressionar Escape — comportamento comum aos dois dropdowns abaixo. */
function usePainelFechavel<T extends HTMLElement>() {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  return { aberto, setAberto, ref }
}

const ESTILO_BOTAO =
  'flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm dark:border-slate-700 dark:bg-slate-900'
const ESTILO_PAINEL =
  'absolute z-20 mt-1 max-h-56 w-full min-w-max overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900'
const ESTILO_OPCAO =
  'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800'

export interface OpcaoDropdown<T extends string> {
  valor: T
  label: string
}

interface PropsSingle<T extends string> {
  label: string
  opcoes: OpcaoDropdown<T>[]
  valor: T
  onChange: (valor: T) => void
}

/** Dropdown de seleção única: fecha ao escolher uma opção. */
export function SingleSelectDropdown<T extends string>({ label, opcoes, valor, onChange }: PropsSingle<T>) {
  const { aberto, setAberto, ref } = usePainelFechavel<HTMLDivElement>()
  const atual = opcoes.find((o) => o.valor === valor)

  return (
    <div ref={ref} className="relative">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <button type="button" onClick={() => setAberto((a) => !a)} className={ESTILO_BOTAO}>
        <span className="truncate">{atual?.label ?? 'Selecione'}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>
      {aberto && (
        <ul className={ESTILO_PAINEL}>
          {opcoes.map((o) => (
            <li key={o.valor}>
              <button
                type="button"
                onClick={() => {
                  onChange(o.valor)
                  setAberto(false)
                }}
                className={ESTILO_OPCAO}
              >
                <span>{o.label}</span>
                {o.valor === valor && <Check size={14} className="shrink-0 text-emerald-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface PropsMulti {
  label: string
  opcoes: OpcaoDropdown<string>[]
  valores: string[]
  onChange: (valores: string[]) => void
  placeholder?: string
}

/** Dropdown de múltipla escolha: painel permanece aberto entre seleções. */
export function MultiSelectDropdown({ label, opcoes, valores, onChange, placeholder = 'Selecione' }: PropsMulti) {
  const { aberto, setAberto, ref } = usePainelFechavel<HTMLDivElement>()

  function alternar(valor: string) {
    onChange(valores.includes(valor) ? valores.filter((v) => v !== valor) : [...valores, valor])
  }

  const resumo =
    valores.length === 0
      ? placeholder
      : valores.length <= 2
        ? valores.map((v) => opcoes.find((o) => o.valor === v)?.label ?? v).join(', ')
        : `${valores.length} selecionados`

  return (
    <div ref={ref} className="relative">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <button type="button" onClick={() => setAberto((a) => !a)} className={ESTILO_BOTAO}>
        <span className="truncate">{resumo}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>
      {aberto && (
        <ul className={ESTILO_PAINEL}>
          {opcoes.map((o) => (
            <li key={o.valor}>
              <button type="button" onClick={() => alternar(o.valor)} className={ESTILO_OPCAO}>
                <span>{o.label}</span>
                {valores.includes(o.valor) && <Check size={14} className="shrink-0 text-emerald-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
