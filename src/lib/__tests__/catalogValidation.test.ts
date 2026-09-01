import { describe, expect, it } from 'vitest'
import { validarCatalogo } from '../catalogValidation'
import type { Indicador } from '../../types'

function baseIndicador(overrides: Partial<Indicador> = {}): Indicador {
  return {
    id: 'ind-teste',
    origem: 'BCB',
    serieBcb: 1,
    fonte: 'BCB',
    pesquisa: 'Teste',
    nome: 'Indicador teste',
    descricao: 'Descrição teste',
    tema: ['Economia'],
    sinonimos: ['teste'],
    unidade: '%',
    periodicidade: 'mensal',
    niveisTerritoriais: [{ nivel: 'N1', label: 'Brasil', requerSelecao: false }],
    classificacoes: [],
    fonteUrl: 'https://bcb.gov.br',
    ...overrides,
  } as Indicador
}

describe('validarCatalogo', () => {
  it('não reporta problema para catálogo bem formado', () => {
    expect(validarCatalogo([baseIndicador()])).toEqual([])
  })

  it('detecta id duplicado', () => {
    const problemas = validarCatalogo([baseIndicador(), baseIndicador()])
    expect(problemas.some((p) => p.includes('duplicado'))).toBe(true)
  })

  it('detecta indicador sem sinônimos e sem níveis territoriais', () => {
    const problemas = validarCatalogo([baseIndicador({ sinonimos: [], niveisTerritoriais: [] })])
    expect(problemas.some((p) => p.includes('sinônimo'))).toBe(true)
    expect(problemas.some((p) => p.includes('nível territorial'))).toBe(true)
  })
})
