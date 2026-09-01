import { Home, Moon, Settings, Star, Sun } from 'lucide-react'
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

type Tela = 'busca' | 'favoritos' | 'ajustes' | 'explorar'

interface EstadoNavegacao {
  tela: Tela
  indicador: Indicador | null
  selecao: FacetSelection | null
}

const IDADE_MAXIMA_CACHE = 30 * 24 * 60 * 60 * 1000 // 30 dias

const ABAS_NAVEGACAO: { id: Extract<Tela, 'busca' | 'favoritos' | 'ajustes'>; icone: typeof Home; label: string }[] = [
  { id: 'busca', icone: Home, label: 'Início' },
  { id: 'favoritos', icone: Star, label: 'Favoritos' },
  { id: 'ajustes', icone: Settings, label: 'Ajustes' },
]

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

  const abaAtiva = navegacao.tela !== 'explorar' ? navegacao.tela : null

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      {abaAtiva && (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <h1 className="text-lg font-semibold">Datálogo</h1>
          <button
            onClick={alternar}
            aria-label={tema === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            title={tema === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {tema === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>
      )}

      <div className={`flex-1 px-4 ${abaAtiva ? 'pb-24 pt-6' : 'pb-10'}`}>
        {navegacao.tela === 'busca' && (
          <div className="flex flex-col gap-6">
            <SearchBar valorInicial={consulta} onBuscar={setConsulta} />
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
                <PaineisSalvos onAbrir={abrirPainel} />
                <TaxonomyBrowser onSelecionar={abrirIndicador} />
              </div>
            )}
          </div>
        )}

        {navegacao.tela === 'favoritos' && (
          <FavoritosRecentes favoritos={favoritos} recentes={recentes} onExplorar={abrirIndicador} />
        )}

        {navegacao.tela === 'ajustes' && (
          <div className="flex flex-col gap-6 text-sm text-slate-500 dark:text-slate-400">
            <p>
              Dados: IBGE (SIDRA), Banco Central (SGS), Tesouro Nacional (SICONFI) e Comex Stat (MDIC). Cálculos
              executados localmente em TypeScript.
            </p>
            <p>Sem IA. Sem cadastro. Sem servidor.</p>
          </div>
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
      </div>

      {abaAtiva && (
        <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-3xl items-center justify-around border-t border-slate-200 bg-white/95 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          {ABAS_NAVEGACAO.map(({ id, icone: Icone, label }) => (
            <button
              key={id}
              onClick={() => setNavegacao({ tela: id, indicador: null, selecao: null })}
              aria-label={label}
              title={label}
              className={`rounded-md p-3 ${
                abaAtiva === id
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icone size={22} />
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
