/** Remove acentos, caixa e normaliza espaços. Determinístico e auditável. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/** Stemming ingênuo de plural em português (suficiente para o catálogo controlado). */
export function singularize(word: string): string {
  if (word.length > 3 && word.endsWith('oes')) return word.slice(0, -3) + 'ao'
  if (word.length > 3 && word.endsWith('ns')) return word.slice(0, -2) + 'm'
  if (word.length > 3 && word.endsWith('is')) return word.slice(0, -2) + 'l'
  if (word.length > 3 && word.endsWith('res')) return word.slice(0, -3)
  if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1)
  return word
}

/**
 * Distância de edição (Levenshtein) entre duas strings — usada para tolerar erros de
 * digitação na busca. Sem limite de corte: strings de busca são curtas (uma palavra).
 */
export function distanciaEdicao(a: string, b: string): number {
  const linhas = a.length + 1
  const colunas = b.length + 1
  const dp: number[][] = Array.from({ length: linhas }, () => new Array(colunas).fill(0))
  for (let i = 0; i < linhas; i++) dp[i][0] = i
  for (let j = 0; j < colunas; j++) dp[0][j] = j
  for (let i = 1; i < linhas; i++) {
    for (let j = 1; j < colunas; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + custo)
    }
  }
  return dp[a.length][b.length]
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(Boolean)
    .map(singularize)
}
