import type { CacheEntry } from './cache'

/**
 * Armazenamento offline explícito: separado do cache SWR (`cache.ts`), nunca purgado
 * automaticamente. Só existe quando o usuário pede ("salvar para uso offline").
 */
const PREFIXO = 'datalogo-offline:'

function storage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'> | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
  } catch {
    // localStorage indisponível — sem fallback em memória: offline sem persistência não faz sentido.
  }
  return null
}

export function salvarOffline<T>(chave: string, valor: T): void {
  const s = storage()
  if (!s) return
  const entry: CacheEntry<T> = { valor, timestamp: Date.now() }
  try {
    s.setItem(PREFIXO + chave, JSON.stringify(entry))
  } catch {
    // quota do localStorage estourada: série não fica disponível offline.
  }
}

export function lerOffline<T>(chave: string): CacheEntry<T> | null {
  const s = storage()
  const bruto = s?.getItem(PREFIXO + chave) ?? null
  if (!bruto) return null
  try {
    return JSON.parse(bruto) as CacheEntry<T>
  } catch {
    return null
  }
}

export function removerOffline(chave: string): void {
  storage()?.removeItem(PREFIXO + chave)
}

export function listarChavesOffline(): string[] {
  const s = storage()
  if (!s) return []
  const chaves: string[] = []
  for (let i = 0; i < s.length; i++) {
    const chave = s.key(i)
    if (chave?.startsWith(PREFIXO)) chaves.push(chave.slice(PREFIXO.length))
  }
  return chaves
}
