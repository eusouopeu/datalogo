import type { Indicador } from '../types'

type Periodicidade = Indicador['periodicidade']

export interface EventoHistorico {
  /** mês de referência do evento, no formato `AAAA-MM` */
  inicio: string
  label: string
}

/** Evento posicionado no eixo do gráfico: `periodo` é um dos períodos realmente exibidos. */
export interface EventoNoGrafico extends EventoHistorico {
  periodo: string
}

/** Eventos macro-históricos conhecidos, usados como marcadores de referência no gráfico. */
const EVENTOS: EventoHistorico[] = [
  { inicio: '1994-07', label: 'Plano Real' },
  { inicio: '2008-09', label: 'Crise financeira global' },
  { inicio: '2016-12', label: 'Teto de gastos (EC 95)' },
  { inicio: '2020-03', label: 'Pandemia de covid-19' },
  { inicio: '2022-10', label: 'Eleições presidenciais' },
]

/**
 * Normaliza qualquer formato de período das APIs para `AAAA-MM`. A periodicidade é
 * necessária porque `202003` é março em série mensal e o 3º trimestre em série trimestral.
 */
function anoMes(periodo: string, periodicidade: Periodicidade): string {
  const iso = /^(\d{4})-(\d{2})/.exec(periodo)
  if (iso) return `${iso[1]}-${iso[2]}`
  const compacto = /^(\d{4})(\d{2})$/.exec(periodo)
  if (compacto) {
    const parte = Number(compacto[2])
    const mes = periodicidade === 'trimestral' ? Math.min(parte * 3 - 2, 12) : Math.min(parte, 12)
    return `${compacto[1]}-${String(mes).padStart(2, '0')}`
  }
  const ano = /^(\d{4})$/.exec(periodo)
  return ano ? `${ano[1]}-01` : periodo
}

/**
 * Eventos que caem dentro do intervalo exibido, cada um ancorado no último período
 * que começa em ou antes do mês do evento — assim o marcador cai no ponto certo tanto
 * em série mensal quanto anual.
 */
export function eventosNoIntervalo(periodos: string[], periodicidade: Periodicidade = 'mensal'): EventoNoGrafico[] {
  if (periodos.length === 0) return []
  const ordenados = [...periodos].sort()
  const comAnoMes = ordenados.map((periodo) => ({ periodo, anoMes: anoMes(periodo, periodicidade) }))
  const primeiro = comAnoMes[0].anoMes
  const ultimo = comAnoMes[comAnoMes.length - 1].anoMes

  return EVENTOS.filter((e) => e.inicio >= primeiro && e.inicio <= ultimo)
    .map((evento) => {
      const ancora = [...comAnoMes].reverse().find((p) => p.anoMes <= evento.inicio)
      return ancora ? { ...evento, periodo: ancora.periodo } : null
    })
    .filter((e): e is EventoNoGrafico => e !== null)
}
