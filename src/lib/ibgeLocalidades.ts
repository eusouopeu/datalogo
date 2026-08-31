import { estaExpirado, gravarCache, lerCache } from './cache'

export interface Localidade {
  id: string
  nome: string
  /** sigla da UF (para UFs) ou "UF - nome da UF" (para municípios) */
  subtitulo: string
}

const TTL_LOCALIDADES = 30 * 24 * 60 * 60 * 1000 // localidades mudam raramente

interface UfApi {
  id: number
  sigla: string
  nome: string
}

interface MunicipioApi {
  id: number
  nome: string
  microrregiao: { mesorregiao: { UF: { sigla: string; nome: string } } }
}

async function buscarComCache<T>(chave: string, url: string): Promise<T> {
  const cache = lerCache<T>(chave)
  if (cache && !estaExpirado(cache, TTL_LOCALIDADES)) return cache.valor

  try {
    const resposta = await fetch(url)
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    const dados: T = await resposta.json()
    gravarCache(chave, dados)
    return dados
  } catch (erro) {
    if (cache) return cache.valor // API fora do ar: usa cache expirado como fallback
    throw erro
  }
}

export async function buscarUfs(): Promise<Localidade[]> {
  const ufs = await buscarComCache<UfApi[]>(
    'ibge-ufs',
    'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
  )
  return ufs.map((uf) => ({ id: String(uf.id), nome: uf.nome, subtitulo: uf.sigla }))
}

export async function buscarMunicipios(): Promise<Localidade[]> {
  const municipios = await buscarComCache<MunicipioApi[]>(
    'ibge-municipios',
    'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome',
  )
  return municipios.map((m) => ({
    id: String(m.id),
    nome: m.nome,
    subtitulo: m.microrregiao.mesorregiao.UF.sigla,
  }))
}
