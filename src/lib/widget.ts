import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

/** Um item do widget da tela inicial do Android. */
export interface ItemWidget {
  nome: string
  valor: string
  periodo: string
}

/** Chave lida pelo widget nativo em SharedPreferences (grupo padrão do Capacitor Preferences). */
const CHAVE = 'datalogo-widget'
const MAX_ITENS = 4

/**
 * Publica os destaques para o widget nativo da tela inicial. No navegador não faz nada:
 * o widget só existe no app Android, que lê esta chave em SharedPreferences.
 */
export async function publicarWidget(itens: ItemWidget[]): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  const payload = {
    atualizadoEm: Date.now(),
    itens: itens.slice(0, MAX_ITENS),
  }
  try {
    await Preferences.set({ key: CHAVE, value: JSON.stringify(payload) })
  } catch {
    // sem armazenamento nativo disponível: o widget segue mostrando o último dado publicado.
  }
}
