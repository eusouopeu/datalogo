import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CATALOGO } from '../data/catalog'
import { buscarSerieIndicador } from '../lib/dados'
import { selecaoInicial } from '../lib/facets'
import { alinharPorPeriodo, normalizarBase100 } from '../lib/comparacao'

interface Props {
  onVoltar: () => void
}

// Comparar dois indicadores só faz sentido de cara para os que já respondem no nível Brasil
// (sem exigir escolher UF/município primeiro).
const ELEGIVEIS = CATALOGO.filter((i) => !i.niveisTerritoriais[0].requerSelecao)

const ID_A_PADRAO = ELEGIVEIS[0]?.id ?? ''
// Períodos só se alinham de verdade entre indicadores de mesma periodicidade (ex: dois anuais).
// Combinar anual com mensal ainda funciona, mas o gráfico fica majoritariamente vazio de um lado.
const ID_B_PADRAO =
  ELEGIVEIS.find((i) => i.id !== ID_A_PADRAO && i.periodicidade === ELEGIVEIS[0]?.periodicidade)?.id ??
  ELEGIVEIS[1]?.id ??
  ID_A_PADRAO

interface PontoGrafico {
  periodo: string
  a: number | null
  b: number | null
  aOriginal: number | null
  bOriginal: number | null
}

export function CompareView({ onVoltar }: Props) {
  const [idA, setIdA] = useState(ID_A_PADRAO)
  const [idB, setIdB] = useState(ID_B_PADRAO)
  const [pontos, setPontos] = useState<PontoGrafico[] | null>(null)
  const [parResolvido, setParResolvido] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const indicadorA = CATALOGO.find((i) => i.id === idA)
  const indicadorB = CATALOGO.find((i) => i.id === idB)
  const parAtual = `${idA}:${idB}`
  const carregando = parResolvido !== parAtual
  const periodicidadesDivergem = indicadorA && indicadorB && indicadorA.periodicidade !== indicadorB.periodicidade

  useEffect(() => {
    if (!indicadorA || !indicadorB) return
    let cancelado = false
    Promise.all([
      buscarSerieIndicador(indicadorA, selecaoInicial(indicadorA)),
      buscarSerieIndicador(indicadorB, selecaoInicial(indicadorB)),
    ])
      .then(([seriesA, seriesB]) => {
        if (cancelado) return
        const alinhado = alinharPorPeriodo(seriesA[0], seriesB[0])
        const baseA = normalizarBase100(alinhado.map((p) => ({ periodo: p.periodo, valor: p.a })))
        const baseB = normalizarBase100(alinhado.map((p) => ({ periodo: p.periodo, valor: p.b })))
        setPontos(
          alinhado.map((p, i) => ({
            periodo: p.periodo,
            a: baseA[i].valor,
            b: baseB[i].valor,
            aOriginal: p.a,
            bOriginal: p.b,
          })),
        )
        setErro(null)
        setParResolvido(parAtual)
      })
      .catch((e) => {
        if (cancelado) return
        setErro(e instanceof Error ? e.message : 'Erro ao consultar as APIs.')
        setParResolvido(parAtual)
      })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parAtual, indicadorA, indicadorB])

  return (
    <div className="flex flex-col gap-5 text-left">
      <button
        onClick={onVoltar}
        aria-label="Voltar para a busca"
        title="Voltar para a busca"
        className="w-fit rounded-md p-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
      >
        <ArrowLeft size={20} />
      </button>

      <div>
        <h2 className="text-xl font-semibold">Comparar indicadores</h2>
        <p className="text-sm text-slate-500">
          Ambas as séries são reescaladas para base 100 no primeiro período em comum, para comparar
          indicadores com unidades diferentes num mesmo eixo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={idA}
          onChange={(e) => setIdA(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        >
          {ELEGIVEIS.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nome}
            </option>
          ))}
        </select>
        <select
          value={idB}
          onChange={(e) => setIdB(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        >
          {ELEGIVEIS.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nome}
            </option>
          ))}
        </select>
      </div>

      {periodicidadesDivergem && !carregando && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Esses dois indicadores têm periodicidades diferentes ({indicadorA?.periodicidade} vs{' '}
          {indicadorB?.periodicidade}) — os períodos podem não coincidir, deixando trechos do gráfico
          incompletos de um dos lados.
        </p>
      )}

      {carregando && <p className="text-sm text-slate-500">Consultando as duas APIs…</p>}
      {!carregando && erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}

      {pontos && !carregando && indicadorA && indicadorB && (
        <div className="h-80 w-full rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pontos}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'base 100', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip
                formatter={(valor, chave, item) => {
                  const numero = typeof valor === 'number' ? valor : Number(valor)
                  const original = chave === 'a' ? item.payload.aOriginal : item.payload.bOriginal
                  const unidade = chave === 'a' ? indicadorA.unidade : indicadorB.unidade
                  return [
                    `${numero.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} (base 100) · valor real: ${
                      original !== null ? original.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—'
                    } ${unidade}`,
                    chave === 'a' ? indicadorA.nome : indicadorB.nome,
                  ]
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(chave) => (chave === 'a' ? indicadorA.nome : indicadorB.nome)}
              />
              <Line type="monotone" dataKey="a" stroke="#059669" connectNulls dot={{ r: 3 }} />
              <Line type="monotone" dataKey="b" stroke="#2563eb" connectNulls dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
