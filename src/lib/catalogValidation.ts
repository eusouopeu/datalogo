import type { Indicador } from '../types'

/** Valida invariantes do catálogo (ids únicos, campos obrigatórios não-vazios) — usado em dev para pegar erros de cadastro cedo. */
export function validarCatalogo(catalogo: Indicador[]): string[] {
  const problemas: string[] = []
  const idsVistos = new Set<string>()

  for (const indicador of catalogo) {
    if (idsVistos.has(indicador.id)) {
      problemas.push(`id duplicado: "${indicador.id}"`)
    }
    idsVistos.add(indicador.id)

    if (indicador.sinonimos.length === 0) {
      problemas.push(`"${indicador.id}": sem sinônimo (busca não vai encontrar)`)
    }
    if (indicador.niveisTerritoriais.length === 0) {
      problemas.push(`"${indicador.id}": sem nível territorial`)
    }
    if (indicador.tema.length === 0) {
      problemas.push(`"${indicador.id}": sem tema (não aparece na taxonomia)`)
    }
    if (!indicador.nome.trim()) {
      problemas.push(`"${indicador.id}": nome vazio`)
    }
    if (!indicador.fonteUrl.trim()) {
      problemas.push(`"${indicador.id}": sem fonteUrl`)
    }
  }

  return problemas
}
