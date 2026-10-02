/**
 * Marca indicadores que ganharam período novo desde a última vez que o usuário os abriu.
 * Comparação por string: todos os formatos de período das APIs são ordenáveis
 * lexicograficamente (`202608`, `2026-08-01`, `2026`).
 */
const CHAVE = 'datalogo-novidades'

interface Registro {
  /** último período já visto pelo usuário */
  visto: string
  /** último período que a API devolveu */
  atual: string
}

function ler(): Record<string, Registro> {
  try {
    const bruto = localStorage.getItem(CHAVE)
    return bruto ? (JSON.parse(bruto) as Record<string, Registro>) : {}
  } catch {
    return {}
  }
}

function gravar(registros: Record<string, Registro>): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(registros))
  } catch {
    // sem localStorage: o aviso de dado novo simplesmente não aparece.
  }
}

/**
 * Registra o período mais recente devolvido pela API. No primeiro registro de um indicador,
 * já considera visto — o aviso só existe para dado que chegou depois do usuário conhecer a série.
 */
export function registrarUltimoPeriodo(indicadorId: string, periodo: string): void {
  const registros = ler()
  const anterior = registros[indicadorId]
  if (!anterior) {
    registros[indicadorId] = { visto: periodo, atual: periodo }
  } else if (periodo > anterior.atual) {
    registros[indicadorId] = { visto: anterior.visto, atual: periodo }
  } else {
    return
  }
  gravar(registros)
}

export function temNovidade(indicadorId: string): boolean {
  const registro = ler()[indicadorId]
  return registro ? registro.atual > registro.visto : false
}

/** Zera o aviso: o usuário abriu o indicador e viu o dado novo. */
export function marcarVisto(indicadorId: string): void {
  const registros = ler()
  const registro = registros[indicadorId]
  if (!registro) return
  registros[indicadorId] = { visto: registro.atual, atual: registro.atual }
  gravar(registros)
}

/** Período mais recente conhecido, para exibir junto do aviso. */
export function ultimoPeriodoConhecido(indicadorId: string): string | null {
  return ler()[indicadorId]?.atual ?? null
}
