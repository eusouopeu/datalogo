import type { FacetSelection } from '../types'

export interface EstadoUrl {
  indicadorId: string
  selecao: FacetSelection
}

/** Serializa indicador + seleção de filtros em query params, para compartilhar/voltar via URL. */
export function estadoParaParams(estado: EstadoUrl): URLSearchParams {
  const params = new URLSearchParams()
  params.set('i', estado.indicadorId)
  params.set('n', estado.selecao.nivelTerritorial)
  if (estado.selecao.codigosTerritoriais.length > 0) {
    params.set('c', estado.selecao.codigosTerritoriais.join(','))
  }
  params.set('p', String(estado.selecao.quantidadePeriodos))
  const categoriasPartes = Object.entries(estado.selecao.categorias)
    .filter(([, ids]) => ids.length > 0)
    .map(([classifId, ids]) => `${classifId}:${ids.join(',')}`)
  if (categoriasPartes.length > 0) {
    params.set('cat', categoriasPartes.join(';'))
  }
  return params
}

/** Lê o estado gravado na URL de volta em indicadorId + seleção parcial. */
export function paramsParaEstado(params: URLSearchParams): EstadoUrl | null {
  const indicadorId = params.get('i')
  if (!indicadorId) return null

  const categorias: Record<string, string[]> = {}
  const catParam = params.get('cat')
  if (catParam) {
    for (const parte of catParam.split(';')) {
      const [classifId, ids] = parte.split(':')
      if (classifId && ids) categorias[classifId] = ids.split(',')
    }
  }

  const nivel = params.get('n')
  return {
    indicadorId,
    selecao: {
      nivelTerritorial: (nivel as FacetSelection['nivelTerritorial']) ?? 'N1',
      codigosTerritoriais: params.get('c')?.split(',').filter(Boolean) ?? [],
      categorias,
      quantidadePeriodos: Number(params.get('p')) || 8,
    },
  }
}
