import { HardDriveDownload, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CATALOGO } from '../data/catalog'
import { indicadorIdDaChave, listarChavesOffline, removerOffline } from '../lib/offline'
import type { Indicador } from '../types'

interface ItemOffline {
  chave: string
  indicador: Indicador
}

function carregarItensOffline(): ItemOffline[] {
  return listarChavesOffline()
    .map((chave) => {
      const indicador = CATALOGO.find((i) => i.id === indicadorIdDaChave(chave))
      return indicador ? { chave, indicador } : null
    })
    .filter((item): item is ItemOffline => item !== null)
}

/** Aba Ajustes: gerencia o que foi salvo para uso offline, além das informações sobre fontes de dados. */
export function AjustesView() {
  const [itens, setItens] = useState<ItemOffline[]>(() => carregarItensOffline())

  useEffect(() => {
    setItens(carregarItensOffline())
  }, [])

  function remover(chave: string) {
    removerOffline(chave)
    setItens((atuais) => atuais.filter((item) => item.chave !== chave))
  }

  function removerTudo() {
    itens.forEach((item) => removerOffline(item.chave))
    setItens([])
  }

  return (
    <div className="flex flex-col gap-6 text-sm text-slate-500 dark:text-slate-400">
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
