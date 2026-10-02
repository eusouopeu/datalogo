import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Download,
  Flag,
  HardDriveDownload,
  ImageDown,
  LineChart,
  Map,
  RefreshCw,
  Sigma,
  Table2,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FacetSelection, Indicador, SerieResultado } from '../types'
import { QueryBuilder } from './QueryBuilder'
import { QueryTranslation } from './QueryTranslation'
import { DataTable } from './DataTable'
import { ChartView } from './ChartView'
import { MapaUf } from './MapaUf'
import { Leitura } from './Leitura'
import { AnalysisPanel } from './AnalysisPanel'
import { CompareInline } from './CompareInline'
import { chaveCache, useSerie } from '../lib/useSerie'
import { serieParaCsv } from '../lib/csv'
import { salvarCsv, salvarImagemPng, svgParaPngDataUrl } from '../lib/exportar'
import { estadoParaParams } from '../lib/urlState'
import { compararUltimoValor } from '../lib/analysis'
import { estaFixado, fixar, removerFixado } from '../lib/armazenamento'
import { marcarVisto, registrarUltimoPeriodo } from '../lib/novidades'
import { formatarPeriodo } from '../lib/leitura'

interface Props {
  indicador: Indicador
  selecao: FacetSelection
  onSelecaoChange: (selecao: FacetSelection) => void
  onVoltar: () => void
  salvo: boolean
  onAlternarSalvo: () => void
}

type Visualizacao = 'grafico' | 'tabela' | 'analise' | 'mapa'

const VISUALIZACOES: { id: Visualizacao; icone: typeof LineChart; label: string }[] = [
  { id: 'grafico', icone: LineChart, label: 'Gráfico' },
  { id: 'mapa', icone: Map, label: 'Mapa por estado' },
  { id: 'tabela', icone: Table2, label: 'Tabela' },
  { id: 'analise', icone: Sigma, label: 'Análise' },
]

function ultimoPeriodoDisponivel(series: { pontos: { periodo: string; valor: number | null }[] }[]): string | null {
  const periodos = series.flatMap((s) => s.pontos.filter((p) => p.valor !== null).map((p) => p.periodo))
  return periodos.length > 0 ? periodos.sort().at(-1)! : null
}

