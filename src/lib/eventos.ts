export interface EventoHistorico {
  ano: string
  label: string
}

/** Eventos macro-históricos conhecidos, usados como marcadores de referência no gráfico. */
const EVENTOS: EventoHistorico[] = [
  { ano: '1994', label: 'Plano Real' },
  { ano: '2008', label: 'Crise financeira global' },
  { ano: '2016', label: 'Teto de gastos (EC 95)' },
  { ano: '2020', label: 'Pandemia de covid-19' },
  { ano: '2022', label: 'Eleições presidenciais' },
]

/** Filtra os eventos cujo ano aparece em algum dos períodos exibidos (períodos começam com o ano, em qualquer formato). */
export function eventosNoIntervalo(periodos: string[]): EventoHistorico[] {
  const anos = new Set(periodos.map((p) => p.slice(0, 4)))
  return EVENTOS.filter((e) => anos.has(e.ano))
}
