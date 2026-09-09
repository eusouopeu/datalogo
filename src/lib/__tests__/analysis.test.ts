import { describe, expect, it } from 'vitest'
import { correlacao } from '../analysis'
import type { SerieResultado } from '../../types'

describe('correlacao', () => {
  it('retorna próximo de 1 para séries que crescem juntas na mesma proporção', () => {
    const serieA: SerieResultado = {
      localidadeNome: 'Brasil',
      categoriaLabels: [],
      pontos: [
        { periodo: '2021', valor: 1 },
        { periodo: '2022', valor: 2 },
        { periodo: '2023', valor: 3 },
        { periodo: '2024', valor: 4 },
      ],
    }
    const serieB: SerieResultado = {
      localidadeNome: 'Brasil',
      categoriaLabels: [],
      pontos: [
        { periodo: '2021', valor: 10 },
        { periodo: '2022', valor: 20 },
        { periodo: '2023', valor: 30 },
        { periodo: '2024', valor: 40 },
      ],
    }
    expect(correlacao(serieA, serieB)).toBeCloseTo(1, 5)
  })

  it('retorna null quando há menos de 3 períodos em comum', () => {
    const serieA: SerieResultado = {
      localidadeNome: 'Brasil',
      categoriaLabels: [],
      pontos: [
        { periodo: '2021', valor: 1 },
        { periodo: '2022', valor: 2 },
      ],
    }
    const serieB: SerieResultado = {
      localidadeNome: 'Brasil',
      categoriaLabels: [],
      pontos: [
        { periodo: '2021', valor: 10 },
        { periodo: '2022', valor: 20 },
      ],
    }
    expect(correlacao(serieA, serieB)).toBeNull()
  })
})
