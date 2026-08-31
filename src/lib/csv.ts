import type { SerieResultado } from '../types'

export function serieParaCsv(series: SerieResultado[]): string {
  const linhas = ['localidade,categoria,periodo,valor']
  for (const serie of series) {
    const categoria = serie.categoriaLabels.join(' / ')
    for (const ponto of serie.pontos) {
      linhas.push(
        [serie.localidadeNome, categoria, ponto.periodo, ponto.valor ?? ''].map(escaparCampo).join(','),
      )
    }
  }
  return linhas.join('\n')
}

function escaparCampo(valor: string | number): string {
  const texto = String(valor)
  if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}
