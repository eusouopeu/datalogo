import type { SerieResultado } from '../types'

export interface Descritivas {
  n: number
  media: number
  mediana: number
  minimo: number
  maximo: number
  amplitude: number
  desvioPadrao: number
}

function valoresValidos(serie: SerieResultado): number[] {
  return serie.pontos.map((p) => p.valor).filter((v): v is number => v !== null)
}

export function descrever(serie: SerieResultado): Descritivas | null {
  const valores = valoresValidos(serie)
  if (valores.length === 0) return null

  const n = valores.length
  const media = valores.reduce((a, b) => a + b, 0) / n
  const ordenados = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(n / 2)
  const mediana = n % 2 === 0 ? (ordenados[meio - 1] + ordenados[meio]) / 2 : ordenados[meio]
  const minimo = ordenados[0]
  const maximo = ordenados[n - 1]
  const variancia = valores.reduce((acc, v) => acc + (v - media) ** 2, 0) / n
  const desvioPadrao = Math.sqrt(variancia)

  return { n, media, mediana, minimo, maximo, amplitude: maximo - minimo, desvioPadrao }
}

export interface Evolucao {
  primeiroPeriodo: string
  ultimoPeriodo: string
  valorInicial: number
  valorFinal: number
  variacaoAbsoluta: number
  variacaoPercentual: number
}

export function calcularEvolucao(serie: SerieResultado): Evolucao | null {
  const pontos = serie.pontos.filter((p) => p.valor !== null) as { periodo: string; valor: number }[]
  if (pontos.length < 2) return null

  const primeiro = pontos[0]
  const ultimo = pontos[pontos.length - 1]
  const variacaoAbsoluta = ultimo.valor - primeiro.valor
  const variacaoPercentual = primeiro.valor !== 0 ? (variacaoAbsoluta / Math.abs(primeiro.valor)) * 100 : NaN

  return {
    primeiroPeriodo: primeiro.periodo,
    ultimoPeriodo: ultimo.periodo,
    valorInicial: primeiro.valor,
    valorFinal: ultimo.valor,
    variacaoAbsoluta,
    variacaoPercentual,
  }
}

export interface PontoComparacao {
  rotulo: string
  valor: number
}

/** Ordena séries pelo valor mais recente disponível — usado para ranking/comparação. */
export function compararUltimoValor(series: SerieResultado[]): PontoComparacao[] {
  const pontos: PontoComparacao[] = []
  for (const serie of series) {
    const validos = serie.pontos.filter((p) => p.valor !== null)
    if (validos.length === 0) continue
    const ultimo = validos[validos.length - 1]
    const rotulo = [serie.localidadeNome, ...serie.categoriaLabels].filter(Boolean).join(' — ')
    pontos.push({ rotulo, valor: ultimo.valor as number })
  }
  return pontos.sort((a, b) => b.valor - a.valor)
}

export function correlacao(serieA: SerieResultado, serieB: SerieResultado): number | null {
  const mapaB = new Map(serieB.pontos.map((p) => [p.periodo, p.valor]))
  const pares: [number, number][] = []
  for (const pontoA of serieA.pontos) {
    const valorB = mapaB.get(pontoA.periodo)
    if (pontoA.valor !== null && valorB !== null && valorB !== undefined) {
      pares.push([pontoA.valor, valorB])
    }
  }
  if (pares.length < 3) return null

  const n = pares.length
  const mediaX = pares.reduce((a, [x]) => a + x, 0) / n
  const mediaY = pares.reduce((a, [, y]) => a + y, 0) / n
  let cov = 0
  let varX = 0
  let varY = 0
  for (const [x, y] of pares) {
    cov += (x - mediaX) * (y - mediaY)
    varX += (x - mediaX) ** 2
    varY += (y - mediaY) ** 2
  }
  if (varX === 0 || varY === 0) return null
  return cov / Math.sqrt(varX * varY)
}
