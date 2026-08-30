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

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(Boolean)
    .map(singularize)
}
