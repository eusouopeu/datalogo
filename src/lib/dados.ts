import type { FacetSelection, Indicador, SerieResultado } from '../types'
import { montarUrl as montarUrlSidra, buscarSerie as buscarSerieSidra } from './sidra'
import { montarUrlBcb, buscarSerieBcb } from './bcb'

/** Roteia para a API correta (IBGE/SIDRA ou BCB/SGS) conforme a origem do indicador. */
export function montarUrlConsulta(indicador: Indicador, selecao: FacetSelection): string {
  return indicador.origem === 'IBGE'
    ? montarUrlSidra(indicador, selecao)
    : montarUrlBcb(indicador, selecao)
}

export function buscarSerieIndicador(
  indicador: Indicador,
  selecao: FacetSelection,
): Promise<SerieResultado[]> {
  return indicador.origem === 'IBGE'
    ? buscarSerieSidra(indicador, selecao)
    : buscarSerieBcb(indicador, selecao)
}
