import { describe, expect, it } from 'vitest'
import { extrairValor } from '../siconfi'

const itensFixture = [
  {
    exercicio: 2022,
    cod_conta: 'ReceitasExcetoIntraOrcamentarias',
    coluna: 'Receitas Brutas Realizadas',
    valor: 88977873623.73,
  },
  {
    exercicio: 2022,
    cod_conta: 'ReceitasExcetoIntraOrcamentarias',
    coluna: 'Deduções - FUNDEB',
    valor: 2826277787.73,
  },
  {
    exercicio: 2022,
    cod_conta: 'TotalDespesas',
    coluna: 'Despesas Empenhadas',
    valor: 91088340203.36,
  },
]

describe('extrairValor (SICONFI/DCA)', () => {
  it('filtra pelo par cod_conta + coluna corretos, ignorando outras contas/colunas', () => {
    expect(extrairValor(itensFixture, 'ReceitasExcetoIntraOrcamentarias', 'Receitas Brutas Realizadas')).toBe(
      88977873623.73,
    )
    expect(extrairValor(itensFixture, 'TotalDespesas', 'Despesas Empenhadas')).toBe(91088340203.36)
  })

  it('retorna null quando a combinação não existe na resposta', () => {
    expect(extrairValor(itensFixture, 'TotalDespesas', 'Despesas Liquidadas')).toBeNull()
  })

  it('retorna null para lista vazia', () => {
    expect(extrairValor([], 'TotalDespesas', 'Despesas Empenhadas')).toBeNull()
  })
})
