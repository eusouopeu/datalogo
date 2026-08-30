import { useMemo, useState } from 'react'
import { SearchBar } from './components/SearchBar'
import { ResultsList } from './components/ResultsList'
import { ExplorerView } from './components/ExplorerView'
import { buscarIndicadores } from './lib/search'
import type { Indicador, SearchMatch } from './types'
import { CATALOGO } from './data/catalog'

export default function App() {
  const [consulta, setConsulta] = useState('')
  const [indicadorSelecionado, setIndicadorSelecionado] = useState<Indicador | null>(null)

  const resultados: SearchMatch[] = useMemo(() => buscarIndicadores(consulta), [consulta])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">Datálogo</h1>
        <p className="mt-1 text-slate-500">
          Explorador de dados públicos brasileiros. Sem IA, sem cadastro, sem servidor — os dados
          são consultados e processados no seu dispositivo.
        </p>
      </header>

      {!indicadorSelecionado ? (
        <>
          <SearchBar valorInicial={consulta} onBuscar={setConsulta} />
          {!consulta && (
            <p className="text-center text-sm text-slate-400">
              Experimente: {CATALOGO.map((i) => i.sinonimos[0]).join(' · ')}
            </p>
          )}
          <ResultsList
            resultados={resultados}
            consulta={consulta}
            onExplorar={(match) => setIndicadorSelecionado(match.indicador)}
          />
        </>
      ) : (
        <ExplorerView indicador={indicadorSelecionado} onVoltar={() => setIndicadorSelecionado(null)} />
      )}

      <footer className="mt-auto pt-8 text-center text-xs text-slate-400">
        Dados: IBGE (API de Agregados/SIDRA). Cálculos executados localmente em TypeScript.
      </footer>
    </div>
  )
}
