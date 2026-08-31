import type { FacetSelection, IndicadorIbge, SerieResultado } from '../types'

/** Monta a URL real da API de Agregados do IBGE (SIDRA) a partir da seleção do usuário. */
export function montarUrl(indicador: IndicadorIbge, selecao: FacetSelection): string {
  const base = `https://servicodados.ibge.gov.br/api/v3/agregados/${indicador.agregado}`
  const periodos = `periodos/-${selecao.quantidadePeriodos}`
  const variaveis = `variaveis/${indicador.variavel}`

  const localidade =
    selecao.nivelTerritorial === 'N1'
      ? 'N1[all]'
      : `${selecao.nivelTerritorial}[${selecao.codigosTerritoriais.join(',')}]`

  const params = new URLSearchParams()
  params.set('localidades', localidade)

  const classificacaoPartes = indicador.classificacoes
    .map((c) => {
      const categoriaIds = selecao.categorias[c.id]
      return categoriaIds && categoriaIds.length > 0 ? `${c.id}[${categoriaIds.join(',')}]` : null
    })
    .filter(Boolean)
  if (classificacaoPartes.length > 0) {
    params.set('classificacao', classificacaoPartes.join('|'))
  }

  return `${base}/${periodos}/${variaveis}?${params.toString()}`
}

interface RespostaSidra {
  id: string
  variavel: string
  unidade: string
  resultados: {
    classificacoes: { id: string; nome: string; categoria: Record<string, string> }[]
    series: {
      localidade: { id: string; nivel: { id: string; nome: string }; nome: string }
      serie: Record<string, string>
    }[]
  }[]
}

export async function buscarSerie(
  indicador: IndicadorIbge,
  selecao: FacetSelection,
): Promise<SerieResultado[]> {
  const url = montarUrl(indicador, selecao)
  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar a API do IBGE (HTTP ${resposta.status}).`)
  }
  const dados: RespostaSidra[] = await resposta.json()
  if (!Array.isArray(dados) || dados.length === 0) {
    throw new Error('A API do IBGE não retornou dados para essa combinação de filtros.')
  }

  const resultados: SerieResultado[] = []
  for (const item of dados) {
    for (const resultado of item.resultados) {
      const categoriaLabels = resultado.classificacoes.map(
        (c) => Object.values(c.categoria)[0] ?? '',
      )
      for (const serieItem of resultado.series) {
        const pontos = Object.entries(serieItem.serie)
          .map(([periodo, valorStr]) => ({
            periodo,
            valor: valorStr === '...' || valorStr === '-' ? null : Number(valorStr),
          }))
          .sort((a, b) => a.periodo.localeCompare(b.periodo))
        resultados.push({
          localidadeNome: serieItem.localidade.nome,
          categoriaLabels,
          pontos,
        })
      }
    }
  }
  return resultados
}
