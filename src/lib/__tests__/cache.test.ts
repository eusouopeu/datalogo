import { describe, expect, it } from 'vitest'
import { estaExpirado, gravarCache, lerCache } from '../cache'

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
})
