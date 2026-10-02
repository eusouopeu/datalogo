import { Eraser, HardDriveDownload, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CATALOGO } from '../data/catalog'
import {
  limparNaoFixados,
  listarChavesFixadas,
  removerFixado,
  tamanhoArmazenamentoBytes,
} from '../lib/armazenamento'
import { indicadorIdDaChave } from '../lib/useSerie'
import type { Indicador } from '../types'

interface ItemOffline {
  chave: string
  indicador: Indicador
}

function carregarItensOffline(): ItemOffline[] {
  return listarChavesFixadas()
    .map((chave) => {
      const indicador = CATALOGO.find((i) => i.id === indicadorIdDaChave(chave))
      return indicador ? { chave, indicador } : null
    })
    .filter((item): item is ItemOffline => item !== null)
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} KB`
  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`
}

/** Aba Ajustes: espaço ocupado, limpeza do cache, dados fixados para uso offline e fontes. */
export function AjustesView() {
  const [itens, setItens] = useState<ItemOffline[]>(() => carregarItensOffline())
  const [tamanho, setTamanho] = useState(() => tamanhoArmazenamentoBytes())

  useEffect(() => {
    setItens(carregarItensOffline())
    setTamanho(tamanhoArmazenamentoBytes())
  }, [])

  function remover(chave: string) {
    removerFixado(chave)
    setItens((atuais) => atuais.filter((item) => item.chave !== chave))
    setTamanho(tamanhoArmazenamentoBytes())
  }

  function removerTudo() {
    itens.forEach((item) => removerFixado(item.chave))
    setItens([])
    setTamanho(tamanhoArmazenamentoBytes())
  }

  function limparCache() {
    limparNaoFixados()
    setTamanho(tamanhoArmazenamentoBytes())
  }

  return (
    <div className="flex flex-col gap-6 text-sm text-slate-500 dark:text-slate-400">
      <div className="flex items-center justify-between gap-2">
        <p>
          Dados guardados no dispositivo: <span className="font-medium text-slate-700 dark:text-slate-300">{formatarTamanho(tamanho)}</span>
        </p>
        <button
          onClick={limparCache}
          aria-label="Limpar cache (mantém o que está salvo para uso offline)"
          title="Limpar cache (mantém o que está salvo para uso offline)"
          className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Eraser size={16} />
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <HardDriveDownload size={14} /> Salvos para uso offline
          </p>
          {itens.length > 0 && (
            <button
              onClick={removerTudo}
              aria-label="Remover todos os dados offline"
              title="Remover todos os dados offline"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {itens.length === 0 && (
          <p>
            Nenhum indicador salvo para uso offline. No gráfico de um indicador, use o botão de download para
            guardá-lo no dispositivo.
          </p>
        )}

        {itens.length > 0 && (
          <ul className="flex flex-col gap-2">
            {itens.map((item) => (
              <li
                key={item.chave}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
              >
                <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-300">
                  {item.indicador.nome}
                </span>
                <button
                  onClick={() => remover(item.chave)}
                  aria-label={`Remover ${item.indicador.nome} do uso offline`}
                  title="Remover do uso offline"
                  className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p>
          Dados: IBGE (SIDRA), Banco Central (SGS), Tesouro Nacional (SICONFI) e Comex Stat (MDIC). Cálculos
          executados localmente em TypeScript.
        </p>
        <p>Sem IA. Sem cadastro. Sem servidor.</p>
      </div>
    </div>
  )
}
