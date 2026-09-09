import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Props {
  valorInicial?: string
  onBuscar: (consulta: string) => void
}

const DEBOUNCE_MS = 200

/** Busca ao digitar (debounced) — sem esperar Enter/clique, já que a busca roda 100% local. */
export function SearchBar({ valorInicial = '', onBuscar }: Props) {
  const [valor, setValor] = useState(valorInicial)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => onBuscar(valor), DEBOUNCE_MS)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  return (
    <form
      className="flex w-full gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        onBuscar(valor)
      }}
    >
      <input
        type="text"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="ex: desemprego jovens bahia"
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900"
        autoFocus
      />
      <button
        type="submit"
        aria-label="Buscar"
        title="Buscar"
        className="rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"
      >
        <Search size={20} />
      </button>
    </form>
  )
}
