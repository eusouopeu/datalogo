import { useEffect, useState } from 'react'
import { buscarMalhaUf, type MalhaUf } from '../lib/malhaUf'
import type { SerieResultado } from '../types'

interface Props {
  series: SerieResultado[]
  unidade: string
}

/** Cinco faixas do claro ao escuro — mesma família de cor das linhas do gráfico. */
const FAIXAS = ['#d1fae5', '#6ee7b7', '#34d399', '#059669', '#065f46']

function ultimoValor(serie: SerieResultado): number | null {
  const validos = serie.pontos.filter((p) => p.valor !== null)
  return validos.length > 0 ? (validos[validos.length - 1].valor as number) : null
}

function fmt(valor: number, unidade: string): string {
  const numero = valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return unidade.startsWith('%') ? `${numero}${unidade}` : `${numero} ${unidade}`
}

/**
 * Mapa coroplético por UF: usa a malha oficial do IBGE (projetada em SVG, sem biblioteca
 * de mapas) e pinta cada estado pelo valor mais recente da série.
 */
export function MapaUf({ series, unidade }: Props) {
  const [malha, setMalha] = useState<MalhaUf | null>(null)
  const [erro, setErro] = useState(false)
  const [selecionada, setSelecionada] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    buscarMalhaUf()
      .then((m) => !cancelado && setMalha(m))
      .catch(() => !cancelado && setErro(true))
    return () => {
      cancelado = true
    }
  }, [])

  const porUf = new Map<string, { nome: string; valor: number }>()
  for (const serie of series) {
    const codigo = serie.localidadeCodigo
    const valor = ultimoValor(serie)
    if (!codigo || valor === null) continue
    porUf.set(codigo, { nome: serie.localidadeNome, valor })
  }

  if (erro) return <p className="text-sm text-slate-500">Não foi possível carregar a malha de estados do IBGE.</p>
  if (!malha) return <p className="text-sm text-slate-500">Carregando malha de estados…</p>
  if (porUf.size === 0) {
    return <p className="text-sm text-slate-500">O mapa aparece quando a consulta é por unidades da federação.</p>
  }

  const valores = Array.from(porUf.values()).map((v) => v.valor)
  const minimo = Math.min(...valores)
  const maximo = Math.max(...valores)
  const passo = (maximo - minimo) / FAIXAS.length || 1

  function cor(valor: number): string {
    const indice = Math.min(FAIXAS.length - 1, Math.floor((valor - minimo) / passo))
    return FAIXAS[indice]
  }

  const detalhe = selecionada ? porUf.get(selecionada) : null

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${malha.largura} ${malha.altura}`}
        className="h-72 w-full"
        role="img"
        aria-label="Mapa do Brasil por unidade da federação"
      >
        {malha.contornos.map(({ codigo, d }) => {
          const dado = porUf.get(codigo)
          return (
            <path
              key={codigo}
              d={d}
              fill={dado ? cor(dado.valor) : undefined}
              strokeWidth={selecionada === codigo ? 4 : 1.5}
              onClick={() => setSelecionada(dado ? codigo : null)}
              className={`stroke-white dark:stroke-slate-950 ${dado ? 'cursor-pointer' : 'fill-slate-200 dark:fill-slate-800'} ${
                selecionada === codigo ? 'stroke-slate-900 dark:stroke-slate-100' : ''
              }`}
            >
              <title>{dado ? `${dado.nome}: ${fmt(dado.valor, unidade)}` : 'Sem dado na consulta'}</title>
            </path>
          )
        })}
      </svg>

      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{fmt(minimo, unidade)}</span>
        <div className="flex h-2 flex-1 overflow-hidden rounded-full">
          {FAIXAS.map((faixa) => (
            <span key={faixa} className="flex-1" style={{ backgroundColor: faixa }} />
          ))}
        </div>
        <span>{fmt(maximo, unidade)}</span>
      </div>

      {detalhe && (
        <p className="text-sm">
          <span className="font-medium">{detalhe.nome}</span>: {fmt(detalhe.valor, unidade)}
        </p>
      )}
    </div>
  )
}
