import { gerarLeitura } from '../lib/leitura'
import type { Indicador, SerieResultado } from '../types'

interface Props {
  serie: SerieResultado
  indicador: Indicador
}

/** Leitura em português do que a série mostra — calculada no dispositivo, sem IA. */
export function Leitura({ serie, indicador }: Props) {
  const frases = gerarLeitura(serie, { unidade: indicador.unidade, periodicidade: indicador.periodicidade })
  if (frases.length === 0) return null

  return (
    <p className="text-sm leading-[1.5] text-slate-600 dark:text-slate-300">
      <span className="font-medium text-slate-900 dark:text-slate-100">{frases[0]}</span>{' '}
      {frases.slice(1).join(' ')}
    </p>
  )
}
