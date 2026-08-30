import type { IndicadorBcb, FacetSelection, SerieResultado } from '../types'

/** Monta a URL real da API de Séries Temporais do Banco Central (SGS). */
export function montarUrlBcb(indicador: IndicadorBcb, selecao: FacetSelection): string {
  return `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${indicador.serieBcb}/dados/ultimos/${selecao.quantidadePeriodos}?formato=json`
}

interface PontoBcb {
  data: string
  valor: string
}

/** Converte "dd/MM/yyyy" (formato do BCB) para "yyyy-MM-dd", ordenável como string. */
function paraIso(dataBr: string): string {
  const [dia, mes, ano] = dataBr.split('/')
  return `${ano}-${mes}-${dia}`
}

export async function buscarSerieBcb(
  indicador: IndicadorBcb,
  selecao: FacetSelection,
): Promise<SerieResultado[]> {
  const url = montarUrlBcb(indicador, selecao)
  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar a API do Banco Central (HTTP ${resposta.status}).`)
  }
  const dados: PontoBcb[] = await resposta.json()
  if (!Array.isArray(dados) || dados.length === 0) {
    throw new Error('A API do Banco Central não retornou dados para essa combinação de filtros.')
  }

  const pontos = dados
    .map((p) => ({ periodo: paraIso(p.data), valor: p.valor === '' ? null : Number(p.valor) }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo))

  return [{ localidadeNome: 'Brasil', categoriaLabels: [], pontos }]
}
