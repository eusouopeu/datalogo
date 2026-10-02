import { beforeEach, describe, expect, it } from 'vitest'
import {
  alternarFixadoHome,
  alternarSalvo,
  estaSalvo,
  idsFixadosHome,
  listarSalvos,
  migrarSalvosAntigos,
  registrarRecente,
} from '../salvos'
import type { FacetSelection } from '../../types'

function instalarLocalStorage(): Map<string, string> {
  const dados = new Map<string, string>()
  const stub = {
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
    removeItem: (k: string) => void dados.delete(k),
    clear: () => dados.clear(),
    key: (i: number) => Array.from(dados.keys())[i] ?? null,
    get length() {
      return dados.size
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: stub, configurable: true })
  return dados
}

const SELECAO: FacetSelection = {
  nivelTerritorial: 'N1',
  codigosTerritoriais: [],
  categorias: {},
  quantidadePeriodos: 8,
}

describe('salvos', () => {
  let dados: Map<string, string>

  beforeEach(() => {
    dados = instalarLocalStorage()
  })

  it('alternarSalvo adiciona com a seleção e remove na segunda chamada', () => {
    alternarSalvo('ipca-variacao-mensal', { ...SELECAO, quantidadePeriodos: 24 })
    const salvos = listarSalvos()
    expect(salvos).toHaveLength(1)
    expect(salvos[0].indicadorId).toBe('ipca-variacao-mensal')
    expect(salvos[0].selecao.quantidadePeriodos).toBe(24)
    expect(estaSalvo('ipca-variacao-mensal')).toBe(true)

    alternarSalvo('ipca-variacao-mensal', { ...SELECAO, quantidadePeriodos: 24 })
    expect(listarSalvos()).toHaveLength(0)
    expect(estaSalvo('ipca-variacao-mensal')).toBe(false)
  })

  it('fixar na home só vale para indicador salvo e alterna', () => {
    alternarSalvo('meta-selic', SELECAO)
    expect(idsFixadosHome()).toEqual([])

    alternarFixadoHome('meta-selic')
    expect(idsFixadosHome()).toEqual(['meta-selic'])

    alternarFixadoHome('meta-selic')
    expect(idsFixadosHome()).toEqual([])

    alternarFixadoHome('nao-salvo')
    expect(idsFixadosHome()).toEqual([])
  })

  it('migra favoritos e painéis antigos para salvos, sem duplicar o mesmo indicador', () => {
    dados.set('datalogo-favoritos', JSON.stringify(['ipca-variacao-mensal', 'meta-selic']))
    dados.set(
      'datalogo-paineis',
      JSON.stringify([
        {
          id: 'p1',
          nome: 'IPCA',
          indicadorId: 'ipca-variacao-mensal',
          selecao: { ...SELECAO, quantidadePeriodos: 36 },
          criadoEm: 1,
        },
      ]),
    )

    migrarSalvosAntigos((id) => ({ ...SELECAO, categorias: { [id]: ['1'] } }))

    const salvos = listarSalvos()
    expect(salvos.map((s) => s.indicadorId).sort()).toEqual(['ipca-variacao-mensal', 'meta-selic'])
    // painel (com seleção própria) vence o favorito simples do mesmo indicador
    expect(salvos.find((s) => s.indicadorId === 'ipca-variacao-mensal')?.selecao.quantidadePeriodos).toBe(36)
    expect(dados.has('datalogo-favoritos')).toBe(false)
    expect(dados.has('datalogo-paineis')).toBe(false)
  })

  it('registrarRecente move pro topo sem repetir', () => {
    registrarRecente('a')
    registrarRecente('b')
    expect(registrarRecente('a')).toEqual(['a', 'b'])
  })
})
