# Datálogo

Explorador de dados públicos brasileiros que traduz estruturas complexas de
APIs (IBGE, Banco Central) em consultas visuais, sem exigir conhecimento
técnico — e sem IA.

**Sem IA. Sem cadastro. Sem servidor.** Os dados são consultados diretamente
nas APIs públicas e todo o processamento (busca, estatísticas, comparações)
roda localmente no navegador/app, em TypeScript.

## Como funciona

1. **Catálogo semântico** ([src/data/catalog.ts](src/data/catalog.ts)) — cada indicador
   traduz um conceito do mundo real (ex: "taxa de desocupação por idade")
   para os parâmetros reais de uma API pública: agregado/variável/classificação
   da API de Agregados do IBGE (SIDRA), ou código de série da API de Séries
   Temporais do Banco Central (SGS). Um roteador
   ([src/lib/dados.ts](src/lib/dados.ts)) direciona cada indicador para o
   cliente correto conforme o campo `origem`.
2. **Busca determinística** ([src/lib/search.ts](src/lib/search.ts)) — normaliza
   acentos/plural, casa contra título, sinônimos, descrição e categorias do
   catálogo, e pontua cada correspondência de forma auditável (o "por que
   esse resultado apareceu" fica visível na interface).
3. **Query builder** ([src/components/QueryBuilder.tsx](src/components/QueryBuilder.tsx)) —
   o usuário escolhe localização, categorias e período por botões, sem
   escrever nada.
4. **Tradução da consulta** ([src/components/QueryTranslation.tsx](src/components/QueryTranslation.tsx)) —
   mostra em português o que está sendo consultado e a URL real (`GET`) que
   será enviada à API de origem, para transparência e verificação.
5. **Análises locais** ([src/lib/analysis.ts](src/lib/analysis.ts)) — descrever
   (média, mediana, desvio-padrão…), comparar/ranking e evolução (variação,
   CAGR), tudo calculado no dispositivo.
6. **Leitura automática** ([src/lib/leitura.ts](src/lib/leitura.ts)) — frases em
   português geradas por regra (último valor, variação sobre o período anterior,
   extremo da janela e posição frente à média), exibidas acima do gráfico. Sem IA:
   é cálculo determinístico sobre os pontos da série.
7. **Mapa por UF** ([src/components/MapaUf.tsx](src/components/MapaUf.tsx)) — mapa
   coroplético desenhado a partir da malha oficial do IBGE
   ([src/lib/malhaUf.ts](src/lib/malhaUf.ts)), projetada em SVG no próprio app, sem
   biblioteca de mapas. Aparece como visualização quando a consulta é por UF.
8. **Salvos** ([src/lib/salvos.ts](src/lib/salvos.ts)) — lista única de indicador +
   filtros (substitui os antigos "favoritos" e "painéis"). Um item salvo pode ser
   fixado para aparecer nos destaques da tela inicial e no widget do Android.
9. **Aviso de dado novo** ([src/lib/novidades.ts](src/lib/novidades.ts)) — compara o
   último período devolvido pela API com o último já visto pelo usuário e marca um
   ponto verde no card. Sem servidor e sem push.
10. **Armazenamento local único** ([src/lib/armazenamento.ts](src/lib/armazenamento.ts)) —
   cache SWR e "salvar para uso offline" são o mesmo mecanismo: a entrada fixada
   nunca é purgada por idade nem apagada ao limpar o cache. A aba Ajustes mostra o
   espaço ocupado e permite limpar.
11. **Tema claro/escuro** ([src/lib/theme.ts](src/lib/theme.ts)) — segue o
   sistema por padrão, alternável pelo botão-ícone no cabeçalho e persistido
   em `localStorage`; aplicado antes do primeiro paint (script inline em
   [index.html](index.html)) para não piscar.

## Indicadores no catálogo (MVP)

**IBGE** (API de Agregados/SIDRA):
- Taxa de desocupação por grupo de idade (PNAD Contínua / ODS 8.5.2)
- IPCA — variação mensal
- População residente estimada

**Banco Central** (API de Séries Temporais/SGS):
- Taxa de câmbio — Dólar americano (venda)
- Meta da taxa Selic definida pelo Copom
- IGP-M — variação mensal
- IBC-Br — atividade econômica (índice dessazonalizado)
- PIB trimestral — índice dessazonalizado
- Dívida bruta do governo geral (% do PIB)
- Reservas internacionais
- Inadimplência da carteira de crédito total

Novos indicadores são adicionados como entradas no catálogo (nenhum código
de UI precisa mudar) — ver a seção "Adicionando um indicador" abaixo.

### Sobre IPEA e DATASUS

Foram avaliados para esta expansão e não entraram, por motivos técnicos (não
por falta de dados públicos):

- **IPEA** (`ipeadata.gov.br`): o servidor não respondeu em nenhuma tentativa
  de verificação (timeout de conexão) — sem conseguir confirmar os códigos
  reais das séries, não há como montar entradas confiáveis no catálogo. Vale
  reavaliar quando o serviço estiver estável; muitas séries macro do IPEA já
  são cobertas, na prática, pelas séries do Banco Central adicionadas aqui.
- **DATASUS**: não tem uma API REST de séries temporais equivalente à do
  IBGE/BCB. O TABNET (`tabnet.datasus.gov.br`) responde, mas devolve HTML sem
  cabeçalho CORS — o navegador bloqueia a leitura da resposta em uma
  aplicação 100% client-side, sem backend. O Portal de Dados Abertos do SUS
  também é um catálogo de datasets para download, não uma API de consulta
  parametrizada.

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

**IBGE (SIDRA):**
1. Encontre a tabela/agregado desejado na
   [API de Agregados do IBGE](https://servicodados.ibge.gov.br/api/docs/agregados).
2. Confira `GET /api/v3/agregados/{id}/metadados` para pegar os IDs reais de
   variável, classificações, categorias e níveis territoriais suportados.
3. Adicione uma entrada com `origem: 'IBGE'` em
   [src/data/catalog.ts](src/data/catalog.ts).

**Banco Central (SGS):**
1. Encontre o código da série no
   [catálogo de séries do SGS](https://www3.bcb.gov.br/sgspub/localizarseries/localizarSeries.do?method=prepararTelaLocalizarSeries).
2. Confira `GET https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados/ultimos/5?formato=json`
   para validar que a série responde e entender a unidade dos valores.
3. Adicione uma entrada com `origem: 'BCB'` em
   [src/data/catalog.ts](src/data/catalog.ts).

Em ambos os casos: nome, sinônimos e tema (taxonomia) ficam a critério de
quem mantém o catálogo — só os IDs/códigos precisam ser verificados contra a
API real antes de entrar.

A manutenção do catálogo é o único processo manual do projeto — o app não
tem backend, então atualizações de estrutura das APIs de origem são tratadas
durante o desenvolvimento, gerando um novo catálogo que é publicado junto
com o site estático.

## Widget do Android

Os arquivos nativos escritos à mão ficam em [native/android/](native/android) —
a pasta `android/` é gerada pelo Capacitor e não entra no git. O script
`npm run cap:sync` copia `native/android/` por cima de `android/` antes do sync.

O app publica os indicadores fixados em `SharedPreferences` (via
`@capacitor/preferences`, chave `datalogo-widget`) e um `AppWidgetProvider`
([android/app/src/main/java/br/com/datalogo/app/DatalogoWidget.java](android/app/src/main/java/br/com/datalogo/app/DatalogoWidget.java))
lê essa chave para desenhar o widget da tela inicial. O widget não faz rede:
mostra o último valor que o app publicou, atualizado quando o app sai de foco
e a cada ciclo do `updatePeriodMillis`.

## Stack

React + TypeScript + Vite + Tailwind CSS + Capacitor + Recharts.
