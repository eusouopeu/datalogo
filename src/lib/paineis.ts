import type { FacetSelection } from '../types'

export interface Painel {
  id: string
  nome: string
  indicadorId: string
  selecao: FacetSelection
  criadoEm: number
}

const CHAVE = 'datalogo-paineis'

function ler(): Painel[] {
  try {
    const bruto = localStorage.getItem(CHAVE)
    return bruto ? (JSON.parse(bruto) as Painel[]) : []
  } catch {
    return []
  }
}

function gravar(paineis: Painel[]): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(paineis))
  } catch {
    // localStorage indisponível ou cheio: painel não persiste nesta sessão.
  }
}

export function listarPaineis(): Painel[] {
  return ler().sort((a, b) => b.criadoEm - a.criadoEm)
}

export function salvarPainel(nome: string, indicadorId: string, selecao: FacetSelection): Painel {
  const painel: Painel = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nome,
    indicadorId,
    selecao,
    criadoEm: Date.now(),
  }
  gravar([...ler(), painel])
  return painel
}

export function removerPainel(id: string): void {
  gravar(ler().filter((p) => p.id !== id))
}
