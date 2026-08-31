import { Capacitor } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

function baixarNoNavegador(nomeArquivo: string, blob: Blob) {
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
    baixarNoNavegador(nomeArquivo, new Blob([conteudo], { type: 'text/csv;charset=utf-8;' }))
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

/** Serializa o `<svg>` do gráfico (recharts) em PNG, respeitando o tema atual (fundo sólido). */
export async function svgParaPngDataUrl(svg: SVGSVGElement, fundoCor: string): Promise<string> {
  const { width, height } = svg.getBoundingClientRect()
  const escala = 2 // resolução maior para telas retina
  const serializado = new XMLSerializer().serializeToString(svg)
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializado)}`

  const imagem = new Image()
  await new Promise<void>((resolve, reject) => {
    imagem.onload = () => resolve()
    imagem.onerror = () => reject(new Error('Falha ao renderizar o gráfico como imagem.'))
    imagem.src = svgDataUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = width * escala
  canvas.height = height * escala
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível neste ambiente.')
  ctx.fillStyle = fundoCor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.scale(escala, escala)
  ctx.drawImage(imagem, 0, 0, width, height)

  return canvas.toDataURL('image/png')
}

/** Salva o PNG do gráfico: baixa direto no navegador, ou grava em cache + abre o menu de compartilhar no app nativo. */
export async function salvarImagemPng(nomeArquivo: string, dataUrl: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    const resposta = await fetch(dataUrl)
    baixarNoNavegador(nomeArquivo, await resposta.blob())
    return
  }

  const base64 = dataUrl.split(',')[1]
  await Filesystem.writeFile({
    path: nomeArquivo,
    data: base64,
    directory: Directory.Cache,
  })
  const { uri } = await Filesystem.getUri({ path: nomeArquivo, directory: Directory.Cache })
  await Share.share({ title: nomeArquivo, url: uri })
}
