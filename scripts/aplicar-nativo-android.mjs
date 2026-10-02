// A pasta android/ é gerada por `npx cap add android` e fica fora do git. Os arquivos
// nativos escritos à mão (widget da tela inicial e o MainActivity que o atualiza) vivem
// em native/android/ e são copiados por cima a cada sync.
import { cp, access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const origem = resolve(raiz, 'native/android')
const destino = resolve(raiz, 'android')

try {
  await access(destino)
} catch {
  console.log('[nativo] pasta android/ ausente — rode `npx cap add android` antes do sync.')
  process.exit(0)
}

await cp(origem, destino, { recursive: true, force: true })
console.log('[nativo] arquivos nativos de native/android/ aplicados em android/')
