import type { FacetSelection } from '../types'

/**
 * Lista única de indicadores salvos pelo usuário: cada item guarda o indicador e os
 * filtros usados (o que antes eram "favoritos" sem filtros e "painéis" com filtros).
 * `fixadoHome` marca os que aparecem nos destaques da tela inicial.
 */
export interface Salvo {
  indicadorId: string
  selecao: FacetSelection
  criadoEm: number
  fixadoHome?: boolean
}

const CHAVE = 'datalogo-salvos'
const CHAVE_RECENTES = 'datalogo-recentes'
const CHAVE_FAVORITOS_ANTIGA = 'datalogo-favoritos'
const CHAVE_PAINEIS_ANTIGA = 'datalogo-paineis'
const MAX_RECENTES = 8

function lerJson<T>(chave: string, vazio: T): T {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : vazio
  } catch {
    return vazio
  }
}

function gravarJson(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // localStorage indisponível ou cheio: a lista não persiste nesta sessão.
  }
}

export function listarSalvos(): Salvo[] {
  return lerJson<Salvo[]>(CHAVE, []).sort((a, b) => b.criadoEm - a.criadoEm)
}

export function estaSalvo(indicadorId: string): boolean {
  return lerJson<Salvo[]>(CHAVE, []).some((s) => s.indicadorId === indicadorId)
}

/** Salva o indicador com a seleção atual, ou remove se já estava salvo. Retorna a lista atualizada. */
export function alternarSalvo(indicadorId: string, selecao: FacetSelection): Salvo[] {
  const atuais = lerJson<Salvo[]>(CHAVE, [])
  const novos = atuais.some((s) => s.indicadorId === indicadorId)
    ? atuais.filter((s) => s.indicadorId !== indicadorId)
    : [...atuais, { indicadorId, selecao, criadoEm: Date.now() }]
  gravarJson(CHAVE, novos)
  return novos
}

export function removerSalvo(indicadorId: string): Salvo[] {
  const novos = lerJson<Salvo[]>(CHAVE, []).filter((s) => s.indicadorId !== indicadorId)
  gravarJson(CHAVE, novos)
  return novos
}

/** Atualiza a seleção de um indicador já salvo (ex: usuário mudou os filtros e salvou de novo). */
export function atualizarSelecaoSalva(indicadorId: string, selecao: FacetSelection): Salvo[] {
  const novos = lerJson<Salvo[]>(CHAVE, []).map((s) => (s.indicadorId === indicadorId ? { ...s, selecao } : s))
  gravarJson(CHAVE, novos)
  return novos
}

/** Alterna a exibição nos destaques da home. Só vale para indicador já salvo. */
export function alternarFixadoHome(indicadorId: string): Salvo[] {
  const novos = lerJson<Salvo[]>(CHAVE, []).map((s) =>
    s.indicadorId === indicadorId ? { ...s, fixadoHome: !s.fixadoHome } : s,
  )
  gravarJson(CHAVE, novos)
  return novos
}

/** Ids fixados na home, na ordem em que foram salvos (mais antigo primeiro). */
export function idsFixadosHome(): string[] {
  return lerJson<Salvo[]>(CHAVE, [])
    .filter((s) => s.fixadoHome)
    .sort((a, b) => a.criadoEm - b.criadoEm)
    .map((s) => s.indicadorId)
}

export function listarRecentes(): string[] {
  return lerJson<string[]>(CHAVE_RECENTES, [])
}

/** Registra indicador como visitado mais recentemente (move pro topo, corta em MAX_RECENTES). */
export function registrarRecente(indicadorId: string): string[] {
  const outros = lerJson<string[]>(CHAVE_RECENTES, []).filter((x) => x !== indicadorId)
  const novos = [indicadorId, ...outros].slice(0, MAX_RECENTES)
  gravarJson(CHAVE_RECENTES, novos)
  return novos
}

/**
 * Migra favoritos (só ids) e painéis (indicador + seleção) para a lista única.
 * Painel vence favorito do mesmo indicador, porque carrega a seleção escolhida pelo usuário.
 */
export function migrarSalvosAntigos(selecaoPadrao: (indicadorId: string) => FacetSelection): void {
  const favoritosAntigos = lerJson<string[]>(CHAVE_FAVORITOS_ANTIGA, [])
  const paineisAntigos = lerJson<{ indicadorId: string; selecao: FacetSelection; criadoEm: number }[]>(
    CHAVE_PAINEIS_ANTIGA,
    [],
  )
  if (favoritosAntigos.length === 0 && paineisAntigos.length === 0) return

  const porIndicador = new Map<string, Salvo>()
  for (const salvo of lerJson<Salvo[]>(CHAVE, [])) porIndicador.set(salvo.indicadorId, salvo)
  for (const id of favoritosAntigos) {
    if (!porIndicador.has(id)) porIndicador.set(id, { indicadorId: id, selecao: selecaoPadrao(id), criadoEm: Date.now() })
  }
  for (const painel of paineisAntigos) {
    porIndicador.set(painel.indicadorId, {
      indicadorId: painel.indicadorId,
      selecao: painel.selecao,
      criadoEm: painel.criadoEm || Date.now(),
    })
  }

  gravarJson(CHAVE, Array.from(porIndicador.values()))
  try {
    localStorage.removeItem(CHAVE_FAVORITOS_ANTIGA)
    localStorage.removeItem(CHAVE_PAINEIS_ANTIGA)
  } catch {
    // sem localStorage não havia nada para migrar
  }
}
