import { useEffect, useState } from 'react'

export type Tema = 'light' | 'dark'

const CHAVE_STORAGE = 'datalogo-theme'

function temaAtual(): Tema {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle('dark', tema === 'dark')
  localStorage.setItem(CHAVE_STORAGE, tema)
}

/** Estado do tema claro/escuro, sincronizado com a classe `.dark` na raiz e persistido no dispositivo. */
export function useTheme() {
  const [tema, setTema] = useState<Tema>(() => temaAtual())

  useEffect(() => {
    aplicarTema(tema)
  }, [tema])

  function alternar() {
    setTema((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return { tema, alternar }
}
