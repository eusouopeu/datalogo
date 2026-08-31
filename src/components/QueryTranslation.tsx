import { Calendar, Check, ChevronDown, Code2, Copy, Landmark, Link, MapPin, Search, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FacetSelection, Indicador } from '../types'
import { descreverRequisicao } from '../lib/dados'
import { buscarMunicipios, buscarUfs, type Localidade } from '../lib/ibgeLocalidades'

interface Props {
  indicador: Indicador
  selecao: FacetSelection
  linkCompartilhavel: string
}

/** Cartão de tradução da consulta: resumo em ícones + URL real da API. Accordion fechado por padrão. */
export function QueryTranslation({ indicador, selecao, linkCompartilhavel }: Props) {
  const [aberto, setAberto] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)
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

  const categoriasLabel = indicador.classificacoes
    .map((c) => {
      const categoriaIds = selecao.categorias[c.id] ?? []
      const nomes = categoriaIds.map((id) => c.categorias.find((cat) => cat.id === id)?.nome).filter(Boolean)
      return nomes.join(', ')
    })
    .filter(Boolean)
    .join(' | ')

  const textoCopiavel =
    requisicao.metodo === 'GET'
      ? requisicao.url
      : `${requisicao.url}\n${JSON.stringify(requisicao.corpo, null, 2)}`

  async function copiarUrl() {
    await navigator.clipboard.writeText(textoCopiavel)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  async function compartilharLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: indicador.nome, url: linkCompartilhavel })
        return
      } catch {
        // usuário cancelou o compartilhamento nativo — cai para copiar o link
      }
    }
    await navigator.clipboard.writeText(linkCompartilhavel)
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 1500)
  }

  return (
    <div className="rounded-lg border border-emerald-200 text-left text-sm dark:border-emerald-900">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="flex w-full items-center justify-between gap-2 p-4"
      >
        <span className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-200">
          <Code2 size={16} /> Ver consulta técnica
        </span>
        <ChevronDown size={18} className={`text-emerald-700 transition-transform dark:text-emerald-400 ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="border-t border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex flex-col gap-1.5 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Search size={14} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span>{indicador.pesquisa}</span>
            </div>
            <div className="flex items-center gap-2">
              <Landmark size={14} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span>{indicador.fonte}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span>{localidadeLabel}</span>
            </div>
            {categoriasLabel && (
              <div className="flex items-center gap-2">
                <Users size={14} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
                <span>{categoriasLabel}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span>Últimos {selecao.quantidadePeriodos}</span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2">
            <code className="block flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded bg-white px-2 py-1 text-xs dark:bg-slate-900">
              {requisicao.metodo} {requisicao.url}
              {requisicao.corpo !== undefined && `\n${JSON.stringify(requisicao.corpo, null, 2)}`}
            </code>
            <button
              onClick={copiarUrl}
              aria-label={copiado ? 'Copiado' : 'Copiar consulta'}
              title={copiado ? 'Copiado' : 'Copiar consulta'}
              className="shrink-0 rounded-md border border-emerald-300 p-1.5 hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-900"
            >
              {copiado ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button
              onClick={compartilharLink}
              aria-label={linkCopiado ? 'Link copiado' : 'Compartilhar esta consulta'}
              title={linkCopiado ? 'Link copiado' : 'Compartilhar esta consulta'}
              className="shrink-0 rounded-md border border-emerald-300 p-1.5 hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-900"
            >
              {linkCopiado ? <Check size={16} /> : <Link size={16} />}
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
      )}
    </div>
  )
}
