import { describe, expect, it } from 'vitest'
import { eventosNoIntervalo } from '../eventos'

describe('eventosNoIntervalo', () => {
  it('retorna só eventos cujo ano aparece nos períodos exibidos', () => {
    const periodos = ['2019-01-01', '2020-01-01', '2021-01-01']
    const eventos = eventosNoIntervalo(periodos)
    expect(eventos.every((e) => periodos.some((p) => p.startsWith(e.ano)))).toBe(true)
    expect(eventos.some((e) => e.ano === '2020')).toBe(true)
  })

  it('retorna lista vazia quando nenhum ano de evento está no intervalo', () => {
    expect(eventosNoIntervalo(['1900', '1901'])).toEqual([])
  })
})
