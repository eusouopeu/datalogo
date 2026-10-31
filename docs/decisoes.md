# Decisões

Quando ler: antes de mudar comportamento já decidido.
Fonte de verdade para: o que já foi decidido no projeto (uma linha por decisão).
Atualizado em: 31/10/2026.

Decisão nova entra no topo, com data e onde está detalhada. Decisão ainda em
aberto fica em [pendencias.md](pendencias.md).

| Data | Decisão | Detalhe em |
|---|---|---|
| 31/10/2026 | CI no GitHub roda tipos e testes em cada push e PR | `.github/workflows/ci.yml` |
| 14/10/2026 | Documentação segue `../_shared/docs-standards.md` | `CLAUDE.md` |
| 02/10/2026 | Favoritos e painéis viram uma lista única de salvos; destaques da tela inicial são os itens fixados | `src/lib/salvos.ts` |
| 02/10/2026 | Cache SWR e "salvar offline" são o mesmo armazenamento; entrada fixada nunca é purgada | `src/lib/armazenamento.ts` |
| 02/10/2026 | Transformações só aparecem quando cabem na periodicidade (acumulado 12m só em mensal; média móvel em mensal ou diária) | `src/lib/transformacoes.ts` |
| 02/10/2026 | Mapa por UF desenhado em SVG a partir da malha do IBGE, sem biblioteca de mapas | `src/components/MapaUf.tsx` |
| 02/10/2026 | Leitura automática por frases determinísticas, sem IA | `src/lib/leitura.ts` |
| 02/10/2026 | Arquivos nativos do widget ficam em `native/android/` e são aplicados sobre a pasta gerada no `cap:sync` | `native/android/` |
| 09/09/2026 | Busca roda ao digitar, 100% local, com tolerância a 1 erro em termos de 5+ letras | `src/lib/search.ts` |
| 01/09/2026 | Navegação por barra inferior só com ícones (Início, Salvos, Ajustes) | `src/App.tsx` |
| 30/08/2026 | Todo indicador entra no catálogo só depois de verificado contra a API real | `src/data/catalog.ts` |
| 30/08/2026 | IPEADATA e DATASUS ficam de fora (IPEA inacessível; DATASUS sem API de séries compatível com app só no cliente) | `README.md` |
| 30/08/2026 | App sem IA e sem backend: catálogo semântico e busca determinística traduzem o pedido em consulta às APIs públicas | `README.md` |
