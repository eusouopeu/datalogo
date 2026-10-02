import { estaExpirado, gravar, ler } from './armazenamento'

/** Contorno de uma UF já projetado em coordenadas de tela (atributo `d` de um `<path>`). */
export interface ContornoUf {
  /** código IBGE da UF, 2 dígitos */
  codigo: string
  d: string
}

export interface MalhaUf {
  contornos: ContornoUf[]
  largura: number
  altura: number
}

const URL_MALHA =
  'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=UF'
const CHAVE = 'malha-uf-v1'
const TTL = 180 * 24 * 60 * 60 * 1000 // o desenho das UFs praticamente não muda
const LARGURA = 1000

type Anel = [number, number][]

interface FeatureGeoJson {
  properties: { codarea: string }
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] }
}

/** Anéis de cada feature, independente de ser Polygon ou MultiPolygon. */
function aneisDe(feature: FeatureGeoJson): Anel[] {
  const coords = feature.geometry.coordinates
  const poligonos = feature.geometry.type === 'Polygon' ? [coords as number[][][]] : (coords as number[][][][])
  return poligonos.flatMap((poligono) => poligono.map((anel) => anel as Anel))
}

/**
 * Projeta longitude/latitude em coordenadas de tela. Equirretangular com correção pelo
 * cosseno da latitude média — suficiente para um mapa de referência do Brasil e sem dependência.
 */
function projetar(features: FeatureGeoJson[]): MalhaUf {
  const todos = features.flatMap((f) => aneisDe(f).flat())
  const lons = todos.map((c) => c[0])
  const lats = todos.map((c) => c[1])
  const lonMin = Math.min(...lons)
  const lonMax = Math.max(...lons)
  const latMin = Math.min(...lats)
  const latMax = Math.max(...lats)
  const fatorX = Math.cos((((latMin + latMax) / 2) * Math.PI) / 180)

  const larguraGeo = (lonMax - lonMin) * fatorX
  const alturaGeo = latMax - latMin
  const escala = LARGURA / larguraGeo
  const altura = Math.round(alturaGeo * escala)

  const x = (lon: number) => (lon - lonMin) * fatorX * escala
  const y = (lat: number) => (latMax - lat) * escala

  const contornos = features.map((feature) => ({
    codigo: feature.properties.codarea,
    d: aneisDe(feature)
      .map(
        (anel) =>
          'M' +
          anel.map(([lon, lat]) => `${x(lon).toFixed(1)} ${y(lat).toFixed(1)}`).join('L') +
          'Z',
      )
      .join(''),
  }))

  return { contornos, largura: LARGURA, altura }
}

/** Busca a malha das UFs no IBGE e devolve projetada, com cache local de longa duração. */
export async function buscarMalhaUf(): Promise<MalhaUf> {
  const cache = ler<MalhaUf>(CHAVE)
  if (cache && !estaExpirado(cache, TTL)) return cache.valor

  try {
    const resposta = await fetch(URL_MALHA)
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    const geojson: { features: FeatureGeoJson[] } = await resposta.json()
    const malha = projetar(geojson.features)
    gravar(CHAVE, malha)
    return malha
  } catch (erro) {
    if (cache) return cache.valor // malha antiga serve: o desenho não muda
    throw erro
  }
}
