import type { Indicador, SerieResultado } from '../types'

export type Transformacao = 'nenhuma' | 'acumulado12m' | 'mediaMovel3'

export interface OpcaoTransformacao {
  valor: Transformacao
  label: string
}

/**
 * Opções de cálculo válidas para a periodicidade da série. Acumulado em 12 meses só faz
 * sentido em variação mensal; média móvel de 3 períodos, em séries mensais ou diárias.
 * Série trimestral/anual fica só com o valor original (o seletor nem aparece).
 */
export function opcoesTransformacao(periodicidade: Indicador['periodicidade']): OpcaoTransformacao[] {
  const opcoes: OpcaoTransformacao[] = [{ valor: 'nenhuma', label: 'Valor original' }]
  if (periodicidade === 'mensal') {
    opcoes.push({ valor: 'acumulado12m', label: 'Acumulado 12 meses' })
    opcoes.push({ valor: 'mediaMovel3', label: 'Média móvel (3 meses)' })
  } else if (periodicidade === 'diaria') {
    opcoes.push({ valor: 'mediaMovel3', label: 'Média móvel (3 dias)' })
  }
  return opcoes
}

/** Aplica transformação de série temporal, preservando localidade/categoria — só o valor muda. */
export function aplicarTransformacao(serie: SerieResultado, transformacao: Transformacao): SerieResultado {
  if (transformacao === 'nenhuma') return serie
  if (transformacao === 'acumulado12m') return { ...serie, pontos: acumulado12Meses(serie.pontos) }
  return { ...serie, pontos: mediaMovel(serie.pontos, 3) }
}

/** Acumula 12 variações mensais (%) por composição: (1+v1/100)*(1+v2/100)*...-1. */
function acumulado12Meses(pontos: SerieResultado['pontos']): SerieResultado['pontos'] {
  const JANELA = 12
  return pontos.map((p, i) => {
    if (i < JANELA - 1) return { periodo: p.periodo, valor: null }
    const janela = pontos.slice(i - JANELA + 1, i + 1)
    if (janela.some((j) => j.valor === null)) return { periodo: p.periodo, valor: null }
    const fator = janela.reduce((acc, j) => acc * (1 + (j.valor as number) / 100), 1)
    return { periodo: p.periodo, valor: (fator - 1) * 100 }
  })
}

function mediaMovel(pontos: SerieResultado['pontos'], janelaTamanho: number): SerieResultado['pontos'] {
  return pontos.map((p, i) => {
    if (i < janelaTamanho - 1) return { periodo: p.periodo, valor: null }
    const janela = pontos.slice(i - janelaTamanho + 1, i + 1)
    if (janela.some((j) => j.valor === null)) return { periodo: p.periodo, valor: null }
    const media = janela.reduce((acc, j) => acc + (j.valor as number), 0) / janelaTamanho
    return { periodo: p.periodo, valor: media }
  })
}
