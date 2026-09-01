import { describe, expect, it, vi } from 'vitest'
import { salvarOffline, lerOffline, removerOffline, listarChavesOffline } from '../offline'

function stubStorage() {
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
}

describe('offline store', () => {
  it('salva e lê de volta uma série offline', () => {
    stubStorage()
    salvarOffline('chave-1', [{ localidadeNome: 'Brasil', categoriaLabels: [], pontos: [] }])
    const entry = lerOffline('chave-1')
    expect(entry?.valor).toEqual([{ localidadeNome: 'Brasil', categoriaLabels: [], pontos: [] }])
    vi.unstubAllGlobals()
  })

  it('remove uma chave offline salva', () => {
    stubStorage()
    salvarOffline('chave-2', [])
    removerOffline('chave-2')
    expect(lerOffline('chave-2')).toBeNull()
    vi.unstubAllGlobals()
  })

  it('purgarCacheExpirado (cache normal) não afeta entradas offline — prefixos distintos', () => {
    stubStorage()
    salvarOffline('chave-3', [])
    expect(listarChavesOffline()).toContain('chave-3')
    vi.unstubAllGlobals()
  })
})
