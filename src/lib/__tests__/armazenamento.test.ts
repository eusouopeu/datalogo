import { beforeEach, describe, expect, it } from 'vitest'
import {
  estaExpirado,
  estaFixado,
  fixar,
  gravar,
  ler,
  limparNaoFixados,
  listarChavesFixadas,
  migrarArmazenamentoAntigo,
  purgarExpirado,
  removerFixado,
  tamanhoArmazenamentoBytes,
} from '../armazenamento'

/** Ambiente de teste roda em Node (sem DOM): stub de localStorage compartilhado pelos testes. */
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

describe('armazenamento', () => {
  let dados: Map<string, string>

  beforeEach(() => {
    dados = instalarLocalStorage()
  })

  it('grava e lê o mesmo valor', () => {
    gravar('serie:x', { a: 1 })
    expect(ler<{ a: number }>('serie:x')?.valor).toEqual({ a: 1 })
    expect(ler('serie:nunca-gravada')).toBeNull()
  })

  it('entrada fixada sobrevive à purga e à limpeza de cache; não fixada não', () => {
    gravar('serie:fixa', [1])
    gravar('serie:solta', [2])
    fixar('serie:fixa')

    // timestamps bem antigos para cair na purga por idade
    for (const chave of Array.from(dados.keys())) {
      const entry = JSON.parse(dados.get(chave)!)
      dados.set(chave, JSON.stringify({ ...entry, timestamp: 0 }))
    }

    purgarExpirado(1000)
    expect(ler('serie:fixa')).not.toBeNull()
    expect(ler('serie:solta')).toBeNull()

    gravar('serie:outra', [3])
    limparNaoFixados()
    expect(ler('serie:fixa')).not.toBeNull()
    expect(ler('serie:outra')).toBeNull()

    expect(estaFixado('serie:fixa')).toBe(true)
    expect(listarChavesFixadas()).toEqual(['serie:fixa'])

    removerFixado('serie:fixa')
    expect(ler('serie:fixa')).toBeNull()
  })

  it('fixar preserva o valor já gravado e gravar preserva o estado fixado', () => {
    gravar('serie:y', { v: 10 })
    fixar('serie:y')
    gravar('serie:y', { v: 11 })
    expect(estaFixado('serie:y')).toBe(true)
    expect(ler<{ v: number }>('serie:y')?.valor).toEqual({ v: 11 })
  })

  it('migra chaves dos formatos antigos (cache e offline) preservando o que era offline como fixado', () => {
    dados.set('datalogo-cache:serie:antiga', JSON.stringify({ valor: [1], timestamp: 123 }))
    dados.set('datalogo-offline:serie:salva', JSON.stringify({ valor: [2], timestamp: 456 }))

    migrarArmazenamentoAntigo()

    expect(ler<number[]>('serie:antiga')?.valor).toEqual([1])
    expect(estaFixado('serie:antiga')).toBe(false)
    expect(ler<number[]>('serie:salva')?.valor).toEqual([2])
    expect(estaFixado('serie:salva')).toBe(true)
    expect(dados.has('datalogo-cache:serie:antiga')).toBe(false)
    expect(dados.has('datalogo-offline:serie:salva')).toBe(false)
  })

  it('estaExpirado respeita o TTL e tamanhoArmazenamentoBytes cresce com o conteúdo', () => {
    const agora = Date.now()
    expect(estaExpirado({ timestamp: agora - 1000 }, 10_000)).toBe(false)
    expect(estaExpirado({ timestamp: agora - 100_000 }, 10_000)).toBe(true)

    const vazio = tamanhoArmazenamentoBytes()
    gravar('serie:grande', 'x'.repeat(500))
    expect(tamanhoArmazenamentoBytes()).toBeGreaterThan(vazio + 400)
  })
})
