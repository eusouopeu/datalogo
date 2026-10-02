import { beforeEach, describe, expect, it } from 'vitest'
import { marcarVisto, registrarUltimoPeriodo, temNovidade } from '../novidades'

function instalarLocalStorage(): void {
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
}

describe('novidades', () => {
  beforeEach(instalarLocalStorage)

  it('primeiro registro não marca novidade (nada para comparar)', () => {
    registrarUltimoPeriodo('ipca', '202608')
    expect(temNovidade('ipca')).toBe(false)
  })

  it('marca novidade quando chega período posterior ao último visto', () => {
    registrarUltimoPeriodo('ipca', '202608')
    registrarUltimoPeriodo('ipca', '202609')
    expect(temNovidade('ipca')).toBe(true)

    marcarVisto('ipca')
    expect(temNovidade('ipca')).toBe(false)
  })

  it('período repetido ou anterior não marca novidade', () => {
    registrarUltimoPeriodo('selic', '2026-09-30')
    registrarUltimoPeriodo('selic', '2026-09-30')
    registrarUltimoPeriodo('selic', '2026-08-30')
    expect(temNovidade('selic')).toBe(false)
  })
})
