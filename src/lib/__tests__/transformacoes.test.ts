import { describe, expect, it } from 'vitest'
import { aplicarTransformacao } from '../transformacoes'
import type { SerieResultado } from '../../types'

function serieDe(valores: number[]): SerieResultado {
  return {
    localidadeNome: 'Brasil',
    categoriaLabels: [],
    pontos: valores.map((valor, i) => ({ periodo: `2024${String(i + 1).padStart(2, '0')}`, valor })),
  }
}

describe('transformacoes', () => {
  it('mediaMovel(3) fica null antes da janela preencher e calcula a média depois', () => {
    const serie = serieDe([1, 2, 3, 6])
    const resultado = aplicarTransformacao(serie, 'mediaMovel3')
    expect(resultado.pontos[0].valor).toBeNull()
    expect(resultado.pontos[1].valor).toBeNull()
    expect(resultado.pontos[2].valor).toBeCloseTo(2) // (1+2+3)/3
    expect(resultado.pontos[3].valor).toBeCloseTo(11 / 3) // (2+3+6)/3
  })

  it('acumulado12m fica null enquanto não há 12 pontos', () => {
    const serie = serieDe(Array(11).fill(0.5))
    const resultado = aplicarTransformacao(serie, 'acumulado12m')
    expect(resultado.pontos.every((p) => p.valor === null)).toBe(true)
  })

  it('acumulado12m compõe 12 variações mensais de 1% em ~12.68%', () => {
    const serie = serieDe(Array(12).fill(1))
    const resultado = aplicarTransformacao(serie, 'acumulado12m')
    expect(resultado.pontos[11].valor).toBeCloseTo((Math.pow(1.01, 12) - 1) * 100, 4)
  })
})
