import { Search } from 'lucide-react'
import { useState } from 'react'

interface Props {
  valorInicial?: string
  onBuscar: (consulta: string) => void
}

export function SearchBar({ valorInicial = '', onBuscar }: Props) {
  const [valor, setValor] = useState(valorInicial)

  return (
    <form
      className="flex w-full gap-2"
      onSubmit={(e) => {
        e.preventDefault()
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
