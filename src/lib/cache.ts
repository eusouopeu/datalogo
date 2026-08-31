export interface CacheEntry<T> {
  valor: T
  timestamp: number
}

const PREFIXO = 'datalogo-cache:'
const memoria = new Map<string, string>()

function storage(): Pick<Storage, 'getItem' | 'setItem'> | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
  } catch {
    // localStorage indisponível (ex: SSR, contexto restrito) — cai no fallback em memória.
  }
  return null
}

export function gravarCache<T>(chave: string, valor: T): void {
  const entry: CacheEntry<T> = { valor, timestamp: Date.now() }
  const serializado = JSON.stringify(entry)
  const s = storage()
  if (s) s.setItem(PREFIXO + chave, serializado)
  else memoria.set(PREFIXO + chave, serializado)
}

export function lerCache<T>(chave: string): CacheEntry<T> | null {
  const s = storage()
  const bruto = s ? s.getItem(PREFIXO + chave) : (memoria.get(PREFIXO + chave) ?? null)
  if (!bruto) return null
  try {
    return JSON.parse(bruto) as CacheEntry<T>
  } catch {
    return null
  }
}

export function estaExpirado(entry: Pick<CacheEntry<unknown>, 'timestamp'>, ttlMs: number): boolean {
  return Date.now() - entry.timestamp > ttlMs
}

/** TTL sugerido por periodicidade do indicador — dados diários revalidam mais rápido. */
export function ttlPorPeriodicidade(periodicidade: 'diaria' | 'mensal' | 'trimestral' | 'anual'): number {
  const HORA = 60 * 60 * 1000
  switch (periodicidade) {
    case 'diaria':
      return 6 * HORA
    case 'mensal':
      return 24 * HORA
    case 'trimestral':
      return 3 * 24 * HORA
    case 'anual':
      return 7 * 24 * HORA
  }
}
