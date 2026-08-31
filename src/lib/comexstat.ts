import type { FacetSelection, IndicadorComexStat, SerieResultado } from '../types'

const URL_API = 'https://api-comexstat.mdic.gov.br/general'

interface RespostaComexStat {
  data: { list: { year: string; metricFOB: string }[] }
  success: boolean
}

export function montarCorpo(indicador: IndicadorComexStat, selecao: FacetSelection) {
  const anoFinal = new Date().getFullYear()
  const anoInicial = anoFinal - selecao.quantidadePeriodos
  return {
    flow: indicador.fluxo,
    monthDetail: false,
    period: { from: `${anoInicial}-01`, to: `${anoFinal}-12` },
    filters: [],
    details: [],
    metrics: ['metricFOB'],
  }
}

/** Comex Stat exige POST com corpo JSON — não há uma URL `GET` real para exibir na tradução. */
export function montarUrlComexStat(): string {
  return URL_API
}

export async function buscarSerieComexStat(
  indicador: IndicadorComexStat,
  selecao: FacetSelection,
): Promise<SerieResultado[]> {
  const resposta = await fetch(URL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(montarCorpo(indicador, selecao)),
  })
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar a API do Comex Stat (HTTP ${resposta.status}).`)
  }
  const corpo: RespostaComexStat = await resposta.json()
  if (!corpo.success || corpo.data.list.length === 0) {
    throw new Error('A API do Comex Stat não retornou dados para essa combinação de filtros.')
  }

  const pontos = corpo.data.list
    .map((item) => ({ periodo: item.year, valor: Number(item.metricFOB) }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo))

  return [{ localidadeNome: 'Brasil', categoriaLabels: [], pontos }]
}
