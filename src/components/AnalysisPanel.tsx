import { useState } from 'react'
import type { SerieResultado } from '../types'
import { calcularEvolucao, compararUltimoValor, descrever } from '../lib/analysis'

interface Props {
  series: SerieResultado[]
  unidade: string
}

type Receita = 'descrever' | 'comparar' | 'evolucao'

const ABAS: { id: Receita; label: string }[] = [
  { id: 'descrever', label: 'Descrever' },
  { id: 'comparar', label: 'Comparar / Ranking' },
  { id: 'evolucao', label: 'Evolução' },
]

function fmt(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—'
}

export function AnalysisPanel({ series, unidade }: Props) {
  const [aba, setAba] = useState<Receita>('descrever')

  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              aba === a.id
                ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-3 text-sm">
        {aba === 'descrever' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {series.map((serie) => {
              const stats = descrever(serie)
              const rotulo = [serie.localidadeNome, ...serie.categoriaLabels].filter(Boolean).join(' / ')
              if (!stats) return null
              return (
                <div key={rotulo} className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                  <p className="font-medium">{rotulo}</p>
                  <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-600 dark:text-slate-300">
                    <dt>Média</dt>
                    <dd>{fmt(stats.media)} {unidade}</dd>
                    <dt>Mediana</dt>
                    <dd>{fmt(stats.mediana)} {unidade}</dd>
                    <dt>Mínimo</dt>
                    <dd>{fmt(stats.minimo)} {unidade}</dd>
                    <dt>Máximo</dt>
                    <dd>{fmt(stats.maximo)} {unidade}</dd>
                    <dt>Amplitude</dt>
                    <dd>{fmt(stats.amplitude)} {unidade}</dd>
                    <dt>Desvio-padrão</dt>
                    <dd>{fmt(stats.desvioPadrao)} {unidade}</dd>
                  </dl>
                </div>
              )
            })}
          </div>
        )}

        {aba === 'comparar' && (
          <ol className="flex flex-col gap-1">
            {compararUltimoValor(series).map((item, i) => (
              <li key={item.rotulo} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-900">
                <span>
                  <span className="mr-2 text-slate-400">#{i + 1}</span>
                  {item.rotulo}
                </span>
                <span className="font-medium">{fmt(item.valor)} {unidade}</span>
              </li>
            ))}
            {series.length < 2 && (
              <p className="text-slate-500">
                Selecione mais de uma série (ex: mais de uma UF) para comparar.
              </p>
            )}
          </ol>
        )}

        {aba === 'evolucao' && (
          <div className="flex flex-col gap-3">
            {series.map((serie) => {
              const evolucao = calcularEvolucao(serie)
              const rotulo = [serie.localidadeNome, ...serie.categoriaLabels].filter(Boolean).join(' / ')
              if (!evolucao) return null
              return (
                <div key={rotulo} className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                  <p className="font-medium">{rotulo}</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    De {evolucao.primeiroPeriodo} ({fmt(evolucao.valorInicial)} {unidade}) a{' '}
                    {evolucao.ultimoPeriodo} ({fmt(evolucao.valorFinal)} {unidade}):{' '}
                    variação de {fmt(evolucao.variacaoAbsoluta)} {unidade} (
                    {fmt(evolucao.variacaoPercentual)}%)
                    {evolucao.cagr !== null && <> · CAGR {fmt(evolucao.cagr)}% ao período</>}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
