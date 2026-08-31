const CHAVE_FAVORITOS = 'datalogo-favoritos'
const CHAVE_RECENTES = 'datalogo-recentes'
const MAX_RECENTES = 8

function ler(chave: string): string[] {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as string[]) : []
  } catch {
    return []
  }
}

function gravar(chave: string, valores: string[]): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valores))
  } catch {
    // localStorage indisponível ou cheio: favoritos/recentes não persistem nesta sessão.
  }
}

export function listarFavoritos(): string[] {
  return ler(CHAVE_FAVORITOS)
}

export function ehFavorito(id: string): boolean {
  return ler(CHAVE_FAVORITOS).includes(id)
}

/** Adiciona/remove dos favoritos e retorna a lista atualizada. */
export function alternarFavorito(id: string): string[] {
  const atuais = ler(CHAVE_FAVORITOS)
  const novos = atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id]
  gravar(CHAVE_FAVORITOS, novos)
  return novos
}

export function listarRecentes(): string[] {
  return ler(CHAVE_RECENTES)
}

/** Registra indicador como visitado mais recentemente (move pro topo, corta em MAX_RECENTES) e retorna a lista. */
export function registrarRecente(id: string): string[] {
  const outros = ler(CHAVE_RECENTES).filter((x) => x !== id)
  const novos = [id, ...outros].slice(0, MAX_RECENTES)
  gravar(CHAVE_RECENTES, novos)
  return novos
}
