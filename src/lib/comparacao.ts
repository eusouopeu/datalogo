import type { SerieResultado } from '../types'

export interface PontoComparado {
  periodo: string
  a: number | null
  b: number | null
}

/** Une duas séries pela união dos períodos (ordenada), preenchendo com null onde falta dado. */
export function alinharPorPeriodo(serieA: SerieResultado, serieB: SerieResultado): PontoComparado[] {
  const mapaA = new Map(serieA.pontos.map((p) => [p.periodo, p.valor]))
  const mapaB = new Map(serieB.pontos.map((p) => [p.periodo, p.valor]))
  const periodos = Array.from(new Set([...mapaA.keys(), ...mapaB.keys()])).sort()

  return periodos.map((periodo) => ({
    periodo,
    a: mapaA.get(periodo) ?? null,
    b: mapaB.get(periodo) ?? null,
  }))
}

/**
 * Reescala uma série para base 100 no primeiro valor não-nulo, permitindo comparar
 * indicadores com unidades diferentes (ex: % vs pessoas) num mesmo eixo.
 */
export function normalizarBase100<T extends { periodo: string; valor: number | null }>(
  pontos: T[],
): { periodo: string; valor: number | null }[] {
  const base = pontos.find((p) => p.valor !== null && p.valor !== 0)?.valor
  if (base == null) return pontos.map((p) => ({ periodo: p.periodo, valor: null }))
  return pontos.map((p) => ({
    periodo: p.periodo,
    valor: p.valor === null ? null : (p.valor / base) * 100,
  }))
}
