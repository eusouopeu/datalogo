/**
 * Armazenamento local único do app: cache SWR e "salvo para uso offline" são o mesmo
 * mecanismo, diferenciados pela flag `fixado`. Entrada fixada nunca é purgada por idade
 * nem apagada ao limpar o cache; entrada não fixada é descartável a qualquer momento.
 */
export interface Entrada<T> {
  valor: T
  timestamp: number
  fixado?: boolean
}

const PREFIXO = 'datalogo-dados:'
const PREFIXO_CACHE_ANTIGO = 'datalogo-cache:'
const PREFIXO_OFFLINE_ANTIGO = 'datalogo-offline:'

/** Fallback em memória quando localStorage está indisponível ou com quota estourada. */
const memoria = new Map<string, string>()

function storage(): Storage | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
  } catch {
    // contexto restrito (ex: SSR, cookies bloqueados): cai no fallback em memória.
  }
  return null
}

function lerBruto(chaveCompleta: string): string | null {
  const s = storage()
  return (s ? s.getItem(chaveCompleta) : null) ?? memoria.get(chaveCompleta) ?? null
}

function gravarBruto(chaveCompleta: string, serializado: string): void {
  const s = storage()
  try {
    if (s) {
      s.setItem(chaveCompleta, serializado)
      return
    }
  } catch {
    // quota estourada: mantém só nesta sessão, em memória.
  }
  memoria.set(chaveCompleta, serializado)
}

function chavesCompletas(prefixo = PREFIXO): string[] {
  const s = storage()
  const chaves: string[] = []
  if (s) {
    for (let i = 0; i < s.length; i++) {
      const chave = s.key(i)
      if (chave?.startsWith(prefixo)) chaves.push(chave)
    }
  }
  for (const chave of memoria.keys()) {
    if (chave.startsWith(prefixo) && !chaves.includes(chave)) chaves.push(chave)
  }
  return chaves
}

function remover(chaveCompleta: string): void {
  storage()?.removeItem(chaveCompleta)
  memoria.delete(chaveCompleta)
}

export function ler<T>(chave: string): Entrada<T> | null {
  const bruto = lerBruto(PREFIXO + chave)
  if (!bruto) return null
  try {
    return JSON.parse(bruto) as Entrada<T>
  } catch {
    return null
  }
}

/** Grava o valor renovando o timestamp e preservando o estado fixado da entrada. */
export function gravar<T>(chave: string, valor: T): void {
  const fixado = ler(chave)?.fixado === true
  const entrada: Entrada<T> = { valor, timestamp: Date.now(), ...(fixado ? { fixado: true } : {}) }
  gravarBruto(PREFIXO + chave, JSON.stringify(entrada))
}

export function estaFixado(chave: string): boolean {
  return ler(chave)?.fixado === true
}

/** Marca a entrada como fixada (uso offline explícito). Sem entrada gravada, não faz nada. */
export function fixar(chave: string): void {
  const entrada = ler(chave)
  if (!entrada) return
  gravarBruto(PREFIXO + chave, JSON.stringify({ ...entrada, fixado: true }))
}

/** Remove a entrada fixada por completo (o usuário pediu para não guardar mais). */
export function removerFixado(chave: string): void {
  remover(PREFIXO + chave)
}

export function listarChavesFixadas(): string[] {
  return chavesCompletas()
    .filter((c) => {
      try {
        return (JSON.parse(lerBruto(c) ?? '') as Entrada<unknown>).fixado === true
      } catch {
        return false
      }
    })
    .map((c) => c.slice(PREFIXO.length))
}

/** Remove entradas não fixadas com mais de `idadeMaximaMs`, liberando espaço na inicialização. */
export function purgarExpirado(idadeMaximaMs: number): void {
  const agora = Date.now()
  for (const chave of chavesCompletas()) {
    try {
      const entrada = JSON.parse(lerBruto(chave) ?? '') as Entrada<unknown>
      if (entrada.fixado) continue
      if (agora - entrada.timestamp > idadeMaximaMs) remover(chave)
    } catch {
      remover(chave) // entrada corrompida
    }
  }
}

/** Limpa todo o cache descartável, mantendo o que o usuário fixou para uso offline. */
export function limparNaoFixados(): void {
  for (const chave of chavesCompletas()) {
    try {
      if ((JSON.parse(lerBruto(chave) ?? '') as Entrada<unknown>).fixado) continue
    } catch {
      // corrompida: remove também
    }
    remover(chave)
  }
}

/** Bytes aproximados ocupados pelo app (chave + valor, 2 bytes por caractere UTF-16). */
export function tamanhoArmazenamentoBytes(): number {
  return chavesCompletas().reduce((total, chave) => total + (chave.length + (lerBruto(chave)?.length ?? 0)) * 2, 0)
}

export function estaExpirado(entrada: Pick<Entrada<unknown>, 'timestamp'>, ttlMs: number): boolean {
  return Date.now() - entrada.timestamp > ttlMs
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

/**
 * Converte as chaves dos dois mecanismos antigos (`datalogo-cache:` e `datalogo-offline:`)
 * para o formato único. O que estava em offline vira entrada fixada.
 */
export function migrarArmazenamentoAntigo(): void {
  for (const [prefixo, fixado] of [
    [PREFIXO_CACHE_ANTIGO, false],
    [PREFIXO_OFFLINE_ANTIGO, true],
  ] as const) {
    for (const chaveCompleta of chavesCompletas(prefixo)) {
      const bruto = lerBruto(chaveCompleta)
      remover(chaveCompleta)
      if (!bruto) continue
      try {
        const antiga = JSON.parse(bruto) as Entrada<unknown>
        const chave = chaveCompleta.slice(prefixo.length)
        const jaFixado = fixado || estaFixado(chave)
        gravarBruto(
          PREFIXO + chave,
          JSON.stringify({ valor: antiga.valor, timestamp: antiga.timestamp, ...(jaFixado ? { fixado: true } : {}) }),
        )
      } catch {
        // entrada antiga corrompida: já removida acima
      }
    }
  }
}
