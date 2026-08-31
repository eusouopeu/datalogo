export type NivelTerritorial = 'N1' | 'N2' | 'N3' | 'N6'

export interface NivelTerritorialOpcao {
  nivel: NivelTerritorial
  label: string
  /** true se o usuário precisa escolher um ou mais códigos específicos (ex: quais UFs) */
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

/**
 * Indicador servido pela API do SICONFI (Tesouro Nacional) — Declaração de Contas Anuais (DCA).
 * `codConta`/`coluna` identificam a linha exata do anexo a extrair (ex: total de receita
 * bruta realizada, ou total de despesa empenhada). Aceita ente UF (código IBGE de 2 dígitos,
 * nível N3) ou município (código IBGE de 7 dígitos, nível N6).
 */
export interface IndicadorSiconfi extends IndicadorBase {
  origem: 'SICONFI'
  anexo: string
  codConta: string
  coluna: string
}

/**
 * Indicador servido pela API do Comex Stat (MDIC) — totais nacionais anuais de
 * exportação/importação (valor FOB), sem recorte territorial (apenas Brasil).
 */
export interface IndicadorComexStat extends IndicadorBase {
  origem: 'COMEXSTAT'
  fluxo: 'export' | 'import'
}

export type Indicador = IndicadorIbge | IndicadorBcb | IndicadorSiconfi | IndicadorComexStat

export interface FacetSelection {
  nivelTerritorial: NivelTerritorial
  /** códigos territoriais selecionados (ex: mais de uma UF, para comparar/ranking) */
  codigosTerritoriais: string[]
  /** classificacaoId -> categoriaIds selecionadas (uma ou mais) */
  categorias: Record<string, string[]>
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
