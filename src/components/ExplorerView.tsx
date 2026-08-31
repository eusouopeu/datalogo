import { ArrowLeft, Download, LineChart, RefreshCw, Sigma, Table2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FacetSelection, Indicador, SerieResultado } from '../types'
import { QueryBuilder } from './QueryBuilder'
import { QueryTranslation } from './QueryTranslation'
import { DataTable } from './DataTable'
import { ChartView } from './ChartView'
import { AnalysisPanel } from './AnalysisPanel'
import { buscarSerieIndicador } from '../lib/dados'
import { serieParaCsv } from '../lib/csv'
import { salvarCsv } from '../lib/exportar'
import { estaExpirado, gravarCache, lerCache, ttlPorPeriodicidade } from '../lib/cache'

interface Props {
  indicador: Indicador
  selecao: FacetSelection
  onSelecaoChange: (selecao: FacetSelection) => void
  onVoltar: () => void
}

type Visualizacao = 'grafico' | 'tabela' | 'analise'

const VISUALIZACOES: { id: Visualizacao; icone: typeof LineChart; label: string }[] = [
  { id: 'grafico', icone: LineChart, label: 'Gráfico' },
  { id: 'tabela', icone: Table2, label: 'Tabela' },
  { id: 'analise', icone: Sigma, label: 'Análise' },
]

function chaveCache(indicador: Indicador, selecao: FacetSelection): string {
  return `serie:${indicador.id}:${JSON.stringify(selecao)}`
}

function mensagemErro(motivo: unknown): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.'
  }
  return motivo instanceof Error ? motivo.message : 'Erro desconhecido ao consultar a API.'
}

function ultimoPeriodoDisponivel(series: SerieResultado[]): string | null {
  const periodos = series.flatMap((s) => s.pontos.filter((p) => p.valor !== null).map((p) => p.periodo))
  return periodos.length > 0 ? periodos.sort().at(-1)! : null
}

export function ExplorerView({ indicador, selecao, onSelecaoChange, onVoltar }: Props) {
  const [series, setSeries] = useState<SerieResultado[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [consultadoEm, setConsultadoEm] = useState<number | null>(null)
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('grafico')
  const [tentativa, setTentativa] = useState(0)
  const [exportando, setExportando] = useState(false)

  const nivelInfo = indicador.niveisTerritoriais.find((n) => n.nivel === selecao.nivelTerritorial)
  const prontoParaConsultar = !nivelInfo?.requerSelecao || selecao.codigosTerritoriais.length > 0
  const chave = useMemo(() => chaveCache(indicador, selecao), [indicador, selecao])

  useEffect(() => {
    if (!prontoParaConsultar) {
      setSeries(null)
      setErro(null)
      return
    }

    const cache = lerCache<SerieResultado[]>(chave)
    if (cache) {
      setSeries(cache.valor)
      setConsultadoEm(cache.timestamp)
      setErro(null)
    }

    const ttl = ttlPorPeriodicidade(indicador.periodicidade)
    if (cache && !estaExpirado(cache, ttl) && tentativa === 0) {
      return // cache ainda fresco: evita nova requisição
    }

    let cancelado = false
    setCarregando(!cache)
    buscarSerieIndicador(indicador, selecao)
      .then((res) => {
        if (cancelado) return
        setSeries(res)
        setConsultadoEm(Date.now())
        gravarCache(chave, res)
        setErro(null)
      })
      .catch((e) => {
        if (!cancelado && !cache) setErro(mensagemErro(e))
        // com cache exibido em tela, a revalidação falhou em silêncio — mantém o que já foi mostrado
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, prontoParaConsultar, tentativa])

  async function exportarCsv() {
    if (!series) return
    setExportando(true)
    try {
      await salvarCsv(`${indicador.id}.csv`, serieParaCsv(series))
    } finally {
      setExportando(false)
    }
  }

  const ultimoPeriodo = series ? ultimoPeriodoDisponivel(series) : null

  return (
    <div className="flex flex-col gap-5 text-left">
      <button
        onClick={onVoltar}
        aria-label="Voltar para a busca"
        title="Voltar para a busca"
        className="w-fit rounded-md p-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
      >
        <ArrowLeft size={20} />
      </button>

      <div>
        <h2 className="text-xl font-semibold">{indicador.nome}</h2>
        <p className="text-sm text-slate-500">{indicador.tema.join(' → ')}</p>
      </div>

      <QueryBuilder indicador={indicador} selecao={selecao} onChange={onSelecaoChange} />
      <QueryTranslation indicador={indicador} selecao={selecao} />

      {!prontoParaConsultar && (
        <p className="text-sm text-slate-500">Selecione uma localização para carregar os dados.</p>
      )}
      {carregando && <p className="text-sm text-slate-500">Consultando API do {indicador.fonte}…</p>}
      {erro && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 p-3 text-sm text-red-600 dark:border-red-900 dark:text-red-400">
          <span>{erro}</span>
          <button
            onClick={() => setTentativa((t) => t + 1)}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
              {VISUALIZACOES.map(({ id, icone: Icone, label }) => (
                <button
                  key={id}
                  onClick={() => setVisualizacao(id)}
                  aria-label={label}
                  title={label}
                  className={`rounded-md p-2 ${
                    visualizacao === id
                      ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icone size={18} />
                </button>
              ))}
            </div>
            <button
              onClick={exportarCsv}
              disabled={exportando}
              aria-label="Exportar CSV"
              title="Exportar CSV"
              className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Download size={18} />
            </button>
          </div>

          {(consultadoEm || ultimoPeriodo) && (
            <p className="text-xs text-slate-400">
              {ultimoPeriodo && <>Último período disponível: {ultimoPeriodo}. </>}
              {consultadoEm && <>Consultado às {new Date(consultadoEm).toLocaleTimeString('pt-BR')}.</>}
            </p>
          )}

          {visualizacao === 'grafico' && <ChartView series={series} unidade={indicador.unidade} />}
          {visualizacao === 'tabela' && <DataTable series={series} unidade={indicador.unidade} />}
          {visualizacao === 'analise' && <AnalysisPanel series={series} unidade={indicador.unidade} />}
        </>
      )}
    </div>
  )
}
