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

export function baixarCsv(nomeArquivo: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
