import { describe, expect, it } from 'vitest'
import { formatarPeriodo, gerarLeitura } from '../leitura'
import type { SerieResultado } from '../../types'

const SERIE_IPCA: SerieResultado = {
  localidadeNome: 'Brasil',
  categoriaLabels: [],
  pontos: [
    { periodo: '202604', valor: 0.2 },
    { periodo: '202605', valor: 0.3 },
    { periodo: '202606', valor: null },
    { periodo: '202607', valor: 0.1 },
    { periodo: '202608', valor: 0.5 },
  ],
}

describe('formatarPeriodo', () => {
  it('traduz os formatos das APIs conforme a periodicidade', () => {
    expect(formatarPeriodo('202608', 'mensal')).toBe('ago/2026')
    expect(formatarPeriodo('202602', 'trimestral')).toBe('2º tri/2026')
    expect(formatarPeriodo('2026', 'anual')).toBe('2026')
    expect(formatarPeriodo('2026-08-14', 'diaria')).toBe('14/08/2026')
    expect(formatarPeriodo('2026-08-01', 'mensal')).toBe('ago/2026')
  })
})

describe('gerarLeitura', () => {
  it('descreve último valor, variação em p.p., extremo e posição vs média para série em %', () => {
    const frases = gerarLeitura(SERIE_IPCA, { unidade: '%', periodicidade: 'mensal' })
    const texto = frases.join(' ')

    expect(frases[0]).toBe('ago/2026: 0,5%.')
    expect(texto).toContain('0,4 p.p.')
    expect(texto).toContain('jul/2026')
    expect(texto).toContain('Maior valor')
    expect(texto).toContain('Acima da média')
  })

  it('usa variação percentual quando a unidade não é percentual', () => {
    const serie: SerieResultado = {
      localidadeNome: 'Brasil',
      categoriaLabels: [],
      pontos: [
        { periodo: '2024', valor: 200 },
        { periodo: '2025', valor: 100 },
      ],
    }
    const texto = gerarLeitura(serie, { unidade: 'pessoas', periodicidade: 'anual' }).join(' ')
    expect(texto).toContain('Queda de 50%')
    expect(texto).toContain('Menor valor')
  })

  it('não gera frases quando não há valor algum', () => {
    const vazia: SerieResultado = { localidadeNome: 'Brasil', categoriaLabels: [], pontos: [] }
    expect(gerarLeitura(vazia, { unidade: '%', periodicidade: 'mensal' })).toEqual([])
  })
})
