import { GitCompareArrows, Moon, Sun } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchBar } from './components/SearchBar'
import { ResultsList } from './components/ResultsList'
import { ExplorerView } from './components/ExplorerView'
import { TaxonomyBrowser } from './components/TaxonomyBrowser'
import { CompareView } from './components/CompareView'
import { buscarIndicadores } from './lib/search'
import { useTheme } from './lib/theme'
import { selecaoInicial } from './lib/facets'
import { estadoParaParams, paramsParaEstado } from './lib/urlState'
import type { FacetSelection, Indicador, SearchMatch } from './types'
import { CATALOGO } from './data/catalog'

type Tela = 'busca' | 'explorar' | 'comparar'

function lerTelaDaUrl(): { tela: Tela; indicador: Indicador | null; selecao: FacetSelection | null } {
  const params = new URLSearchParams(window.location.search)
  if (params.get('tela') === 'comparar') return { tela: 'comparar', indicador: null, selecao: null }

  const estado = paramsParaEstado(params)
  const indicador = estado ? CATALOGO.find((i) => i.id === estado.indicadorId) : undefined
  if (estado && indicador) return { tela: 'explorar', indicador, selecao: estado.selecao }
  return { tela: 'busca', indicador: null, selecao: null }
}

export default function App() {
  const [consulta, setConsulta] = useState('')
  const [tela, setTela] = useState<Tela>(() => lerTelaDaUrl().tela)
  const [indicadorSelecionado, setIndicadorSelecionado] = useState<Indicador | null>(
    () => lerTelaDaUrl().indicador,
  )
  const [selecao, setSelecao] = useState<FacetSelection | null>(() => lerTelaDaUrl().selecao)
  const { tema, alternar } = useTheme()
  const navegouNestaSessao = useRef(false)

  const resultados: SearchMatch[] = useMemo(() => buscarIndicadores(consulta), [consulta])

  // Sincroniza com o botão físico de voltar (Android) / histórico do navegador.
  useEffect(() => {
    function aoNavegarHistorico() {
      const estado = lerTelaDaUrl()
      setTela(estado.tela)
      setIndicadorSelecionado(estado.indicador)
      setSelecao(estado.selecao)
    }
    window.addEventListener('popstate', aoNavegarHistorico)
    return () => window.removeEventListener('popstate', aoNavegarHistorico)
  }, [])

  function abrirIndicador(indicador: Indicador) {
    const nova = selecaoInicial(indicador)
    setIndicadorSelecionado(indicador)
    setSelecao(nova)
    setTela('explorar')
    navegouNestaSessao.current = true
    const params = estadoParaParams({ indicadorId: indicador.id, selecao: nova })
    window.history.pushState({}, '', `?${params}`)
  }

  function atualizarSelecao(nova: FacetSelection) {
    if (!indicadorSelecionado) return
    setSelecao(nova)
    const params = estadoParaParams({ indicadorId: indicadorSelecionado.id, selecao: nova })
    window.history.replaceState({}, '', `?${params}`)
  }

  function abrirComparacao() {
    setTela('comparar')
    navegouNestaSessao.current = true
    window.history.pushState({}, '', '?tela=comparar')
  }

  function voltarParaBusca() {
    if (navegouNestaSessao.current) {
      window.history.back()
      return
    }
    // Chegou direto por link (sem entrada de histórico própria da sessão): reseta sem sair do app.
    setTela('busca')
    setIndicadorSelecionado(null)
    setSelecao(null)
    window.history.replaceState({}, '', window.location.pathname)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="relative text-center">
        <button
          onClick={alternar}
          aria-label={tema === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          title={tema === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          className="absolute right-0 top-0 rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {tema === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <h1 className="text-2xl font-semibold sm:text-3xl">Datálogo</h1>
        <p className="mt-1 text-slate-500">
          Explorador de dados públicos brasileiros. Sem IA, sem cadastro, sem servidor — os dados
          são consultados e processados no seu dispositivo.
        </p>
      </header>

      {tela === 'busca' && (
        <>
          <div className="flex items-center gap-2">
            <SearchBar valorInicial={consulta} onBuscar={setConsulta} />
            <button
              onClick={abrirComparacao}
              aria-label="Comparar dois indicadores"
              title="Comparar dois indicadores"
              className="shrink-0 rounded-lg border border-slate-300 p-3 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <GitCompareArrows size={20} />
            </button>
          </div>
          {!consulta && (
            <p className="text-center text-sm text-slate-400">
              Experimente: {CATALOGO.map((i) => i.sinonimos[0]).join(' · ')}
            </p>
          )}
          <ResultsList resultados={resultados} consulta={consulta} onExplorar={(match) => abrirIndicador(match.indicador)} />
          {!consulta && <TaxonomyBrowser onSelecionar={abrirIndicador} />}
        </>
      )}

      {tela === 'explorar' && indicadorSelecionado && selecao && (
        <ExplorerView
          indicador={indicadorSelecionado}
          selecao={selecao}
          onSelecaoChange={atualizarSelecao}
          onVoltar={voltarParaBusca}
        />
      )}

      {tela === 'comparar' && <CompareView onVoltar={voltarParaBusca} />}

      <footer className="mt-auto pt-8 text-center text-xs text-slate-400">
        Dados: IBGE (SIDRA), Banco Central (SGS), Tesouro Nacional (SICONFI) e Comex Stat (MDIC).
        Cálculos executados localmente em TypeScript.
      </footer>
    </div>
  )
}
