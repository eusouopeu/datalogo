import { describe, expect, it } from 'vitest'
import { eventosNoIntervalo } from '../eventos'

describe('eventosNoIntervalo', () => {
  it('ancora o evento no mês certo em série mensal', () => {
    const periodos = ['202001', '202002', '202003', '202004']
    const pandemia = eventosNoIntervalo(periodos, 'mensal').find((e) => e.label.includes('covid'))
    expect(pandemia?.periodo).toBe('202003')
  })

  it('ancora no ano correspondente em série anual', () => {
    const eventos = eventosNoIntervalo(['2019', '2020', '2021'], 'anual')
    expect(eventos.find((e) => e.label.includes('covid'))?.periodo).toBe('2020')
  })

  it('ancora no trimestre certo em série trimestral', () => {
    const eventos = eventosNoIntervalo(['202001', '202002', '202003'], 'trimestral')
    expect(eventos.find((e) => e.label.includes('covid'))?.periodo).toBe('202001')
  })

  it('retorna lista vazia quando nenhum evento está no intervalo', () => {
    expect(eventosNoIntervalo(['1900', '1901'])).toEqual([])
    expect(eventosNoIntervalo([])).toEqual([])
  })
})
