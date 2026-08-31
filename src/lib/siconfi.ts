import type { FacetSelection, IndicadorSiconfi, SerieResultado } from '../types'

interface ItemDca {
  exercicio: number
  instituicao: string
  cod_conta: string
  coluna: string
  valor: number
}

const BASE = 'https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca'

/** A Declaração de Contas Anuais (DCA) do exercício corrente só fica disponível no ano seguinte. */
function anoFinalPadrao(): number {
  return new Date().getFullYear() - 1
}

function anosDaSelecao(selecao: FacetSelection): number[] {
  const anoFinal = anoFinalPadrao()
  const anoInicial = anoFinal - selecao.quantidadePeriodos + 1
  return Array.from({ length: selecao.quantidadePeriodos }, (_, i) => anoInicial + i)
}

function montarUrlAno(indicador: IndicadorSiconfi, ente: string, ano: number): string {
  const params = new URLSearchParams({
    an_exercicio: String(ano),
    id_ente: ente,
    co_tipo_demonstrativo: 'DCA',
    no_anexo: indicador.anexo,
  })
  return `${BASE}?${params.toString()}`
}

/** URL de exemplo (primeiro ente/ano da seleção) para exibir na tradução da consulta. */
export function montarUrlSiconfi(indicador: IndicadorSiconfi, selecao: FacetSelection): string {
  const ente = selecao.codigosTerritoriais[0] ?? '{codigo-ibge-do-ente}'
  const [primeiroAno] = anosDaSelecao(selecao)
  return montarUrlAno(indicador, ente, primeiroAno ?? anoFinalPadrao())
}

/** Extrai o valor de uma linha específica do anexo DCA pelo par (cod_conta, coluna). */
export function extrairValor(
  itens: Pick<ItemDca, 'cod_conta' | 'coluna' | 'valor'>[],
  codConta: string,
  coluna: string,
): number | null {
  const item = itens.find((i) => i.cod_conta === codConta && i.coluna === coluna)
  return item ? item.valor : null
}

export async function buscarSerieSiconfi(
  indicador: IndicadorSiconfi,
  selecao: FacetSelection,
): Promise<SerieResultado[]> {
  const entes = selecao.codigosTerritoriais
  if (entes.length === 0) {
    throw new Error('Selecione ao menos uma UF ou município.')
  }
  const anos = anosDaSelecao(selecao)

  const resultados: SerieResultado[] = []
  for (const ente of entes) {
    const pontos = await Promise.all(
      anos.map(async (ano) => {
        const resposta = await fetch(montarUrlAno(indicador, ente, ano))
        if (!resposta.ok) return { periodo: String(ano), valor: null as number | null, instituicao: null as string | null }
        const corpo: { items: ItemDca[] } = await resposta.json()
        const valor = extrairValor(corpo.items, indicador.codConta, indicador.coluna)
        return { periodo: String(ano), valor, instituicao: corpo.items[0]?.instituicao ?? null }
      }),
    )
    const instituicao = pontos.find((p) => p.instituicao)?.instituicao ?? ente
    resultados.push({
      localidadeNome: instituicao,
      categoriaLabels: [],
      pontos: pontos
        .map(({ periodo, valor }) => ({ periodo, valor }))
        .sort((a, b) => a.periodo.localeCompare(b.periodo)),
    })
  }

  if (resultados.every((r) => r.pontos.every((p) => p.valor === null))) {
    throw new Error('A API do SICONFI não retornou dados para essa combinação de filtros.')
  }
  return resultados
}
