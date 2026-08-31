import { useEffect, useMemo, useState } from 'react'
import type { FacetSelection, Indicador, SerieResultado } from '../types'
import { buscarSerieIndicador } from './dados'
import { estaExpirado, gravarCache, lerCache, ttlPorPeriodicidade } from './cache'

function chaveCache(indicador: Indicador, selecao: FacetSelection): string {
  return `serie:${indicador.id}:${JSON.stringify(selecao)}`
}

function mensagemErro(motivo: unknown): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.'
  }
  return motivo instanceof Error ? motivo.message : 'Erro desconhecido ao consultar a API.'
}

export interface EstadoSerie {
  series: SerieResultado[] | null
  carregando: boolean
  erro: string | null
  consultadoEm: number | null
  /** true quando a revalidação falhou (ex: sem rede) mas os dados em tela vêm do cache local. */
  desatualizado: boolean
  recarregar: () => void
}

/**
 * Busca a série de um indicador com cache local (SWR: mostra cache e revalida em segundo
 * plano). Compartilhado entre a tela de exploração e a comparação inline de indicadores.
 */
export function useSerie(indicador: Indicador | null, selecao: FacetSelection | null, ativo: boolean): EstadoSerie {
  const [series, setSeries] = useState<SerieResultado[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [consultadoEm, setConsultadoEm] = useState<number | null>(null)
  const [desatualizado, setDesatualizado] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  const chave = useMemo(
    () => (indicador && selecao ? chaveCache(indicador, selecao) : null),
    [indicador, selecao],
  )

  useEffect(() => {
    if (!ativo || !indicador || !selecao || !chave) {
      setSeries(null)
      setErro(null)
      setDesatualizado(false)
      return
    }

    const cache = lerCache<SerieResultado[]>(chave)
    if (cache) {
      setSeries(cache.valor)
      setConsultadoEm(cache.timestamp)
      setErro(null)
      setDesatualizado(false)
    }

    const ttl = ttlPorPeriodicidade(indicador.periodicidade)
    if (cache && !estaExpirado(cache, ttl) && tentativa === 0) {
      return // cache ainda fresco: evita nova requisição
    }

    let cancelado = false
    setCarregando(!cache)
    buscarSerieIndicador(indicador, selecao)
      .then((res) => {
        if (cancelado) return
        setSeries(res)
        setConsultadoEm(Date.now())
        gravarCache(chave, res)
        setErro(null)
        setDesatualizado(false)
      })
      .catch((e) => {
        if (cancelado) return
        if (!cache) setErro(mensagemErro(e))
        // com cache exibido em tela, a revalidação falhou em silêncio — mantém o que já foi mostrado, mas avisa que está desatualizado
        else setDesatualizado(true)
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, ativo, tentativa])

  return { series, carregando, erro, consultadoEm, desatualizado, recarregar: () => setTentativa((t) => t + 1) }
}
