import { Capacitor } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

function baixarNoNavegador(nomeArquivo: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Salva o CSV: baixa direto no navegador, ou grava em cache + abre o menu de compartilhar no app nativo. */
export async function salvarCsv(nomeArquivo: string, conteudo: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    baixarNoNavegador(nomeArquivo, conteudo)
    return
  }

  await Filesystem.writeFile({
    path: nomeArquivo,
    data: conteudo,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  })
  const { uri } = await Filesystem.getUri({ path: nomeArquivo, directory: Directory.Cache })
  await Share.share({ title: nomeArquivo, url: uri })
}
