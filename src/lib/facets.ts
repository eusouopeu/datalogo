import type { FacetSelection, Indicador } from '../types'

/** Seleção inicial de filtros para um indicador: primeiro nível territorial, 1ª categoria de cada classificação. */
export function selecaoInicial(indicador: Indicador): FacetSelection {
  const nivel = indicador.niveisTerritoriais[0]
  const categorias: Record<string, string[]> = {}
  for (const c of indicador.classificacoes) {
    categorias[c.id] = [c.categorias[0].id]
  }
  return { nivelTerritorial: nivel.nivel, codigosTerritoriais: [], categorias, quantidadePeriodos: 8 }
}
