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

export interface Indicador {
  id: string
  fonte: string
  pesquisa: string
  nome: string
  descricao: string
  /** caminho na taxonomia: Tema > Subtema > ... */
  tema: string[]
  sinonimos: string[]
  unidade: string
  periodicidade: 'mensal' | 'trimestral' | 'anual'
  agregado: number
  variavel: number
  niveisTerritoriais: NivelTerritorialOpcao[]
  classificacoes: Classificacao[]
  fonteUrl: string
}

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
