# Datálogo

Explorador de dados públicos brasileiros que traduz estruturas complexas de
APIs (IBGE) em consultas visuais, sem exigir conhecimento técnico — e sem IA.

**Sem IA. Sem cadastro. Sem servidor.** Os dados são consultados diretamente
na API pública do IBGE e todo o processamento (busca, estatísticas,
comparações) roda localmente no navegador/app, em TypeScript.

## Como funciona

1. **Catálogo semântico** ([src/data/catalog.ts](src/data/catalog.ts)) — cada indicador
   traduz um conceito do mundo real (ex: "taxa de desocupação por idade")
   para os parâmetros reais da API de Agregados do IBGE (SIDRA): agregado,
   variável, classificações e níveis territoriais.
2. **Busca determinística** ([src/lib/search.ts](src/lib/search.ts)) — normaliza
   acentos/plural, casa contra título, sinônimos, descrição e categorias do
   catálogo, e pontua cada correspondência de forma auditável (o "por que
   esse resultado apareceu" fica visível na interface).
3. **Query builder** ([src/components/QueryBuilder.tsx](src/components/QueryBuilder.tsx)) —
   o usuário escolhe localização, categorias e período por botões, sem
   escrever nada.
4. **Tradução da consulta** ([src/components/QueryTranslation.tsx](src/components/QueryTranslation.tsx)) —
   mostra em português o que está sendo consultado e a URL real (`GET`) que
   será enviada à API do IBGE, para transparência e verificação.
5. **Análises locais** ([src/lib/analysis.ts](src/lib/analysis.ts)) — descrever
   (média, mediana, desvio-padrão…), comparar/ranking e evolução (variação,
   CAGR), tudo calculado no dispositivo.

## Indicadores no catálogo (MVP)

- Taxa de desocupação por grupo de idade (PNAD Contínua / ODS 8.5.2)
- IPCA — variação mensal
- População residente estimada

Novos indicadores são adicionados como entradas no catálogo (nenhum código
de UI precisa mudar) — ver a seção "Adicionando um indicador" abaixo.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build para GitHub Pages

O `base` do Vite já está configurado para `/datalogo/` (ajustável via
`VITE_BASE`). Publicação automática está configurada em
[.github/workflows/deploy.yml](.github/workflows/deploy.yml): a cada push em
`main`, o site é publicado em GitHub Pages. Também é possível publicar
manualmente:

```bash
npm run deploy
```

## Build para Capacitor (Android/iOS)

O build para apps nativos precisa do `base` em `/` (Capacitor serve os
arquivos localmente, sem subcaminho):

```bash
npm run build:capacitor
npx cap add android   # ou ios, na primeira vez
npm run cap:sync
```

## Adicionando um indicador ao catálogo

1. Encontre a tabela/agregado desejado na
   [API de Agregados do IBGE](https://servicodados.ibge.gov.br/api/docs/agregados)
   (SIDRA).
2. Confira `GET /api/v3/agregados/{id}/metadados` para pegar os IDs reais de
   variável, classificações, categorias e níveis territoriais suportados.
3. Adicione uma entrada em [src/data/catalog.ts](src/data/catalog.ts) com
   nome, sinônimos, tema (taxonomia) e os IDs confirmados.

A manutenção do catálogo é o único processo manual do projeto — o app não
tem backend, então atualizações de estrutura das APIs do IBGE/BCB/Ipea são
tratadas durante o desenvolvimento, gerando um novo catálogo que é publicado
junto com o site estático.

## Stack

React + TypeScript + Vite + Tailwind CSS + Capacitor + Recharts.
