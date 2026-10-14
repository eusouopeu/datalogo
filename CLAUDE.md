# Datálogo — instruções permanentes

Explorador de dados públicos brasileiros (IBGE/SIDRA, Banco Central/SGS) em
consultas visuais. Sem IA, sem cadastro, sem servidor: tudo roda no aparelho.
Visão geral e mapa do código no `README.md`, "Como funciona".

Leia somente os documentos pertinentes à tarefa; não carregue documentação ou
arquivos grandes por padrão.

## Padrões compartilhados

Segue `../_shared/tech-standards.md` (stack, testes, commit/push/release,
`/caveman`, subagentes, dependências), `../_shared/design-standards.md`,
`../_shared/minimalismo.md` e `../_shared/docs-standards.md`.
Exceções deste projeto:

- Ícones: **lucide-react**, não Heroicons — divergência conhecida e aceita por
  ora; migrar só quando este projeto for tratado individualmente.
- "Ajuda recolhida" (`../_shared/minimalismo.md`): aplicar quando uma tela for
  tocada e tiver texto explicativo permanente que possa confundir o usuário —
  ainda não há candidato específico mapeado.

## Regras invioláveis

- Sem IA e sem servidor: busca, estatísticas e comparações são
  determinísticas e locais (`src/lib/search.ts`, `src/lib/analysis.ts`).
- Indicador novo entra no catálogo semântico (`src/data/catalog.ts`) com o
  campo `origem`; o roteador `src/lib/dados.ts` escolhe o cliente.

## Fluxo de trabalho

- Faça a menor alteração completa; não faça refactor não relacionado.
- Antes de propor melhorias ou recriar algo, consulte
  `docs/feature-status.md` ("Não reimplementar") e `docs/aprimoramentos.md`
  ("Recomendações refutadas").
- Build do APK:
  ```bash
  npm run cap:sync
  cd android && ./gradlew assembleDebug && cd ..
  cp android/app/build/outputs/apk/debug/app-debug.apk datalogo-debug.apk
  ```
  O APK fica em `datalogo-debug.apk`, na raiz (ignorado pelo git).

## Fim de sessão

Antes do commit, atualizar: `docs/decisoes.md` (decisão nova no topo),
`docs/pendencias.md`, `docs/feature-status.md` se uma funcionalidade visível
mudou e `docs/aprimoramentos.md` se uma melhoria foi entregue ou recusada.

## Atualização desta documentação

- `CLAUDE.md` só muda quando uma regra global do projeto muda.
- Detalhe de domínio ou implementação vai para `docs/<tema>.md` ou `README.md`.

## Navegação

| Arquivo | Quando ler |
|---|---|
| `README.md` | Arquitetura e fluxo da consulta |
| `docs/decisoes.md` | Antes de mudar comportamento já decidido |
| `docs/pendencias.md` | Ao retomar o projeto ou propor próximos passos |
| `docs/feature-status.md` | Antes de criar ou remover funcionalidade |
| `docs/aprimoramentos.md` | Antes de sugerir melhorias |
