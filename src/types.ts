export type NivelTerritorial = 'N1' | 'N2' | 'N3'

export interface NivelTerritorialOpcao {
  nivel: NivelTerritorial
  label: string
  /** true se o usuário precisa escolher um código específico (ex: qual UF) */
  requerSelecao: boolean
}

export interface CategoriaClassificacao {
  id: string
  nome: string
  sinonimos?: string[]
}

export interface Classificacao {
  id: string
  nome: string
  categorias: CategoriaClassificacao[]
}

interface IndicadorBase {
  id: string
  fonte: string
  pesquisa: string
  nome: string
  descricao: string
  /** caminho na taxonomia: Tema > Subtema > ... */
  tema: string[]
  sinonimos: string[]
  unidade: string
  periodicidade: 'diaria' | 'mensal' | 'trimestral' | 'anual'
  niveisTerritoriais: NivelTerritorialOpcao[]
  classificacoes: Classificacao[]
  fonteUrl: string
}

/** Indicador servido pela API de Agregados do IBGE (SIDRA). */
export interface IndicadorIbge extends IndicadorBase {
  origem: 'IBGE'
  agregado: number
  variavel: number
}

/** Indicador servido pela API de Séries Temporais do Banco Central (SGS). */
export interface IndicadorBcb extends IndicadorBase {
  origem: 'BCB'
  serieBcb: number
}

export type Indicador = IndicadorIbge | IndicadorBcb

export interface FacetSelection {
  nivelTerritorial: NivelTerritorial
  codigoTerritorial?: string
  /** classificacaoId -> categoriaId selecionada */
  categorias: Record<string, string>
  quantidadePeriodos: number
}

export interface SerieResultado {
  localidadeNome: string
  categoriaLabels: string[]
  pontos: { periodo: string; valor: number | null }[]
}

export interface SearchMatch {
  indicador: Indicador
  score: number
  motivos: string[]
}
