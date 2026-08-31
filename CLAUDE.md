# Datálogo — instruções do projeto

## Stack e padrões de UI

- Sempre usar **TypeScript** (nunca `.js`/`.jsx` para código novo).
- Sempre usar **Tailwind CSS** para estilização (evitar CSS solto ou inline styles).
- Sempre usar **lucide-react** para ícones.
- Fonte tipográfica: **Montserrat**, com `line-height: 1.5` (`leading-[1.5]` ou equivalente no Tailwind).
- Dar preferência a **botões-ícone** em vez de botões com texto, sempre que o ícone comunicar a ação com clareza.

## Comunicação

- Sempre usar o modo `/caveman` nas respostas.

## Testes

- Cada rodada de mudanças deve rodar apenas os **2 ou 3 testes mais essenciais** — não mais que isso.
- Os testes devem ser **elaborados antes** de implementar as alterações de código, para que não fiquem enviesados pela implementação.

## Entrega

Sempre que houver alteração no código do app, ao final da tarefa:

1. **Commit e push** das mudanças para o repositório no GitHub.
2. **Gerar um APK atualizado** para instalação no celular:
   ```bash
   npm run cap:sync
   cd android && ./gradlew assembleDebug && cd ..
   cp android/app/build/outputs/apk/debug/app-debug.apk datalogo-debug.apk
   ```
   O APK final fica em `datalogo-debug.apk`, na raiz do projeto (arquivo ignorado pelo git — é só para instalação manual, não entra no repositório).
