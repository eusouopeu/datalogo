import { describe, expect, it } from 'vitest'
import { buscarIndicadores } from '../search'

describe('buscarIndicadores', () => {
  it('encontra o indicador por um sinônimo válido', () => {
    const resultados = buscarIndicadores('desemprego')
    expect(resultados.some((r) => r.indicador.id === 'taxa-desocupacao-idade')).toBe(true)
  })

  it('não retorna resultado quando a maioria dos termos da consulta não casa com nada', () => {
    // só "desemprego" é um termo válido; "xicara" e "marte" não correspondem a nada no
    // catálogo — cobertura de 1/3 (33%) fica abaixo do mínimo exigido (60%).
    const resultados = buscarIndicadores('desemprego xicara marte')
    expect(resultados).toEqual([])
  })
})
