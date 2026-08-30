import type { Indicador } from '../types'

// Catálogo semântico de indicadores. Cada entrada traduz um conceito do
// mundo real para os parâmetros reais da API de Agregados do IBGE (SIDRA).
// Códigos verificados em servicodados.ibge.gov.br/api/v3/agregados/{id}/metadados
export const CATALOGO: Indicador[] = [
  {
    id: 'taxa-desocupacao-idade',
    fonte: 'IBGE',
    pesquisa: 'PNAD Contínua / ODS 8.5.2',
    nome: 'Taxa de desocupação por grupo de idade',
    descricao:
      'Percentual de pessoas de 15 anos ou mais que estavam desocupadas na semana de referência, por grupo de idade.',
    tema: ['Trabalho', 'Mercado de trabalho', 'Desocupação'],
    sinonimos: [
      'desemprego',
      'desempregado',
      'desempregados',
      'sem emprego',
      'taxa de desemprego',
      'desocupacao',
    ],
    unidade: '%',
    periodicidade: 'anual',
    agregado: 9717,
    variavel: 10004,
    fonteUrl: 'https://sidra.ibge.gov.br/tabela/9717',
    niveisTerritoriais: [
      { nivel: 'N1', label: 'Brasil', requerSelecao: false },
      { nivel: 'N3', label: 'Unidade da Federação (UF)', requerSelecao: true },
    ],
    classificacoes: [
      {
        id: '58',
        nome: 'Grupo de idade',
        categorias: [
          { id: '95253', nome: 'Total', sinonimos: ['todas as idades', 'geral'] },
          { id: '2792', nome: '15 a 17 anos', sinonimos: ['adolescentes'] },
          { id: '100052', nome: '18 a 24 anos', sinonimos: ['jovem', 'jovens', 'juventude'] },
          { id: '1145', nome: '25 a 29 anos' },
          { id: '3299', nome: '30 a 39 anos' },
          { id: '3300', nome: '40 a 49 anos' },
          { id: '3301', nome: '50 a 59 anos' },
          { id: '3302', nome: '60 anos ou mais', sinonimos: ['idosos', 'terceira idade'] },
        ],
      },
    ],
  },
  {
    id: 'ipca-variacao-mensal',
    fonte: 'IBGE',
    pesquisa: 'Índice Nacional de Preços ao Consumidor Amplo (IPCA)',
    nome: 'IPCA - variação mensal',
    descricao: 'Variação mensal do Índice Nacional de Preços ao Consumidor Amplo, o índice oficial de inflação do Brasil.',
    tema: ['Economia', 'Preços', 'Inflação'],
    sinonimos: ['inflacao', 'ipca', 'indice de precos', 'custo de vida', 'aumento de precos'],
    unidade: '%',
    periodicidade: 'mensal',
    agregado: 1737,
    variavel: 63,
    fonteUrl: 'https://sidra.ibge.gov.br/tabela/1737',
    niveisTerritoriais: [{ nivel: 'N1', label: 'Brasil', requerSelecao: false }],
    classificacoes: [],
  },
  {
    id: 'populacao-estimada',
    fonte: 'IBGE',
    pesquisa: 'Estimativas de População',
    nome: 'População residente estimada',
    descricao: 'Estimativa anual da população residente, por unidade da federação.',
    tema: ['Demografia', 'População'],
    sinonimos: ['populacao', 'habitantes', 'numero de pessoas', 'quantos habitantes'],
    unidade: 'pessoas',
    periodicidade: 'anual',
    agregado: 6579,
    variavel: 9324,
    fonteUrl: 'https://sidra.ibge.gov.br/tabela/6579',
    niveisTerritoriais: [
      { nivel: 'N1', label: 'Brasil', requerSelecao: false },
      { nivel: 'N3', label: 'Unidade da Federação (UF)', requerSelecao: true },
    ],
    classificacoes: [],
  },
]