/** Resumo de ranking exibido direto sob o gráfico quando há mais de uma localidade/categoria selecionada. */
function RankingResumo({ series, unidade }: { series: SerieResultado[]; unidade: string }) {
  if (series.length < 2) return null
  const ranking = compararUltimoValor(series)
  if (ranking.length < 2) return null
  return (
    <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Ranking (valor mais recente)
      </p>
      <ol className="flex flex-col gap-1">
        {ranking.map((item, i) => (
          <li key={item.rotulo} className="flex justify-between">
            <span>
              <span className="mr-2 text-slate-400">{i + 1}ª</span>
              {item.rotulo}
            </span>
            <span className="font-medium">
              {item.valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {unidade}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function ExplorerView({ indicador, selecao, onSelecaoChange, onVoltar, salvo, onAlternarSalvo }: Props) {
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('grafico')
  const [exportando, setExportando] = useState(false)
  const [mostrarEventos, setMostrarEventos] = useState(false)

  const nivelInfo = indicador.niveisTerritoriais.find((n) => n.nivel === selecao.nivelTerritorial)
  const prontoParaConsultar = !nivelInfo?.requerSelecao || selecao.codigosTerritoriais.length > 0

  const { series, carregando, erro, consultadoEm, desatualizado, deOffline, recarregar } = useSerie(
    indicador,
    selecao,
    prontoParaConsultar,
  )

  const chaveOffline = chaveCache(indicador, selecao)
  const [salvoOffline, setSalvoOffline] = useState(() => estaFixado(chaveOffline))

  useEffect(() => {
    setSalvoOffline(estaFixado(chaveOffline))
  }, [chaveOffline])

  const ultimoPeriodo = series ? ultimoPeriodoDisponivel(series) : null

  // Aviso de dado novo: registra o período que a API devolveu e zera o aviso deste indicador.
  useEffect(() => {
    if (ultimoPeriodo) registrarUltimoPeriodo(indicador.id, ultimoPeriodo)
    marcarVisto(indicador.id)
  }, [indicador.id, ultimoPeriodo])

  function alternarOffline() {
    if (salvoOffline) {
      removerFixado(chaveOffline)
      setSalvoOffline(false)
    } else if (series) {
      fixar(chaveOffline)
      setSalvoOffline(estaFixado(chaveOffline))
    }
  }

  async function exportarCsv() {
    if (!series) return
    setExportando(true)
    try {
      await salvarCsv(`${indicador.id}.csv`, serieParaCsv(series))
    } finally {
      setExportando(false)
    }
  }

  async function exportarPng() {
    const svg = document.querySelector<SVGSVGElement>('#datalogo-chart svg')
    if (!svg) return
    setExportando(true)
    try {
      const escuro = document.documentElement.classList.contains('dark')
      const dataUrl = await svgParaPngDataUrl(svg, escuro ? '#020617' : '#ffffff')
      await salvarImagemPng(`${indicador.id}.png`, dataUrl)
    } finally {
      setExportando(false)
    }
  }

  const linkCompartilhavel = `${window.location.origin}${window.location.pathname}?${estadoParaParams({ indicadorId: indicador.id, selecao })}`

  // O mapa só existe para consulta por UF com código de localidade na resposta.
  const temMapa =
    selecao.nivelTerritorial === 'N3' && (series ?? []).some((s) => s.localidadeCodigo && s.localidadeCodigo.length === 2)
  const visualizacoesDisponiveis = VISUALIZACOES.filter((v) => v.id !== 'mapa' || temMapa)
  const visualizacaoAtiva = visualizacao === 'mapa' && !temMapa ? 'grafico' : visualizacao

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-2 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <button
          onClick={onVoltar}
          aria-label="Voltar para a busca"
          title="Voltar para a busca"
          className="shrink-0 rounded-md p-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">{indicador.nome}</h2>
        <button
          onClick={onAlternarSalvo}
          aria-label={salvo ? 'Remover dos salvos' : 'Salvar indicador com estes filtros'}
          title={salvo ? 'Remover dos salvos' : 'Salvar indicador com estes filtros'}
          className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {salvo ? <BookmarkCheck size={20} className="text-emerald-600 dark:text-emerald-400" /> : <Bookmark size={20} />}
        </button>
      </div>

      <p className="-mt-3 text-sm text-slate-500">{indicador.tema.join(' → ')}</p>

      <QueryBuilder indicador={indicador} selecao={selecao} onChange={onSelecaoChange} />

      {!prontoParaConsultar && (
        <p className="text-sm text-slate-500">Selecione uma localização para carregar os dados.</p>
      )}
      {carregando && <p className="text-sm text-slate-500">Consultando API do {indicador.fonte}…</p>}
      {erro && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 p-3 text-sm text-red-600 dark:border-red-900 dark:text-red-400">
          <span>{erro}</span>
          <button
            onClick={recarregar}
            aria-label="Tentar novamente"
            title="Tentar novamente"
            className="shrink-0 rounded-md p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      {series && series.length > 0 && (
        <>
          {series.length === 1 && <Leitura serie={series[0]} indicador={indicador} />}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
              {visualizacoesDisponiveis.map(({ id, icone: Icone, label }) => (
                <button
                  key={id}
                  onClick={() => setVisualizacao(id)}
                  aria-label={label}
                  title={label}
                  className={`rounded-md p-2 ${
                    visualizacaoAtiva === id
                      ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icone size={18} />
                </button>
              ))}
            </div>
            <div className="flex flex-row gap-2">
              {visualizacaoAtiva === 'grafico' && (
                <button
                  onClick={exportarPng}
                  disabled={exportando}
                  aria-label="Exportar gráfico como imagem"
                  title="Exportar gráfico como imagem"
                  className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <ImageDown size={18} />
                </button>
              )}
              <button
                onClick={exportarCsv}
                disabled={exportando}
                aria-label="Exportar CSV"
                title="Exportar CSV"
                className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Download size={18} />
              </button>
              <button
                onClick={alternarOffline}
                aria-label={salvoOffline ? 'Remover uso offline' : 'Salvar para uso offline'}
                title={salvoOffline ? 'Remover uso offline' : 'Salvar para uso offline'}
                className={`rounded-md border p-2 ${
                  salvoOffline
                    ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                    : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {salvoOffline ? <Trash2 size={18} /> : <HardDriveDownload size={18} />}
              </button>
            </div>
          </div>

          {visualizacaoAtiva === 'grafico' && (
            <ChartView
              series={series}
              unidade={indicador.unidade}
              periodicidade={indicador.periodicidade}
              mostrarEventos={mostrarEventos}
            />
          )}
          {visualizacaoAtiva === 'mapa' && <MapaUf series={series} unidade={indicador.unidade} />}
          {visualizacaoAtiva === 'tabela' && <DataTable series={series} unidade={indicador.unidade} />}
          {visualizacaoAtiva === 'analise' && <AnalysisPanel series={series} unidade={indicador.unidade} />}

          {visualizacaoAtiva === 'grafico' && <RankingResumo series={series} unidade={indicador.unidade} />}

          {(consultadoEm || ultimoPeriodo) && (
            <p className="text-xs text-slate-400">
              {ultimoPeriodo && <>Último período disponível: {formatarPeriodo(ultimoPeriodo, indicador.periodicidade)}. </>}
              {consultadoEm && <>Consultado às {new Date(consultadoEm).toLocaleTimeString('pt-BR')}.</>}
              {desatualizado && (
                <span className="ml-1 text-amber-600 dark:text-amber-400">
                  — sem conexão: mostrando dado de {new Date(consultadoEm ?? Date.now()).toLocaleDateString('pt-BR')}.
                </span>
              )}
              {deOffline && (
                <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                  — sem conexão: mostrando dado salvo offline em{' '}
                  {new Date(consultadoEm ?? Date.now()).toLocaleDateString('pt-BR')}.
                </span>
              )}
            </p>
          )}

          {visualizacaoAtiva === 'grafico' && series[0] && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMostrarEventos((v) => !v)}
                aria-label={mostrarEventos ? 'Ocultar eventos históricos' : 'Mostrar eventos históricos'}
                title={mostrarEventos ? 'Ocultar eventos históricos' : 'Mostrar eventos históricos'}
                className={`shrink-0 rounded-md border p-2 ${
                  mostrarEventos
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'border-slate-300 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <Flag size={16} />
              </button>
              <CompareInline indicadorAtual={indicador} serieAtual={series[0]} />
            </div>
          )}
        </>
      )}

      <QueryTranslation indicador={indicador} selecao={selecao} linkCompartilhavel={linkCompartilhavel} />
    </div>
  )
}
