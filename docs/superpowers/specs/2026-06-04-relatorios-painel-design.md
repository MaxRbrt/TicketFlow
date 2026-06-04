# TicketFlow — Aba de Relatórios + Aperfeiçoamento do Painel (Design)

**Data:** 2026-06-04
**Branch:** `melhorias-seguranca-perf-testes`
**Perfil-alvo:** Suporte (`support`)

---

## 1. Objetivo

Adicionar uma aba de **Relatórios** para o perfil de suporte, com métricas derivadas
dos chamados que o suporte já enxerga (escopo por `sessionSupportId`), e **aperfeiçoar
o Painel do suporte** com mini-métricas de resumo + polish visual.

Os relatórios respondem perguntas operacionais: qual setor dá mais problema, como o
volume evolui no tempo, quão rápido o suporte resolve, qual a saúde da fila e quem
mais abre chamados.

Métricas escolhidas (5):

1. **Volume no tempo** (mensal/trimestral) — gráfico de linha/área.
2. **Por setor/local** — gráfico de barras.
3. **Tempo médio de resolução** — KPI (`resolvedAt − createdAt`).
4. **Taxa de resolução / backlog** — KPI (% resolvidos vs. em aberto).
5. **Top solicitantes** — ranking.

Fora de escopo nesta entrega: por categoria, por status, por prioridade (podem entrar
depois sem mudar a arquitetura).

---

## 2. Decisões já tomadas

| Tema | Decisão |
|---|---|
| Rota | Nova `/suporte/relatorios` (só suporte; guard auth + perfil) |
| Período | Presets fixos: **Este mês / Último trimestre / Este ano / Tudo** |
| Painel | Polish visual + mini-métricas (tempo médio + sparkline de volume) + link |
| Gráficos | **Chart.js** + `vue-chartjs`, tematizado para o tema Twilight |
| Fonte de dados | **Reusar o listener único do suporte** (`useNotificacaoSuporte().todos`) — zero leitura nova, zero índice, realtime |

---

## 3. Arquitetura e fluxo de dados

```
useNotificacaoSuporte().todos   (lista realtime já transmitida — singleton do #8)
        │
        ▼
useRelatorios.js  (composable)
  - periodo: ref ('mes' | 'trimestre' | 'ano' | 'tudo')
  - chamadosFiltrados = computed(filtrarPorPeriodo(todos, periodo))
  - métricas = computed(...) delegando para utils/relatorios.js
        │
        ▼
Relatorios.vue  +  faixa de resumo no PainelSuporte.vue
        │
        ▼
componentes/relatorios/*  (SeletorPeriodo, GraficoLinha, GraficoBarra, CartaoKpi, RankingLista)
```

