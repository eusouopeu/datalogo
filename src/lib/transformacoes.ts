import type { SerieResultado } from '../types'

export type Transformacao = 'nenhuma' | 'acumulado12m' | 'mediaMovel3'

export const OPCOES_TRANSFORMACAO: { valor: Transformacao; label: string }[] = [
  { valor: 'nenhuma', label: 'Valor mensal' },
  { valor: 'acumulado12m', label: 'Acumulado 12 meses' },
  { valor: 'mediaMovel3', label: 'Média móvel (3m)' },
]

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
