import { CATALOGO } from '../data/catalog'
import type { SearchMatch } from '../types'
import { normalize, tokenize } from './normalize'

const PESOS = {
  correspondenciaExata: 100,
  sinonimo: 70,
  titulo: 50,
  descricao: 30,
  categoria: 20,
  fonte: 10,
} as const

/**
 * Motor de busca determinístico: normaliza, tokeniza, casa contra
 * título/sinônimos/descrição/categorias/tema/fonte do catálogo e soma pesos.
 * Sem IA generativa — cada ponto de pontuação é rastreável e explicável.
 */
export function buscarIndicadores(consulta: string): SearchMatch[] {
  const termos = tokenize(consulta)
  if (termos.length === 0) return []

  const resultados: SearchMatch[] = []

  for (const indicador of CATALOGO) {
    let score = 0
    const motivos: string[] = []

    const nomeNorm = normalize(indicador.nome)
    const descricaoNorm = normalize(indicador.descricao)
    const sinonimosNorm = indicador.sinonimos.map(normalize)
    const temaNorm = indicador.tema.map(normalize)
    const fonteNorm = normalize(`${indicador.fonte} ${indicador.pesquisa}`)
    const categoriasNorm = indicador.classificacoes.flatMap((c) =>
      c.categorias.map((cat) => ({
        texto: normalize(cat.nome),
        sinonimos: (cat.sinonimos ?? []).map(normalize),
      })),
    )

    for (const termo of termos) {
      if (nomeNorm === termo) {
        score += PESOS.correspondenciaExata
        motivos.push(`"${termo}" é correspondência exata do indicador`)
        continue
      }
      if (sinonimosNorm.some((s) => s.includes(termo))) {
        score += PESOS.sinonimo
        motivos.push(`"${termo}" corresponde a um sinônimo cadastrado`)
        continue
      }
      if (nomeNorm.includes(termo)) {
        score += PESOS.titulo
        motivos.push(`"${termo}" aparece no título`)
        continue
      }
      if (descricaoNorm.includes(termo)) {
        score += PESOS.descricao
        motivos.push(`"${termo}" aparece na descrição`)
        continue
      }
      const categoriaAchada = categoriasNorm.find(
        (c) => c.texto.includes(termo) || c.sinonimos.some((s) => s.includes(termo)),
      )
      if (categoriaAchada) {
        score += PESOS.categoria
        motivos.push(`"${termo}" corresponde à categoria "${categoriaAchada.texto}"`)
        continue
      }
      if (temaNorm.some((t) => t.includes(termo)) || fonteNorm.includes(termo)) {
        score += PESOS.fonte
        motivos.push(`"${termo}" corresponde ao tema ou fonte`)
      }
    }

    if (score > 0) {
      resultados.push({ indicador, score, motivos })
    }
  }

  return resultados.sort((a, b) => b.score - a.score)
}

/** Retorna todo o catálogo agrupado por tema, para navegação por taxonomia. */
export function agruparPorTema() {
  const grupos = new Map<string, typeof CATALOGO>()
  for (const indicador of CATALOGO) {
    const chave = indicador.tema[0]
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave)!.push(indicador)
  }
  return grupos
}
