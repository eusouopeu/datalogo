import type { FacetSelection, Indicador, SerieResultado } from '../types'
import { montarUrl as montarUrlSidra, buscarSerie as buscarSerieSidra } from './sidra'
import { montarUrlBcb, buscarSerieBcb } from './bcb'
import { montarUrlSiconfi, buscarSerieSiconfi } from './siconfi'
import { montarCorpo as montarCorpoComexStat, montarUrlComexStat, buscarSerieComexStat } from './comexstat'

export interface RequisicaoDescrita {
  metodo: 'GET' | 'POST'
  url: string
  corpo?: unknown
}

/** Roteia para a API correta (IBGE/SIDRA, BCB/SGS, SICONFI ou Comex Stat) conforme a origem do indicador. */
export function montarUrlConsulta(indicador: Indicador, selecao: FacetSelection): string {
  switch (indicador.origem) {
    case 'IBGE':
      return montarUrlSidra(indicador, selecao)
    case 'BCB':
      return montarUrlBcb(indicador, selecao)
    case 'SICONFI':
      return montarUrlSiconfi(indicador, selecao)
    case 'COMEXSTAT':
      return montarUrlComexStat()
  }
}

/** Descreve a requisição real (método, URL e corpo) enviada à API de origem, para transparência na UI. */
export function descreverRequisicao(indicador: Indicador, selecao: FacetSelection): RequisicaoDescrita {
  if (indicador.origem === 'COMEXSTAT') {
    return { metodo: 'POST', url: montarUrlComexStat(), corpo: montarCorpoComexStat(indicador, selecao) }
  }
  return { metodo: 'GET', url: montarUrlConsulta(indicador, selecao) }
}

export function buscarSerieIndicador(
  indicador: Indicador,
  selecao: FacetSelection,
): Promise<SerieResultado[]> {
  switch (indicador.origem) {
    case 'IBGE':
      return buscarSerieSidra(indicador, selecao)
    case 'BCB':
      return buscarSerieBcb(indicador, selecao)
    case 'SICONFI':
      return buscarSerieSiconfi(indicador, selecao)
    case 'COMEXSTAT':
      return buscarSerieComexStat(indicador, selecao)
  }
}
