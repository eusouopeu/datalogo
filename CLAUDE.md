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