**Princípio:** a agregação vive em funções **puras** (`utils/relatorios.js`), o composable
apenas as conecta de forma reativa. Isso mantém a lógica testável (Vitest, alinhado ao
#6) e os componentes burros (só renderizam).

Não há nova query nem índice Firestore: o suporte já transmite todos os seus chamados
via a escuta única criada no #8. O filtro de período é client-side sobre a lista em
memória.

---

## 4. Camada de dados

### 4.1 `utils/relatorios.js` (funções puras)

Todas recebem um array de chamados (`tickets`) e retornam dados agregados. Não mutam a
entrada.

- `filtrarPorPeriodo(chamados, periodo, agora = new Date())`
  Retorna os chamados cujo `createdAt` cai no período. `'tudo'` retorna todos.
  Limites (local time):
  - `'mes'`: do dia 1 do mês atual até agora.
  - `'trimestre'`: dos últimos 3 meses (90 dias corridos a partir de hoje, início do dia).
  - `'ano'`: do dia 1 de janeiro do ano atual até agora.

- `volumePorPeriodo(chamados, periodo)`
  Granularidade **adaptativa** ao período (evita linha de 1 ponto só):
  - `'mes'` → bucket por **dia** (`YYYY-MM-DD`), label "dd/mm".
  - `'trimestre'` → bucket por **mês** (~3 pontos), label "mmm/aa".
  - `'ano'` → bucket por **mês** (até 12 pontos), label "mmm/aa".
  - `'tudo'` → bucket por **mês**, label "mmm/aa".
  Retorna `{ labels: string[], data: number[] }` ordenado cronologicamente. Buckets sem
  chamados no intervalo contam 0 (linha contínua). Implementar com um helper interno
  `chaveBucket(data, granularidade)` para manter a função enxuta.

- `agruparPorSetor(chamados, topN = 5)`
  Agrupa por `location` (normaliza vazio/`null`/só-espaços → `"Não informado"`).
  Conta, ordena desc, mantém top N e agrega o resto em `"Outros"`.
  Retorna `{ labels, data }`.

- `tempoMedioResolucao(chamados)`
  Considera apenas chamados com `status === 'resolved'` **e** `resolvedAt` não nulo.
  Calcula a média de `(resolvedAt − createdAt)` em ms. Retorna
  `{ ms: number|null, quantidade: number }` (`ms = null` quando não há resolvidos
  válidos).

- `taxaResolucao(chamados)`
  Retorna `{ percentual: number, resolvidos: number, total: number, backlog: number }`,
  onde `backlog = open + in_progress + waiting_requester`. `percentual = resolvidos/total`
  (0 quando total = 0).

- `topSolicitantes(chamados, topN = 5)`
  Agrupa por `requesterId` (rótulo = `requesterName`). Conta, ordena desc, top N.
  Retorna `[{ id, nome, quantidade }]`.

- Helper `formatarDuracao(ms)` → "2,4 dias" ou "5 h" (horas se < 1 dia, senão dias com
  1 casa decimal). Pode viver aqui ou em `utils/formatarData.js`.

Normalização de datas reusa `paraData()` de `utils/formatarData.js` (trata Timestamp do
Firestore, Date, ISO, epoch).

### 4.2 `composables/useRelatorios.js`

```
function useRelatorios() {
  const { todos } = useNotificacaoSuporte();     // lista realtime do suporte
  const periodo = ref('mes');
  const chamadosFiltrados = computed(() => filtrarPorPeriodo(todos.value, periodo.value));

  return {
    periodo,
    temDados: computed(() => chamadosFiltrados.value.length > 0),
    volume:        computed(() => volumePorPeriodo(chamadosFiltrados.value, periodo.value)),
    porSetor:      computed(() => agruparPorSetor(chamadosFiltrados.value)),
    tempoMedio:    computed(() => tempoMedioResolucao(chamadosFiltrados.value)),
    taxa:          computed(() => taxaResolucao(chamadosFiltrados.value)),
    topSolicitantes: computed(() => topSolicitantes(chamadosFiltrados.value)),
  };
}
```

Observação: como `useNotificacaoSuporte` é singleton e o App.vue já o liga no login do
suporte, a página de relatórios **não precisa** abrir escuta própria. Se `todos` estiver
vazio na 1ª renderização, os `computed` reagem quando a 1ª leitura chega.

---

## 5. Tematização do Chart.js

### `utils/chartTheme.js`

Aplica defaults globais do Chart.js 1x (importado no `main.js` ou no 1º componente de
gráfico):

- `Chart.defaults.color` = texto secundário do tema.
- `Chart.defaults.font.family` = Inter.
- Cor de acento dos datasets = `#45d3da` (com área em gradiente para a linha).
- Grid sutil (`rgba(255,255,255,.06)`), sem bordas pesadas.
- Tooltip escuro (fundo `color-mix` do fundo-2, texto claro).
- `responsive: true`, `maintainAspectRatio: false` (altura controlada pelo container).

Registra apenas os controllers/elementos usados (LineController, BarController, scales,
tooltip, filler) para tree-shaking — evita importar o Chart.js inteiro.

### Wrappers (`componentes/relatorios/`)

- `GraficoLinha.vue` — props `labels`, `data`, título opcional. Usa `<Line>` do
  `vue-chartjs`. Área preenchida (filler).
- `GraficoBarra.vue` — props `labels`, `data`. Usa `<Bar>`. Barras com gradiente ciano.

Cada wrapper monta `data`/`options` a partir das props + do tema, e mostra `EstadoVazio`
quando `data` está vazio.

---

## 6. Componentes de UI

`componentes/relatorios/`:

- **`SeletorPeriodo.vue`** — `v-model` (string período). Renderiza 4 chips
  (mês/trimestre/ano/tudo); o ativo recebe glow ciano. Acessível (botões).
- **`CartaoKpi.vue`** — props `rotulo`, `valor`, `sub`. Cartão de vidro com número
  grande ciano. (Pode reusar `CardPainel` se as props baterem; caso contrário,
  componente próprio fino.)
- **`RankingLista.vue`** — props `itens: [{ nome, quantidade }]`, `maximo`. Lista com
  posição, nome, barrinha proporcional (`quantidade/maximo`) e contagem.
- **`GraficoLinha.vue`**, **`GraficoBarra.vue`** — ver seção 5.

`paginas/suporte/`:

- **`Relatorios.vue`** — usa `LayoutApp` (`titulo="Relatórios"`, `mostrar-busca=false`).
  Estrutura (validada no mockup):
  1. `SeletorPeriodo`
  2. Linha de 2 KPIs: tempo médio | taxa de resolução (+ backlog no `sub`)
  3. `GraficoLinha` (volume no tempo) — largura total
  4. Duas colunas: `GraficoBarra` (por setor) | `RankingLista` (top solicitantes)
  - Grade responsiva colapsa para 1 coluna no mobile (padrão `minmax(min(100%, …), 1fr)`).
  - `EstadoVazio` global quando `!temDados` ("Sem chamados no período selecionado.").

---

## 7. Rota e navegação

- `rotas/index.js`: nova rota
  `{ path: '/suporte/relatorios', name: 'suporte-relatorios', component: Relatorios,
     meta: { requiresAuth: true, perfil: 'support', titulo: 'Relatórios' } }`
  (espelha o padrão das demais rotas de suporte).
- `MenuLateralApp.vue`: item "Relatórios" no menu do suporte (ícone Lucide, ex.:
  `BarChart3`), entre "Chamados urgentes" e "Perfil" (ordem a confirmar na implementação).

---

## 8. Aperfeiçoamento do Painel do suporte

`paginas/suporte/PainelSuporte.vue`:

- **Faixa de resumo** (novo bloco) entre os indicadores e o destaque de urgentes:
  - mini-`CartaoKpi` "Tempo médio de resolução" (período fixo = trimestre);
  - mini-**sparkline** de volume (reusa `GraficoLinha` em tamanho reduzido, sem eixos);
  - link "Ver relatórios →" para `/suporte/relatorios`.
  - Dados via `useRelatorios` com `periodo='trimestre'` (instância local; não interfere
    no período escolhido na aba Relatórios).
- **Polish:** revisar espaçamento/hierarquia dos blocos existentes (saudação, código de
  sessão, indicadores, urgentes, recentes) sem reestruturar.

Quando não houver dados, a faixa some (ou mostra placeholder discreto) — não polui o
painel vazio.

---

## 9. Casos de borda

| Situação | Tratamento |
|---|---|
| `location` vazio/`null` | agrupa como "Não informado" |
| Sem chamados resolvidos no período | tempo médio = "—"; taxa usa resolvidos/total |
| Período sem nenhum chamado | `Relatorios.vue` mostra `EstadoVazio`; faixa do painel some |
| Por setor com muitos valores | top 5 + "Outros" agregado |
| Top solicitantes | top 5 |
| Unidade do tempo médio | auto: horas se < 1 dia, senão dias (1 casa) |
| `resolvedAt` nulo em chamado "resolvido" (legado) | ignorado no cálculo da média |
| Bucket de volume | granularidade adaptativa (dia p/ "mês", senão por mês); buckets vazios = 0; eixo X em local time |

---

## 10. Testes (Vitest)

Cobrir `utils/relatorios.js` (funções puras) em `utils/__tests__/relatorios.test.js`:

- `filtrarPorPeriodo`: inclui/exclui por limite de cada preset; `'tudo'` retorna tudo.
- `agruparPorSetor`: normaliza vazio → "Não informado"; top N + "Outros"; ordenação.
- `volumePorPeriodo`: granularidade por dia em `'mes'` e por mês nos demais; buckets
  ordenados e buckets vazios com 0.
- `tempoMedioResolucao`: média correta; `null` quando sem resolvidos; ignora `resolvedAt`
  nulo.
- `taxaResolucao`: percentual, backlog, total=0 → 0.
- `topSolicitantes`: agrupamento por `requesterId`, ordenação, top N.

Componentes de gráfico não são testados (dependem de canvas); a lógica está nas funções
puras.

---

## 11. Dependências novas

- `chart.js`
- `vue-chartjs`

Adicionadas ao `frontend/package.json`. Exigem `npm install` (atualiza o
`package-lock.json`).

---

## 12. Arquivos afetados (resumo)

**Novos:**
- `frontend/src/utils/relatorios.js`
- `frontend/src/utils/chartTheme.js`
- `frontend/src/composables/useRelatorios.js`
- `frontend/src/componentes/relatorios/SeletorPeriodo.vue`
- `frontend/src/componentes/relatorios/CartaoKpi.vue`
- `frontend/src/componentes/relatorios/RankingLista.vue`
- `frontend/src/componentes/relatorios/GraficoLinha.vue`
- `frontend/src/componentes/relatorios/GraficoBarra.vue`
- `frontend/src/paginas/suporte/Relatorios.vue`
- `frontend/src/utils/__tests__/relatorios.test.js`

**Editados:**
- `frontend/src/rotas/index.js` (rota nova)
- `frontend/src/componentes/layout/MenuLateralApp.vue` (item de menu)
- `frontend/src/paginas/suporte/PainelSuporte.vue` (faixa de resumo + polish)
- `frontend/package.json` (deps)
- `frontend/src/main.js` (aplicar `chartTheme` — opcional, ou no 1º wrapper)

---

## 13. Critérios de aceite

- Suporte acessa `/suporte/relatorios` pelo menu; solicitante não acessa (guard).
- Trocar o período recalcula todas as métricas ao vivo.
- Os 5 widgets exibem dados corretos derivados dos chamados do suporte.
- Período/seções sem dados mostram estado vazio claro (sem quebrar layout).
- Painel do suporte exibe a faixa de resumo com tempo médio + sparkline + link.
- Gráficos combinam com o tema Twilight (cores, fonte, tooltip escuro).
- Responsivo: grade colapsa para 1 coluna no mobile.
- Testes de `utils/relatorios.js` passam.
- Nenhuma leitura/índice Firestore novo (usa o listener único existente).
```
