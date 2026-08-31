import type { FacetSelection, Indicador } from '../types'
import { LocalidadeSeletor } from './LocalidadeSeletor'

interface Props {
  indicador: Indicador
  selecao: FacetSelection
  onChange: (selecao: FacetSelection) => void
}

const OPCOES_PERIODOS = [
  { valor: 4, label: 'Últimos 4' },
  { valor: 8, label: 'Últimos 8' },
  { valor: 12, label: 'Últimos 12' },
  { valor: 20, label: 'Últimos 20' },
]

const LABEL_PERIODICIDADE: Record<Indicador['periodicidade'], string> = {
  diaria: 'diária',
  mensal: 'mensal',
  trimestral: 'trimestral',
  anual: 'anual',
}

export function QueryBuilder({ indicador, selecao, onChange }: Props) {
  const nivelAtual = indicador.niveisTerritoriais.find((n) => n.nivel === selecao.nivelTerritorial)

  function alternarCategoria(classificacaoId: string, categoriaId: string) {
    const atuais = selecao.categorias[classificacaoId] ?? []
    const novas = atuais.includes(categoriaId)
      ? atuais.filter((c) => c !== categoriaId)
      : [...atuais, categoriaId]
    onChange({ ...selecao, categorias: { ...selecao.categorias, [classificacaoId]: novas } })
  }

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-slate-200 p-5 text-left dark:border-slate-800">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Localização {nivelAtual?.requerSelecao && '(selecione uma ou mais para comparar)'}
        </label>
        <div className="flex flex-wrap gap-2">
          {indicador.niveisTerritoriais.map((n) => (
            <button
              key={n.nivel}
              onClick={() =>
                onChange({
                  ...selecao,
                  nivelTerritorial: n.nivel,
                  codigosTerritoriais: n.requerSelecao ? selecao.codigosTerritoriais : [],
                })
              }
              className={`rounded-full px-4 py-1.5 text-sm ${
                selecao.nivelTerritorial === n.nivel
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
        {nivelAtual?.requerSelecao && (nivelAtual.nivel === 'N3' || nivelAtual.nivel === 'N6') && (
          <LocalidadeSeletor
            nivel={nivelAtual.nivel}
            selecionados={selecao.codigosTerritoriais}
            onChange={(ids) => onChange({ ...selecao, codigosTerritoriais: ids })}
          />
        )}
      </div>

      {indicador.classificacoes.map((classificacao) => (
        <div key={classificacao.id}>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {classificacao.nome}
          </label>
          <div className="flex flex-wrap gap-2">
            {classificacao.categorias.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => alternarCategoria(classificacao.id, categoria.id)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  (selecao.categorias[classificacao.id] ?? []).includes(categoria.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {categoria.nome}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Período ({LABEL_PERIODICIDADE[indicador.periodicidade]})
        </label>
        <div className="flex flex-wrap gap-2">
          {OPCOES_PERIODOS.map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => onChange({ ...selecao, quantidadePeriodos: opcao.valor })}
              className={`rounded-full px-4 py-1.5 text-sm ${
                selecao.quantidadePeriodos === opcao.valor
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
