import type { Indicador, SerieResultado } from '../types'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Traduz o período cru das APIs (`202608`, `2026-08-01`, `2026`) para rótulo legível em português. */
export function formatarPeriodo(periodo: string, periodicidade: Indicador['periodicidade']): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(periodo)
  if (iso) {
    const [, ano, mes, dia] = iso
    if (periodicidade === 'diaria') return `${dia}/${mes}/${ano}`
    if (periodicidade === 'anual') return ano
    return `${MESES[Number(mes) - 1] ?? mes}/${ano}`
  }
  const compacto = /^(\d{4})(\d{2})$/.exec(periodo)
  if (compacto) {
    const [, ano, parte] = compacto
    if (periodicidade === 'trimestral') return `${Number(parte)}º tri/${ano}`
    return `${MESES[Number(parte) - 1] ?? parte}/${ano}`
  }
  return periodo
}

function fmt(valor: number, unidade: string): string {
  const numero = valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return unidade.startsWith('%') ? `${numero}${unidade}` : `${numero} ${unidade}`
}

/** Unidades já percentuais comparam-se em pontos percentuais, não em variação relativa. */
function ehPercentual(unidade: string): boolean {
  return unidade.trim().startsWith('%')
}

interface Contexto {
  unidade: string
  periodicidade: Indicador['periodicidade']
}

/**
 * Leitura em português do que a série mostra, calculada no dispositivo (sem IA): último valor,
 * variação sobre o período anterior, extremo da janela consultada e posição frente à média.
 */
export function gerarLeitura(serie: SerieResultado, { unidade, periodicidade }: Contexto): string[] {
  const pontos = serie.pontos.filter((p): p is { periodo: string; valor: number } => p.valor !== null)
  if (pontos.length === 0) return []

  const ultimo = pontos[pontos.length - 1]
  const frases = [`${formatarPeriodo(ultimo.periodo, periodicidade)}: ${fmt(ultimo.valor, unidade)}.`]

  const anterior = pontos[pontos.length - 2]
  if (anterior) {
    const rotuloAnterior = formatarPeriodo(anterior.periodo, periodicidade)
    const diferenca = ultimo.valor - anterior.valor
    const sentido = diferenca > 0 ? 'Alta' : diferenca < 0 ? 'Queda' : 'Estável'
    if (diferenca === 0) {
      frases.push(`Estável em relação a ${rotuloAnterior}.`)
    } else if (ehPercentual(unidade)) {
      const pp = Math.abs(diferenca).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
      frases.push(`${sentido} de ${pp} p.p. sobre ${rotuloAnterior}.`)
    } else if (anterior.valor !== 0) {
      const pct = Math.abs((diferenca / Math.abs(anterior.valor)) * 100).toLocaleString('pt-BR', {
        maximumFractionDigits: 2,
      })
      frases.push(`${sentido} de ${pct}% sobre ${rotuloAnterior}.`)
    } else {
      frases.push(`${sentido} de ${fmt(Math.abs(diferenca), unidade)} sobre ${rotuloAnterior}.`)
    }
  }

  if (pontos.length >= 3) {
    const valores = pontos.map((p) => p.valor)
    const maximo = Math.max(...valores)
    const minimo = Math.min(...valores)
    if (ultimo.valor === maximo) frases.push('Maior valor do período consultado.')
    else if (ultimo.valor === minimo) frases.push('Menor valor do período consultado.')

    const media = valores.reduce((a, b) => a + b, 0) / valores.length
    const rotuloMedia = fmt(media, unidade)
    if (ultimo.valor > media) frases.push(`Acima da média do período (${rotuloMedia}).`)
    else if (ultimo.valor < media) frases.push(`Abaixo da média do período (${rotuloMedia}).`)
  } else if (pontos.length === 2) {
    frases.push(pontos[0].valor > ultimo.valor ? 'Menor valor do período consultado.' : 'Maior valor do período consultado.')
  }

  return frases
}
