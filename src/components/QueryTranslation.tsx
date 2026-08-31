import { Check, Copy } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import type { FacetSelection, Indicador } from '../types'
import { descreverRequisicao } from '../lib/dados'
import { buscarMunicipios, buscarUfs, type Localidade } from '../lib/ibgeLocalidades'

interface Props {
  indicador: Indicador
  selecao: FacetSelection
}

export function QueryTranslation({ indicador, selecao }: Props) {
  const [copiado, setCopiado] = useState(false)
  const [localidades, setLocalidades] = useState<Localidade[]>([])
  const requisicao = descreverRequisicao(indicador, selecao)

  useEffect(() => {
    if (selecao.nivelTerritorial === 'N3') buscarUfs().then(setLocalidades)
    else if (selecao.nivelTerritorial === 'N6') buscarMunicipios().then(setLocalidades)
    // Para N1/N2 a lista não é usada (localidadeLabel resolve para "Brasil" antes de lê-la).
  }, [selecao.nivelTerritorial])

  const localidadeLabel =
    selecao.nivelTerritorial === 'N1'
      ? 'Brasil'
      : selecao.codigosTerritoriais.length === 0
        ? 'nenhuma selecionada'
        : selecao.codigosTerritoriais
            .map((id) => localidades.find((l) => l.id === id)?.nome ?? id)
            .join(', ')

  const linhasClassificacao = indicador.classificacoes.map((c) => {
    const categoriaIds = selecao.categorias[c.id] ?? []
    const nomes = categoriaIds
      .map((id) => c.categorias.find((cat) => cat.id === id)?.nome)
      .filter(Boolean)
    return { nome: c.nome, valor: nomes.length > 0 ? nomes.join(', ') : 'não selecionado' }
  })

  const textoCopiavel =
    requisicao.metodo === 'GET'
      ? requisicao.url
      : `${requisicao.url}\n${JSON.stringify(requisicao.corpo, null, 2)}`

  async function copiarUrl() {
    await navigator.clipboard.writeText(textoCopiavel)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-left text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
      <p className="font-semibold text-emerald-800 dark:text-emerald-300">Você está consultando:</p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-slate-500">Fonte</dt>
        <dd>{indicador.fonte}</dd>
        <dt className="text-slate-500">Pesquisa</dt>
        <dd>{indicador.pesquisa}</dd>
        <dt className="text-slate-500">Indicador</dt>
        <dd>{indicador.nome}</dd>
        <dt className="text-slate-500">Localização</dt>
        <dd>{localidadeLabel}</dd>
        {linhasClassificacao.map((l) => (
          <Fragment key={l.nome}>
            <dt className="text-slate-500">{l.nome}</dt>
            <dd>{l.valor}</dd>
          </Fragment>
        ))}
        <dt className="text-slate-500">Período</dt>
        <dd>últimos {selecao.quantidadePeriodos}</dd>
      </dl>

      <p className="mt-3 font-semibold text-emerald-800 dark:text-emerald-300">
        Consulta oficial (API do {indicador.fonte}):
      </p>
      <div className="mt-1 flex items-start gap-2">
        <code className="block flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded bg-white px-2 py-1 text-xs dark:bg-slate-900">
          {requisicao.metodo} {requisicao.url}
          {requisicao.corpo !== undefined && `\n${JSON.stringify(requisicao.corpo, null, 2)}`}
        </code>
        <button
          onClick={copiarUrl}
          aria-label={copiado ? 'Copiado' : 'Copiar'}
          title={copiado ? 'Copiado' : 'Copiar'}
          className="shrink-0 rounded-md border border-emerald-300 p-1.5 hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-900"
        >
          {copiado ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <a
        href={indicador.fonteUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-xs text-emerald-700 underline dark:text-emerald-400"
      >
        Ver fonte original ({indicador.fonte})
      </a>
    </div>
  )
}
