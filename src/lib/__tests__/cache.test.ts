import { describe, expect, it, vi } from 'vitest'
import { estaExpirado, gravarCache, lerCache, purgarCacheExpirado } from '../cache'

describe('cache', () => {
  it('grava e lê de volta o mesmo valor', () => {
    gravarCache('chave-teste', { a: 1 })
    const entry = lerCache<{ a: number }>('chave-teste')
    expect(entry?.valor).toEqual({ a: 1 })
  })

  it('retorna null para chave inexistente', () => {
    expect(lerCache('chave-nunca-gravada')).toBeNull()
  })

  it('considera expirado apenas quando passou do TTL', () => {
    const agora = Date.now()
    const recente = { valor: 1, timestamp: agora - 1000 }
    const antigo = { valor: 1, timestamp: agora - 100_000 }
    expect(estaExpirado(recente, 10_000)).toBe(false)
    expect(estaExpirado(antigo, 10_000)).toBe(true)
  })

  it('purgarCacheExpirado remove só as entradas mais velhas que a idade máxima', () => {
    // Ambiente de teste roda em Node (sem DOM): stub mínimo de localStorage só para este teste.
    const dados = new Map<string, string>()
    const stub: Storage = {
      getItem: (k) => dados.get(k) ?? null,
      setItem: (k, v) => void dados.set(k, v),
      removeItem: (k) => void dados.delete(k),
      clear: () => dados.clear(),
      key: (i) => Array.from(dados.keys())[i] ?? null,
      get length() {
        return dados.size
      },
    }
    vi.stubGlobal('localStorage', stub)

    gravarCache('recente', 'a')
    localStorage.setItem(
      'datalogo-cache:antiga',
      JSON.stringify({ valor: 'b', timestamp: Date.now() - 1_000_000 }),
    )
    purgarCacheExpirado(10_000)
    expect(lerCache('recente')).not.toBeNull()
    expect(lerCache('antiga')).toBeNull()

    vi.unstubAllGlobals()
  })
})
