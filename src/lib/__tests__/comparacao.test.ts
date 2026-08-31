import { describe, expect, it } from 'vitest'
import { alinharPorPeriodo, normalizarBase100 } from '../comparacao'
import type { SerieResultado } from '../../types'

const serieA: SerieResultado = {
  localidadeNome: 'Brasil',
  categoriaLabels: [],
  pontos: [
    { periodo: '2021', valor: 10 },
    { periodo: '2022', valor: 20 },
    { periodo: '2023', valor: 40 },
  ],
}

const serieB: SerieResultado = {
  localidadeNome: 'Brasil',
  categoriaLabels: [],
  pontos: [
    { periodo: '2022', valor: 5 },
    { periodo: '2023', valor: 5 },
  ],
}

describe('alinharPorPeriodo', () => {
  it('une pelos períodos em comum, preenchendo com null onde uma série não tem dado', () => {
    const alinhado = alinharPorPeriodo(serieA, serieB)
    expect(alinhado).toEqual([
      { periodo: '2021', a: 10, b: null },
      { periodo: '2022', a: 20, b: 5 },
      { periodo: '2023', a: 40, b: 5 },
    ])
  })
})

describe('normalizarBase100', () => {
  it('escala a série para que o primeiro valor não-nulo vire 100', () => {
    const resultado = normalizarBase100(serieA.pontos)
    expect(resultado.map((p) => p.valor)).toEqual([100, 200, 400])
  })

  it('ignora valores nulos no início ao escolher a base', () => {
    const pontos = [
      { periodo: '2020', valor: null },
      { periodo: '2021', valor: 10 },
      { periodo: '2022', valor: 15 },
    ]
    const resultado = normalizarBase100(pontos)
    expect(resultado.map((p) => p.valor)).toEqual([null, 100, 150])
  })
})
