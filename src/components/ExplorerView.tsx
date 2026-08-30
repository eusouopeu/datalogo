import { useEffect, useState } from 'react'
import type { FacetSelection, Indicador, SerieResultado } from '../types'
import { QueryBuilder } from './QueryBuilder'
import { QueryTranslation } from './QueryTranslation'
import { DataTable } from './DataTable'
import { ChartView } from './ChartView'
import { AnalysisPanel } from './AnalysisPanel'
import { buscarSerie } from '../lib/sidra'
import { baixarCsv, serieParaCsv } from '../lib/csv'

interface Props {
  indicador: Indicador
  onVoltar: () => void
}

function selecaoInicial(indicador: Indicador): FacetSelection {
  const nivel = indicador.niveisTerritoriais[0]
  const categorias: Record<string, string> = {}
  for (const c of indicador.classificacoes) {
    categorias[c.id] = c.categorias[0].id
  }
  return { nivelTerritorial: nivel.nivel, categorias, quantidadePeriodos: 8 }
}

export function ExplorerView({ indicador, onVoltar }: Props) {
  const [selecao, setSelecao] = useState<FacetSelection>(() => selecaoInicial(indicador))
  const [series, setSeries] = useState<SerieResultado[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const nivelInfo = indicador.niveisTerritoriais.find((n) => n.nivel === selecao.nivelTerritorial)
  const prontoParaConsultar = !nivelInfo?.requerSelecao || Boolean(selecao.codigoTerritorial)

  useEffect(() => {
    if (!prontoParaConsultar) {
      setSeries(null)
      return
    }
    let cancelado = false
    setCarregando(true)
    setErro(null)
    buscarSerie(indicador, selecao)
      .then((res) => {
        if (!cancelado) setSeries(res)
      })
      .catch((e: Error) => {
        if (!cancelado) {
          setErro(e.message)
          setSeries(null)
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicador, JSON.stringify(selecao), prontoParaConsultar])

  return (
    <div className="flex flex-col gap-5 text-left">
      <button onClick={onVoltar} className="w-fit text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← Voltar para a busca
      </button>

      <div>
        <h2 className="text-xl font-semibold">{indicador.nome}</h2>
        <p className="text-sm text-slate-500">{indicador.tema.join(' → ')}</p>
      </div>

      <QueryBuilder indicador={indicador} selecao={selecao} onChange={setSelecao} />
      <QueryTranslation indicador={indicador} selecao={selecao} />

      {!prontoParaConsultar && (
        <p className="text-sm text-slate-500">Selecione uma localização para carregar os dados.</p>
      )}
      {carregando && <p className="text-sm text-slate-500">Consultando API do IBGE…</p>}
      {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}

      {series && series.length > 0 && !carregando && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Resultados</h3>
            <button
              onClick={() => baixarCsv(`${indicador.id}.csv`, serieParaCsv(series))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Exportar CSV
            </button>
          </div>
          <ChartView series={series} unidade={indicador.unidade} />
          <DataTable series={series} unidade={indicador.unidade} />
          <AnalysisPanel series={series} unidade={indicador.unidade} />
        </>
      )}
    </div>
  )
}
