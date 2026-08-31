import { Moon, Sun } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchBar } from './components/SearchBar'
import { ResultsList } from './components/ResultsList'
import { ExplorerView } from './components/ExplorerView'
import { TaxonomyBrowser } from './components/TaxonomyBrowser'
import { Destaques } from './components/Destaques'
import { FavoritosRecentes } from './components/FavoritosRecentes'
import { PaineisSalvos } from './components/PaineisSalvos'
import { buscarIndicadores } from './lib/search'
import { useTheme } from './lib/theme'
import { selecaoInicial } from './lib/facets'
import { estadoParaParams, paramsParaEstado } from './lib/urlState'
import { purgarCacheExpirado } from './lib/cache'
import { alternarFavorito, listarFavoritos, listarRecentes, registrarRecente } from './lib/favoritos'
import type { Painel } from './lib/paineis'
import type { FacetSelection, Indicador } from './types'
import { CATALOGO } from './data/catalog'

type Tela = 'busca' | 'explorar'

interface EstadoNavegacao {
  tela: Tela
  indicador: Indicador | null
  selecao: FacetSelection | null
}

const IDADE_MAXIMA_CACHE = 30 * 24 * 60 * 60 * 1000 // 30 dias

function lerTelaDaUrl(): EstadoNavegacao {
  const params = new URLSearchParams(window.location.search)
  const estado = paramsParaEstado(params)
  const indicador = estado ? CATALOGO.find((i) => i.id === estado.indicadorId) : undefined
  if (estado && indicador) return { tela: 'explorar', indicador, selecao: estado.selecao }
  return { tela: 'busca', indicador: null, selecao: null }
}

export default function App() {
  const [consulta, setConsulta] = useState('')
  const [navegacao, setNavegacao] = useState<EstadoNavegacao>(() => lerTelaDaUrl())
  const { tema, alternar } = useTheme()
  const navegouNestaSessao = useRef(false)
  const [favoritos, setFavoritos] = useState<string[]>(() => listarFavoritos())
  const [recentes, setRecentes] = useState<string[]>(() => listarRecentes())

  const resultados = useMemo(() => buscarIndicadores(consulta), [consulta])

  useEffect(() => {
    purgarCacheExpirado(IDADE_MAXIMA_CACHE)
  }, [])

  // Sincroniza com o botão físico de voltar (Android) / histórico do navegador.
  useEffect(() => {
    function aoNavegarHistorico() {
      setNavegacao(lerTelaDaUrl())
    }
    window.addEventListener('popstate', aoNavegarHistorico)
    return () => window.removeEventListener('popstate', aoNavegarHistorico)
  }, [])

  function navegarPara(indicador: Indicador, selecao: FacetSelection) {
    setNavegacao({ tela: 'explorar', indicador, selecao })
    navegouNestaSessao.current = true
    setRecentes(registrarRecente(indicador.id))
    const params = estadoParaParams({ indicadorId: indicador.id, selecao })
    window.history.pushState({}, '', `?${params}`)
  }

  function abrirIndicador(indicador: Indicador) {
    navegarPara(indicador, selecaoInicial(indicador))
  }

  function abrirPainel(painel: Painel) {
    const indicador = CATALOGO.find((i) => i.id === painel.indicadorId)
    if (indicador) navegarPara(indicador, painel.selecao)
  }

  function atualizarSelecao(nova: FacetSelection) {
    if (!navegacao.indicador) return
    setNavegacao({ ...navegacao, selecao: nova })
    const params = estadoParaParams({ indicadorId: navegacao.indicador.id, selecao: nova })
    window.history.replaceState({}, '', `?${params}`)
  }

  function voltarParaBusca() {
    if (navegouNestaSessao.current) {
      window.history.back()
      return
    }
    // Chegou direto por link (sem entrada de histórico própria da sessão): reseta sem sair do app.
    setNavegacao({ tela: 'busca', indicador: null, selecao: null })
    window.history.replaceState({}, '', window.location.pathname)
  }

  return (
    <div className={`mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 ${navegacao.tela === 'busca' ? 'py-10' : 'pb-10'}`}>
      {navegacao.tela === 'busca' && (
        <>
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
          </header>

          <SearchBar valorInicial={consulta} onBuscar={setConsulta} />
          {!consulta && (
            <p className="text-center text-sm text-slate-400">
              Experimente: {CATALOGO.map((i) => i.sinonimos[0]).join(' · ')}
            </p>
          )}
          <ResultsList
            resultados={resultados}
            consulta={consulta}
            favoritos={favoritos}
            onExplorar={(match) => abrirIndicador(match.indicador)}
            onAlternarFavorito={(id) => setFavoritos(alternarFavorito(id))}
          />
          {!consulta && (
            <div className="flex flex-col gap-6">
              <Destaques onExplorar={abrirIndicador} />
              <FavoritosRecentes favoritos={favoritos} recentes={recentes} onExplorar={abrirIndicador} />
              <PaineisSalvos onAbrir={abrirPainel} />
              <TaxonomyBrowser onSelecionar={abrirIndicador} />
            </div>
          )}
        </>
      )}

      {navegacao.tela === 'explorar' && navegacao.indicador && navegacao.selecao && (
        <ExplorerView
          indicador={navegacao.indicador}
          selecao={navegacao.selecao}
          onSelecaoChange={atualizarSelecao}
          onVoltar={voltarParaBusca}
          favorito={favoritos.includes(navegacao.indicador.id)}
          onAlternarFavorito={() => setFavoritos(alternarFavorito(navegacao.indicador!.id))}
        />
      )}

      {navegacao.tela === 'busca' && (
        <footer className="mt-auto pt-8 text-center text-xs text-slate-400">
          Dados: IBGE (SIDRA), Banco Central (SGS), Tesouro Nacional (SICONFI) e Comex Stat (MDIC).
          Cálculos executados localmente em TypeScript.
        </footer>
      )}
    </div>
  )
}
