# TicketFlow - Plano de Proximos Passos

> INSTRUCAO PARA IA: Leia este documento inteiro no inicio de cada sessao. Ele e a fonte de verdade sobre o que foi feito, o que esta pendente e qual e o proximo passo. Atualize o LOG e o CHECKLIST apos cada arquivo implementado.

---

## STATUS ATUAL DA SESSAO

**Ultima atualizacao:** documentacao sincronizada em 2026-06-04 (`PlanoProximosPassos.md` + `ticketflow-especificacao-projeto.md`). Os docs agora refletem o estado real do codigo: paginas implementadas, escopo de suporte por sessao (`sessionSupportId`), chat em tempo real, notificacoes por perfil, historico client-side e autoexclusao.

**Ultima feature/fix de codigo:** autoexclusao pelo app + fix do sino do suporte. `DetalhesChamadoSuporte.vue` marca o chamado como lido ao abrir a tela; `PerfilUsuario.vue` permite excluir a propria conta apos reautenticacao, removendo tambem chamados abertos do solicitante.

**Escopo real atual:** suporte nao consulta "todos os chamados do sistema" de forma global. Pela regra atual, suporte consulta apenas chamados vinculados as suas sessoes de atendimento (`tickets.sessionSupportId == uid do suporte`). Isso protege dados entre atendentes e combina com o fluxo de codigo de sessao.

**Proximo passo imediato:** Etapa 12 - testes manuais ponta a ponta com Firebase real: cadastro/login solicitante+suporte, geracao/entrada em sessao, CRUD de chamados, chat, notificacoes, assumir/status/responder/finalizar, guards, autoexclusao e responsividade. Pre-req: Auth email/senha ativado + Firestore DB criado + `firebase deploy --only firestore` (regras+indices; necessario p/ regra de delete de perfil, sessoes, chat e historico valerem em producao). Depois: revisar responsividade final, gerar build e fazer deploy de hosting.

**Sessao atual:** 4 (2026-06-04)

**>>> CHECKPOINT DE TESTE DISPONIVEL:** com Auth(email/senha) ativado + regras Firestore deployadas, da para testar o fluxo completo: suporte cria/usa codigo de atendimento -> solicitante entra com codigo -> abre chamado -> suporte recebe aviso -> ambos conversam no chat -> suporte assume, responde, registra solucao e finaliza -> solicitante ve notificacao/resposta.

**PLANO FREE (Spark) - CONFIG AJUSTADA:** projeto roda 100% no free usando Auth + Firestore + Hosting (+ Analytics opcional). Storage e Cloud Functions exigem Blaze para este escopo e foram REMOVIDOS do deploy em `firebase.json`. Codigo das Functions continua em `backend/funcoes/` como opcional Blaze-only, sem deploy. `configuracaoFirebase.js` nao usa Storage e `storage.rules` foi removido.

**PRE-REQUISITOS p/ testar (usuario faz):**
1. Firestore Database criado no Console (Native mode).
2. Authentication -> Sign-in method -> ativar E-mail/Senha.
3. Deploy SO do firestore quando for publicar regras: `firebase deploy --only firestore` a partir da raiz do projeto. NAO usar storage/functions no deploy.
4. Fix aplicado: cadastro grava `usuario.email` (canonico) p/ casar com regra `email == auth.token.email`.

**App roda de verdade agora:** `/` -> `/login`, guards ativos, paginas reais importadas no router. Solicitante precisa vincular codigo de atendimento antes de acessar chamados; suporte acessa painel, chamados, urgentes, solicitantes e atendimento.

**Servidor de desenvolvimento:** nao iniciado nesta atualizacao de docs. Para rodar: `cd frontend && npm run dev` (Vite normalmente abre em http://localhost:5173).

**MUDANCA DE TEMA (importante):** usuario enviou referencia real (TelaClaude.png) e o tema CLARO foi trocado por tema ESCURO "Twilight": fundo teal escuro (#16323a->#1d3f48), vidro escuro (rgba branco 0.06-0.09), acento ciano #45d3da com glow SUTIL (numeros + botao primario), status brilhantes. Tokens reescritos em variaveis.css; ajustes em tipografia/botoes/vidro. PENDENTE: texturas/imagens sutis em alguns cards (fase de componentes).

**Arquitetura de estilos (IMPORTANTE para proximas sessoes):**
- Entrada unica: `estilos/index.css` (importa tudo na ordem). `main.js` deve fazer `import "./estilos/index.css"`.
- Arquivos: variaveis, base, tipografia, atmosfera, vidro, botoes, badges, animacoes, scroll, responsivo. `global.css` virou atalho para index.css (compat).
- Fontes: Clash Display (titulos, via Fontshare) + Inter (corpo, via Google), carregadas em `tipografia.css`.
- Classes reutilizaveis prontas para os componentes usarem:
  - Vidro: `.vidro`, `.cartao`, `.painel`, `.cartao-destaque` (azul), `.elevavel` (hover)
  - Botoes: `.botao` + `.botao-primario/secundario/perigo/fantasma/icone/pequeno`
  - Badges: `.badge` + `.badge-suave` (le `--cor-badge` da constante), `.badge-urgente` (pulsa), `.pill-info`, `.ponto`
  - Texto: `.titulo-hero`, `.titulo-secao`, `.numero-indicador`, `.titulo-card`, `.rotulo-pequeno`, `.texto-secundario`
  - Movimento: `.cascata > *` (entrada staggered no load), `.animar-surgir`, `.revelar` (scroll-reveal), `.girando`, `.skeleton`
- Como o componente colore um badge: setar `style="--cor-badge: var(--cor-status-aberto)"` (cor vem das constantes JS).

---

## LOG DE ALTERACOES

> Cada entrada registra: data, etapa, arquivo, o que foi feito.

| Sessao | Etapa | Arquivo | Status |
|--------|-------|---------|--------|
| 1 (2026-05-30) | 1 | `backend/firebase/regras/firestore.rules` | Regras de seguranca completas: auth, perfil requester/support, dono do chamado, validacao de status/prioridade, subcolecao historico (leitura) e bloqueio padrao |
| 1 (2026-05-30) | free | `backend/firebase/regras/storage.rules` | Removido do escopo Spark/free. Storage nao sera usado nem deployado. |
| 1 (2026-05-30) | 1 | `backend/firebase/indices/firestore.indexes.json` | 4 indices compostos para as queries (requesterId+createdAt, requesterId+status+createdAt, status+createdAt, priority+createdAt) |
| 1 (2026-05-30) | 1 | `backend/funcoes/src/usuarios.js` | Function `sincronizarPapelUsuario`: espelha `role` nas custom claims do Auth (API v2) |
| 1 (2026-05-30) | 1 | `backend/funcoes/src/chamados.js` | Functions `aoCriarChamado` e `aoMudarStatusChamado`: trilha de auditoria na subcolecao `historico` (API v2) |
| 1 (2026-05-30) | 1 | `backend/funcoes/src/index.js` | Ponto de entrada: inicializa Admin SDK e reexporta as functions |
| 1 (2026-05-30) | 2 | `frontend/src/constantes/statusChamado.js` | STATUS (chaves = valores Firestore), STATUS_INFO (rotulo/cor/ordem), LISTA_STATUS, helpers obterInfoStatus/rotuloStatus |
| 1 (2026-05-30) | 2 | `frontend/src/constantes/prioridadesChamado.js` | PRIORIDADE + info (rotulo/cor/peso), LISTA_PRIORIDADES, helpers obterInfoPrioridade/pesoPrioridade |
| 1 (2026-05-30) | 2 | `frontend/src/constantes/categoriasChamado.js` | 9 categorias fixas + info, LISTA_CATEGORIAS, helpers obterInfoCategoria/rotuloCategoria |
| 1 (2026-05-30) | 2 | `frontend/src/constantes/perfisUsuario.js` | PERFIL requester/support + rotaInicial, helpers ehSuporte/rotaInicialDoPerfil |
| 1 (2026-05-30) | 2 | `frontend/src/utils/formatarData.js` | paraData (normaliza Timestamp/Date/ISO/epoch), formatarData, formatarDataHora, formatarDataRelativa |
| 1 (2026-05-30) | 2 | `frontend/src/utils/ordenarChamados.js` | ordenarPorMaisRecente/MaisAntigo/Prioridade (puras, nao mutam) |
| 1 (2026-05-30) | 2 | `frontend/src/utils/validarEmail.js` | emailValido, senhaValida (min 6), campoPreenchido, senhasIguais |
| 1 (2026-05-30) | 6-css | `frontend/src/estilos/variaveis.css` | Todos os tokens do soft glassmorphism: cores, glass, status/prioridade (casam com constantes JS), sombras, raios, espacos, tipografia, animacao, z-index |
| 1 (2026-05-30) | 6-css | `frontend/src/estilos/global.css` | Reset, base, fonte Inter (@import), classes reutilizaveis (.vidro/.cartao/.botao/.badge/.titulo-hero), animacoes (surgir/girar), prefers-reduced-motion |
| 1 (2026-05-30) | 6-css | `frontend/src/estilos/responsivo.css` | Breakpoints tablet (<=1024) e mobile (<=640) reescrevendo tokens; helpers .apenas-desktop/.apenas-mobile |
| 1 (2026-05-30) | 6-css-v2 | `frontend/src/estilos/*` (REFATORADO) | Estilos modularizados em 11 arquivos + index.css principal. Decisoes: Clash Display nos titulos + Inter no corpo; animacao caprichada (atmosfera com blobs+grao, cascata no load, scroll-reveal, micro-interacoes nos botoes/badges). variaveis.css estendido (--fonte-display, blobs, easing). Novos: base, tipografia, atmosfera, vidro, botoes, badges, animacoes, scroll, index. global.css virou atalho. Validado com lightningcss (12/12 OK). |
| 1 (2026-05-30) | bootstrap | `frontend/src/main.js` + `App.vue` + `index.html` | TEMPORARIO: bootstrap minimo (createApp + import index.css) e VITRINE em App.vue para visualizar o design system em tela (`npm run dev` -> localhost:5173). App.vue sera trocado por `<RouterView />` na Etapa 6. index.html: lang pt-BR + titulo. Dev server testado: HTTP 200, App.vue/main.js/index.css compilam sem erro. |
| 1 (2026-05-30) | 3 | `frontend/src/servicos/servicoUsuario.js` | CRUD da colecao `users`: criarPerfilUsuario, buscarPerfilUsuario, atualizarPerfilUsuario (serverTimestamp, ID = UID) |
| 1 (2026-05-30) | 3 | `frontend/src/servicos/servicoAutenticacao.js` | cadastrar (cria conta Auth + displayName + perfil em users), entrar, sair, observarAutenticacao (onAuthStateChanged), usuarioAtual |
| 1 (2026-05-30) | 3 | `frontend/src/servicos/servicoChamado.js` | CRUD completo de `tickets` + realtime: criarChamado (status open + id), buscar/listar (solicitante e todos), observar* (onSnapshot x3), atualizar, assumir, atualizarStatus (resolvedAt/cancelledAt auto), responder, registrarSolucao, excluir |
| 1 (2026-05-30) | tema | `estilos/variaveis.css` (reescrito) + tipografia/botoes/vidro.css | VIRADA p/ tema escuro "Twilight" (apos TelaClaude.png). Acento ciano #45d3da + glow sutil. Nomes de token mantidos (nada quebrou). Validado lightningcss 6/6 OK; dev server 200. |
| 1 (2026-05-30) | 4 | `frontend/src/composables/useNotificacao.js` | Sistema global de toasts (fila singleton reativa): sucesso/erro/info + auto-dismiss + remover |
| 1 (2026-05-30) | 4 | `frontend/src/composables/useFormatarData.js` | Composable fino expondo formatarData/Hora/Relativa |
| 1 (2026-05-30) | 4 | `frontend/src/stores/storeAutenticacao.js` | Pinia setup store: estado usuario/perfil, getters (estaLogado/ehSuporte/ehSolicitante/rotaInicial), acoes iniciar (observa sessao, resolve no 1o estado p/ guard)/cadastrar/entrar/sair |
| 1 (2026-05-30) | 4 | `frontend/src/stores/storeChamado.js` | Pinia: lista + chamadoAtual + indicadores (abertos/emAndamento/aguardando/resolvidos/cancelados/urgentes), escutas realtime (solicitante/todos/item), limpar, CRUD delegado ao servico |
| 1 (2026-05-30) | 4 | `frontend/src/composables/useAutenticacao.js` | Embrulha storeAutenticacao: traducao de erros Firebase->PT (RNF010), notificacoes, retorno {ok,erro}. storeToRefs p/ reatividade |
| 1 (2026-05-30) | 4 | `frontend/src/composables/useChamados.js` | Embrulha storeChamado: regras de negocio (finalizar exige resposta+solucao; responder nao-vazio), notificacoes, retorno {ok}. Expoe escutas e indicadores |
| 1 (2026-05-30) | 5 | `frontend/src/componentes/comuns/EmConstrucao.vue` | Placeholder tematico temporario p/ rotas ainda nao implementadas (le meta.titulo) |
| 1 (2026-05-30) | 5 | `frontend/src/rotas/index.js` | Tabela completa de rotas (publicas/solicitante/suporte/compartilhadas/404) + guard beforeEach (raiz->perfil, somenteVisitante, requiresAuth, perfil) + afterEach (title). Rotas apontam p/ EmConstrucao por ora |
| 1 (2026-05-30) | 5/6 | `frontend/src/main.js` | Registra Pinia + Router; chama auth.iniciar() e so monta apos sessao conhecida |
| 1 (2026-05-30) | 5/6 | `frontend/src/App.vue` (reescrito) | Casca real: RouterView com transicao de pagina + host global de toasts (useNotificacao). Vitrine removida |
| 1 (2026-05-30) | 7 | `componentes/comuns/BotaoBase.vue` | Botao reutilizavel: variantes (primario/secundario/perigo/fantasma/icone), tamanho, bloco, estado carregando (spinner), slot icone |
| 1 (2026-05-30) | 7 | `componentes/comuns/CampoTextoBase.vue` | Input com label, v-model, erro, icone (slot), id acessivel, blur. Vidro escuro |
| 1 (2026-05-30) | 7 | `componentes/comuns/AreaTextoBase.vue` | Textarea com label, v-model, erro, contador (maximo), linhas |
| 1 (2026-05-30) | 7 | `componentes/comuns/SeletorBase.vue` | Select estilizado, v-model, opcoes [{valor,rotulo}] (formato das constantes), seta ChevronDown |
| 1 (2026-05-30) | 7 | `componentes/comuns/ModalBase.vue` | Modal via Teleport, fecha overlay/X/Esc, trava scroll, slots default+acoes, transicao |
| 1 (2026-05-30) | 7 | `componentes/comuns/EstadoCarregamento.vue` | Spinner ciano com glow + texto, modo pagina-cheia |
| 1 (2026-05-30) | 7 | `componentes/comuns/EstadoVazio.vue` | Estado vazio: icone (slot/Inbox), titulo, descricao, acao (slot) |
| 1 (2026-05-30) | 7 | `componentes/layout/LayoutAutenticacao.vue` | Tela centralizada login/cadastro: cartao de vidro + marca, slots default+rodape |
| 1 (2026-05-30) | 7 | `componentes/layout/MenuLateralApp.vue` | Sidebar glass: menu por perfil (solicitante/suporte via useAutenticacao), item ativo com glow, avatar+sair. Emite "navegou" |
| 1 (2026-05-30) | 7 | `componentes/layout/CabecalhoApp.vue` | Topbar capsula: hamburguer mobile, titulo, busca (v-model), notificacoes, avatar. Emite abrir-menu |
| 1 (2026-05-30) | 7 | `componentes/layout/LayoutApp.vue` | Moldura interna: sidebar + topbar + conteudo (slot). Drawer no mobile (overlay). v-model:busca, prop titulo |

**Nota Etapa 7:** icones via `@lucide/vue` (named imports). Todos os 12 usados verificados no .d.ts. 11/11 componentes compilam no Vite (200, zero erro). Classes globais (.botao/.cartao/.painel/.vidro) reutilizadas.
| 1 (2026-05-30) | 8 | `paginas/publicas/PaginaLogin.vue` | Login real: LayoutAutenticacao + CampoTextoBase (icones Mail/Lock) + BotaoBase. Validacao local, entrar() via useAutenticacao, redirect p/ rotaInicial ou ?redirect |
| 1 (2026-05-30) | 8 | `paginas/publicas/PaginaCadastro.vue` | Cadastro real: nome/email/senha/confirmacao/tipo de conta (SeletorBase com LISTA_PERFIS). Validacoes 25.1, cadastrar() via useAutenticacao, redirect por perfil |
| 1 (2026-05-30) | 8 | `rotas/index.js` (editado) | Rotas /login e /cadastro agora apontam para as paginas reais (removido EmConstrucao dessas duas) |
| 1 (2026-05-30) | 9a | `componentes/chamados/SeloStatusChamado.vue` | Selo generico status OU prioridade (prop tipo), cor da constante via --cor-badge, urgente pulsa |
| 1 (2026-05-30) | 9a | `componentes/chamados/CardChamado.vue` | Card resumo de chamado (titulo/desc/selos/categoria/solicitante opc/data), clicavel -> emite abrir |
| 1 (2026-05-30) | 9a | `componentes/chamados/TabelaChamados.vue` | Tabela no desktop + cards no mobile (reusa CardChamado). Coluna solicitante opcional. Emite abrir |
| 1 (2026-05-30) | 9a | `componentes/chamados/FiltrosChamados.vue` | Filtros status/prioridade/categoria (v-model objeto, ""=todos) |
| 1 (2026-05-30) | 9a | `componentes/chamados/FormularioChamado.vue` | Form criar/editar (title/desc/categoria/prioridade/local), validacoes 25.3, emite salvar/cancelar |
| 1 (2026-05-30) | 9a | `componentes/chamados/PainelDetalhesChamado.vue` | Exibicao read-only completa (compartilhada solicitante/suporte): selos, descricao, grade de dados, resposta, solucao |
| 1 (2026-05-30) | 9a | `componentes/painel/CardPainel.vue` | Card indicador (rotulo/numero ciano/sub/icone slot) |
| 1 (2026-05-30) | 9a | `componentes/painel/ResumoPainel.vue` | Grade responsiva de CardPainel (entrada cascata), recebe array de cards |
| 1 (2026-05-30) | 9b | `paginas/solicitante/PainelSolicitante.vue` | Dashboard: saudacao, ResumoPainel (abertos/andamento/aguardando/resolvidos reativos), recentes (5), realtime escutarDoSolicitante, atalho novo |
| 1 (2026-05-30) | 9b | `paginas/solicitante/MeusChamados.vue` | Lista completa + FiltrosChamados + busca textual (LayoutApp v-model:busca) + TabelaChamados + estados vazios |
| 1 (2026-05-30) | 9b | `paginas/solicitante/NovoChamado.vue` | Criar E editar (detecta :id; bloqueia edicao se nao aberto). FormularioChamado, preenche requester* automatico |
| 1 (2026-05-30) | 9b | `paginas/solicitante/DetalhesChamadoSolicitante.vue` | Realtime escutarChamado; PainelDetalhesChamado; acoes editar/cancelar/excluir (so se aberto) com ModalBase de confirmacao (RN009) |
| 1 (2026-05-30) | 9b | `rotas/index.js` (editado) | Rotas /solicitante/* apontam para as paginas reais (4 + rota editar reusa NovoChamado) |
| 2 (2026-05-30) | 10 | `paginas/suporte/PainelSuporte.vue` | Dashboard suporte: indicadores (total/abertos/andamento/urgentes) + recentes (5) + coluna lateral "Urgentes em aberto" (RN008). Realtime escutarTodos |
| 2 (2026-05-30) | 10 | `paginas/suporte/TodosChamados.vue` | Lista de TODOS (RF012/RF013) + FiltrosChamados + busca textual (inclui solicitante) + TabelaChamados mostrar-solicitante. Realtime escutarTodos |
| 2 (2026-05-30) | 10 | `paginas/suporte/ChamadosUrgentes.vue` | Urgentes nao-finalizados pre-filtrados (RN008) + busca. Reusa escutarTodos |
| 2 (2026-05-30) | 10 | `composables/useChamados.js` (editado) | Exposto `registrarSolucao(id, solucao)` isolado (RF018), valida nao-vazio |
| 2 (2026-05-30) | 10 | `paginas/suporte/DetalhesChamadoSuporte.vue` | Atendimento (15.9): PainelDetalhesChamado + assumir (RF015), seletor de status (RF016), responder (RF017), salvar solucao (RF018), finalizar exige resposta+solucao (RF019), cancelar/excluir com ModalBase (RN009). Campos sincronizados via watch do chamado realtime |
| 2 (2026-05-30) | 11 | `paginas/compartilhadas/PerfilUsuario.vue` | Perfil (15.10): nome/email/tipo/departamento/membro-desde + botao sair (RF003) |
| 2 (2026-05-30) | 11 | `paginas/compartilhadas/PaginaNaoAutorizada.vue` | Acesso negado (RNF005): standalone centrado, botao volta ao painel do perfil ou login |
| 2 (2026-05-30) | 11 | `paginas/compartilhadas/PaginaNaoEncontrada.vue` | 404 standalone: botao volta a raiz (guard redireciona) |
| 2 (2026-05-30) | 10/11 | `rotas/index.js` (editado) | Trocado EmConstrucao pelas 7 paginas reais (suporte + compartilhadas). Import de EmConstrucao removido. Build OK |
| 2 (2026-05-30) | deploy | Firebase Hosting | `firebase deploy --only hosting` OK -> https://projetoticketflow-c3b5c.web.app . Deploy de firestore/rules PENDENTE: exige Firestore DB criado no Console (Native) + Auth email/senha ativado; depois `firebase deploy --only firestore` |
| 2 (2026-05-30) | ajuste-fino | `estilos/base.css` + `componentes/comuns/CampoTextoBase.vue` | FIX borda dupla nos inputs: `:focus-visible` global aplicava anel no `<input>` interno enquanto `.campo-caixa:focus-within` aplicava no container -> 2 aneis. Neutralizado `input/textarea:focus-visible` na raiz + reforco no componente. Bonus: toggle mostrar/ocultar senha (Eye/EyeOff), icone do campo acende no foco, autofill do Chrome neutralizado |
| 2 (2026-05-30) | ajuste-fino | `componentes/layout/LayoutAutenticacao.vue` + `paginas/publicas/PaginaLogin.vue` | Redesign visual do acesso (login/cadastro): aura ciano atras do cartao, costura luminosa no topo, logo com halo + gradiente, selo "Acesso seguro" (ShieldCheck), titulo em Clash Display, entrada em cascata. CTA Entrar com icone LogIn. Build OK |
| 2 (2026-05-30) | ajuste-fino | `paginas/suporte/PainelSuporte.vue` (reescrito) | FIX painel quebrado: removido grid `2fr 1fr` que cravava a tabela de 7 colunas (track 2fr com min=min-content estourava/comprimia a coluna lateral). Layout agora empilhado: indicadores -> destaque urgentes (grade `auto-fill minmax(220px,1fr)`, so quando ha urgentes) -> recentes em largura total. Removida mistura `.painel`+`.cartao-destaque` |
| 2 (2026-05-30) | ajuste-fino | `componentes/painel/ResumoPainel.vue` | Robustez (ambos dashboards): `repeat(4/2, minmax(0,1fr))` no lugar de `1fr` -> impede cards estourarem em larguras intermediarias |
| 2 (2026-05-30) | bugfix-css | `estilos/responsivo.css` | CAUSA RAIZ de "tabela quebrada": helper `.apenas-desktop { display: initial }` -> valor initial de `display` e `inline` (nao table!), e a classe (0,1,0) vencia a regra UA `table{display:table}` -> a tabela virava inline, perdendo colunas/alinhamento. Reescrito: so esconder com `display:none`, mostrar com `revert` (display natural). Idem mobile |
| 2 (2026-05-30) | bugfix-css | `estilos/botoes.css` | `.botao-icone` ganhou `display:inline-flex` + centralizacao (antes dependia do helper; como inline, ignorava width/height 44px) |
| 2 (2026-05-30) | bugfix-css | `componentes/layout/CabecalhoApp.vue` + `LayoutApp.vue` | Removida dependencia dos helpers globais: hamburguer/notificacoes controlam visibilidade via classes scoped (`.topbar-menu`/`.topbar-acao`) + media query local. Overlay sem `.apenas-mobile` (ja e mobile-only via v-if) |
| 2 (2026-05-30) | bugfix-css | `componentes/chamados/TabelaChamados.vue` (REESCRITO) | Self-contained 100%: tabela dentro de painel de vidro WRAPPER (`.tc-painel`, border-radius confiavel + overflow hidden), `border-collapse:collapse`, alternancia tabela<->cards via media query scoped (<=860px) com display EXPLICITO. Zero uso de `.apenas-*`/`.vidro`/`.tabela` globais. Cabecalho/colunas alinhados |
| 2 (2026-05-30) | bugfix-auth | `stores/storeAutenticacao.js` + `rotas/index.js` | FIX "F5 -> login": `main.js` dispara `app.use(router)` (navegacao inicial + guard) ANTES de `iniciar()` terminar; no F5 o guard rodava com usuario=null e mandava pro login antes de o Firebase restaurar a sessao. Solucao: `iniciar()` idempotente (promessa cacheada) + novo `aguardarPronto()`; guard `beforeEach` agora e `async` e faz `await auth.aguardarPronto()` antes de decidir. Apos a 1a vez resolve na hora |
| 2 (2026-05-30) | nota-auth | (sem codigo) | Conflito "2 perfis em 2 abas": Firebase Auth padrao = 1 sessao por navegador (localStorage, sincroniza entre abas). 1a decisao do usuario foi manter; reaberto abaixo |
| 2 (2026-05-30) | bugfix-auth | `firebase/configuracaoFirebase.js` | FIX "logar suporte na aba A, solicitante na aba B -> aba A vira solicitante": trocado `getAuth(app)` por `initializeAuth(app, { persistence: [browserSessionPersistence, inMemoryPersistence] })`. Persistencia POR ABA (sessionStorage) -> cada aba tem sessao isolada, sem sync cross-tab. Sobrevive F5 na mesma aba. TRADE-OFF: fechar aba/navegador encerra a sessao (nao "lembra" login); abrir nova aba exige logar. Build OK (bundle ate diminuiu, initializeAuth faz tree-shake melhor). ATENCAO p/ deploy: sessoes 'local' antigas nao sao lidas pela nova persistencia -> usuarios logados aparecem deslogados 1x apos publicar |
| 3 (2026-05-31) | notif-solicitante | `useNotificacaoSolicitante.js` (novo) + `App.vue` + `CabecalhoApp.vue` + `DetalhesChamadoSuporte.vue` + `DetalhesChamadoSolicitante.vue` | FEATURE "solicitante ser avisado quando suporte responde". Ja existiam: botao de resposta no suporte (gravava supportResponse) e a "telinha" Resposta do suporte no detalhe do solicitante em tempo real (PainelDetalhesChamado). Faltava o AVISO. Add sino TAMBEM p/ o solicitante (espelha o do suporte): novo composable `useNotificacaoSolicitante` escuta os proprios chamados e detecta atualizacao do SUPORTE via assinatura `status|supportResponse|resolution|assignedToName` (gatilho resposta+status+solucao; edicoes do proprio solicitante ficam de fora). "Visto" por chamado guardado em localStorage por UID (aviso sobrevive a relogar). CabecalhoApp generalizado: 1 sino, fonte/textos/rota por perfil (`temSino`, `itensSino`, `tituloSino`). App.vue liga via `watch([ehSolicitante, usuario])`. Detalhe do solicitante marca visto a cada update (limpa badge, evita falso aviso do proprio cancelamento). Botao suporte renomeado "Salvar resposta"->"Enviar resposta". Pendente: testar com Firestore real |
| 3 (2026-05-31) | fix-sino | `CabecalhoApp.vue` + `useNotificacaoSuporte.js` | FIX 2 bugs do sino: (1) COMPORTAMENTO "clicar nao baixava o numero": padrao de bell/badge = clicar na notificacao marca como lida. Add `marcarLido(id)` (Set `lidos` no composable) -> some do badge/painel na hora, mesmo o chamado seguindo aberto ate ser assumido; `lidos` e podado quando o chamado sai de aberto e zerado no `parar()`. (2) CSS "painel transparente, texto/nome por cima ilegivel": CAUSA RAIZ = `.topbar.vidro` tem `backdrop-filter` -> cria stacking context em z auto; sem z-index na topbar o conteudo da pagina (DOM posterior) pintava por cima do dropdown. Fix: `.topbar { position:relative; z-index: var(--z-topbar) }`. Tambem o fundo do painel era vidro translucido (vazava) -> trocado por OPACO `color-mix(cor-fundo-2 94%, #000)` + leve realce ciano |
| 3 (2026-05-31) | anim-sino (skill ui-animation) | `CabecalhoApp.vue` | POLIMENTO da anim do sino: badge deixou de pulsar INFINITO (ruido) -> pop UNICO (0.45s) so quando a contagem sobe (toast ja avisa; pop reforca na topbar), via `watch(quantidade)` + classe `notif-badge-pop` + `@animationend`. Dropdown agora emerge do gatilho (`transform-origin: top right` + `scale(0.96)`), entrada com curva enter e saida mais rapida (140ms). prefers-reduced-motion ja coberto pela regra global (animacoes.css) |
| 3 (2026-05-31) | notificacao-suporte | `servicoChamado.js` + `useNotificacaoSuporte.js` (novo) + `App.vue` + `CabecalhoApp.vue` | FEATURE "sino nao avisava chamado novo": sino era decorativo. Add `observarChamadosAbertos` (where status==open, equality -> sem indice), composable singleton `useNotificacaoSuporte` (pendentes=abertos sem responsavel, quantidade, toast na chegada, 1a carga so semeia), App.vue liga/desliga via `watch(ehSuporte)`, sino com badge pulsante + dropdown (link p/ suporte-detalhes-chamado, fecha fora/Esc). Removida regra orfa `.topbar-acao{display:none}` (mobile). So suporte ve o sino. Pendente: testar com Firestore real |
| 3 (2026-05-31) | fix-sino-suporte | `paginas/suporte/DetalhesChamadoSuporte.vue` | FIX "abrir chamado fora do sino nao baixa o badge": so o clique no sino (`CabecalhoApp.aoAbrirItem` -> `notifSuporte.marcarLido(id)`) marcava lido; abrir pela lista "Todos os Chamados" nao. CAUSA RAIZ: a tela de atendimento nunca chamava `marcarLido`. Fix: importa `useNotificacaoSuporte`, chama `marcarLido(id.value)` no `onMounted` (so precisa do id, nao do objeto). Simetrico ao lado solicitante (que ja limpava via watch+`marcarVisto`). Sem build |
| 3 (2026-05-31) | autoexclusao (opcao A) | `firestore.rules` + `servicoUsuario.js` + `servicoChamado.js` + `servicoAutenticacao.js` + `storeAutenticacao.js` + `useAutenticacao.js` + `PerfilUsuario.vue` | FIX "deletar usuario no Console Auth deixa doc em `users` orfao": Firebase nao cascateia, e plano Spark/free nao roda Cloud Function `onUserDeleted` (Blaze). Solucao: autoexclusao PELO APP. Fluxo na PaginaPerfil (zona de perigo + modal de senha): reautentica -> apaga chamados ABERTOS do user -> apaga doc `users/{uid}` -> `deleteUser(auth)` -> redirect /login. Ordem critica: Firestore ANTES do Auth (perde permissao apos). Chamados nao-abertos preservados como historico (regra proibe solicitante apagar nao-aberto, RN005/RN006). Regra `users` delete: `if false` -> `if eDono(userId)`. Build OK. PENDENTE: `firebase deploy --only firestore` p/ a regra de delete valer em producao (criar Firestore DB antes) |
| 4 (2026-06-04) | docs | `PlanoProximosPassos.md` + `ticketflow-especificacao-projeto.md` | Documentacao sincronizada com o codigo atual: remove status antigos de placeholder/pendente, registra escopo por sessao (`sessionSupportId`), chat em `tickets/{id}/mensagens`, historico em `tickets/{id}/historico`, notificacoes de suporte/solicitante, autoexclusao e proximos passos reais de teste/deploy. Sem build (docs only) |
| 4 (2026-06-04) | bugfix-seg | `backend/firebase/regras/firestore.rules` | FIX over-permissao no delete de chamado: `allow delete` do suporte era global (`if eSuporte()`) -> qualquer suporte apagava chamado de OUTRA sessao, inconsistente com o `allow read` que ja e escopado por `sessionSupportId`. Corrigido para `eSuporte() && resource.data.sessionSupportId == request.auth.uid`. Solicitante segue apagando so os proprios abertos. PENDENTE: `firebase deploy --only firestore` p/ valer em producao |
| 4 (2026-06-04) | refactor (#7) | `utils/errorHandler.js` (novo) + `composables/useAutenticacao.js` | Tradutor de erro Firebase->PT extraido de `useAutenticacao` para util reutilizavel `errorHandler.js` (RNF010, recomendado pela spec sec.20). `useAutenticacao` agora importa `traduzirErro`/`MENSAGENS_ERRO` do util. Add codigo `auth/missing-email` p/ recuperacao de senha |
| 4 (2026-06-04) | feature (#5) | `servicos/servicoAutenticacao.js` + `composables/useAutenticacao.js` + `paginas/publicas/PaginaLogin.vue` | FEATURE recuperacao de senha (spec sec.29 extra): `recuperarSenha(email)` via `sendPasswordResetEmail`; wrapper no composable com feedback neutro (nao revela se e-mail existe); link "Esqueci minha senha" no login reusa o e-mail digitado, valida formato e dispara o envio. Estilo do link no tema Twilight |
| 4 (2026-06-04) | testes (#6) | `frontend/package.json` + `utils/__tests__/*.test.js` (3 novos) | Setup Vitest (devDep + scripts `test`/`test:run`) + testes unitarios dos utils puros: `validarEmail`, `ordenarChamados` (ordem + nao-mutacao + desempate por prioridade), `formatarData` (paraData/relativa/fallbacks). PRE-REQ p/ rodar: `npm install` (instala vitest) e depois `npm test`. NAO rodado nesta sessao (politica sem build automatico). Reset de senha (#5) testado manualmente pelo usuario: OK |
| 4 (2026-06-04) | perf (#8) | `composables/useNotificacaoSuporte.js` + `stores/storeChamado.js` + `servicos/servicoChamado.js` | FIX 2 listeners na mesma query do suporte: o sino (`useNotificacaoSuporte`, escuta `sessionSupportId == uid`) e os paineis (`storeChamado.escutarTodos`, que abria um 2o `onSnapshot` com orderBy) liam a MESMA colecao em paralelo. Agora o singleton do sino e a FONTE UNICA: expoe `todos` (lista crua) + `carregado`; `escutarTodos` espelha via `watch` e ordena no cliente (`ordenarPorMaisRecente`). Resultado: 1 escuta do Firestore p/ o suporte (metade das leituras), dispensa indice composto no runtime. Removido `observarChamadosDoSuporte` (orfao). Paginas inalteradas (seguem lendo `store.chamados`). Sem build |
| 4 (2026-06-04) | responsivo (#10) | `paginas/suporte/MeusSolicitantes.vue` | REVISAO de responsividade (item [~] do checklist). Auditado: viewport OK, drawer a 1100px, camada `estilos/telamobile/*` completa (header stacking, botoes full-width, collapse de grids, overflow-wrap em texto longo, modal bottom-sheet, anti-zoom iOS, perfil/404), todos os `NNNpx` sao `max-width` (nao vazam). Unico gap: `.grade-solicitantes` usava `minmax(280px,1fr)` sem guarda e nao estava na camada mobile -> overflow horizontal em tela <300px. Fix p/ `minmax(min(100%,280px),1fr)` (mesmo padrao de ResumoPainel/FiltrosChamados). Falta so validacao em dispositivo real |

**Notas tecnicas da sessao 1:**
- Constantes usam as chaves = valores exatos do Firestore (open/in_progress/...; low/medium/...; requester/support). Cores apontam para tokens CSS (`var(--cor-...)`) que serao definidos em `variaveis.css`.
- Constantes + utils testados via Node ESM (smoke test): todas as funcoes retornaram o esperado.
- DECISAO DE DESIGN APLICADA: tokens do tema escuro Twilight foram escritos em `variaveis.css` e usados pelos componentes. Pendente apenas revisao visual/responsiva final.
- Functions usam API v2 do firebase-functions (v7.2.5) e CommonJS (`require`), conforme `package.json` (`"type": "commonjs"`).
- Sintaxe das 3 functions validada com `node -c`. JSON de indices validado.
- Deploy das Functions exige plano Blaze. A seguranca essencial nao depende delas — esta nas `firestore.rules`.
- Regras nao testadas em emulador (sem Java/login nesta sessao). Recomendado rodar `firebase deploy --only firestore:rules` ou emulador antes de confiar em producao.

---

Este documento consolida o estado atual do projeto e define a ordem recomendada para continuar a implementacao do TicketFlow.

Base usada:

- `ticketflow-especificacao-projeto.md`
- Estrutura real atual das pastas `frontend/` e `backend/`
- Configuracoes Firebase ja aplicadas durante a preparacao do projeto

Observacao: no momento desta revisao, o arquivo `ProgressaoProjeto.md` nao aparece mais na raiz do projeto. Este arquivo passa a servir como documento atualizado de acompanhamento.

---

## 1. Objetivo do projeto

O TicketFlow e uma aplicacao web de gerenciamento de chamados de suporte desenvolvida com Vue.js e Firebase.

A aplicacao deve permitir que usuarios abram chamados, acompanhem o atendimento e recebam respostas da equipe de suporte.

O sistema tera dois perfis principais:

- Solicitante: cria chamados, acompanha os proprios chamados, edita ou exclui chamados abertos.
- Suporte: visualiza chamados vinculados as proprias sessoes, assume atendimentos, altera status, conversa no chat, responde, registra solucao e finaliza chamados.

O projeto atende a proposta academica porque usa Vue.js, Firebase Authentication, Cloud Firestore, rotas protegidas, CRUD completo e uma proposta diferente de um CRUD generico.

---

## 2. Requisitos do professor

### 2.1 Front-end

Requisitos:

- Utilizar Vue.js.
- Utilizar componentes e organizacao adequada do projeto.
- Ter interface amigavel e responsiva.

Estado atual:

- Vue, Vite e plugin Vue estao instalados no `frontend/`.
- A estrutura de pastas do frontend esta organizada.
- O app esta implementado com Vue 3 + Composition API, Vue Router, Pinia e Firebase SDK.
- Existem telas reais para login/cadastro, painel do solicitante, painel do suporte, listas, detalhes, atendimento, perfil, 403 e 404.
- Layout interno, componentes comuns, componentes de chamados, toasts, tema Twilight e responsividade base ja estao implementados.

Status:

- Estrutura: pronta.
- Implementacao visual: pronta.
- Responsividade: implementada em base; pendente apenas revisao final em dispositivos reais.

---

### 2.2 Firebase Authentication

Requisitos:

- Cadastro de usuario.
- Login.
- Logout.
- Autenticacao com e-mail e senha.
- Controle de acesso a paginas protegidas.

Estado atual:

- Firebase SDK esta instalado no frontend.
- `frontend/src/firebase/configuracaoFirebase.js` inicializa Firebase App, Auth, Firestore e Analytics opcional. Storage nao faz parte do escopo Spark/free.
- Fluxo de autenticacao implementado em:
  - `frontend/src/servicos/servicoAutenticacao.js`
  - `frontend/src/composables/useAutenticacao.js`
  - `frontend/src/stores/storeAutenticacao.js`
  - `frontend/src/paginas/publicas/PaginaLogin.vue`
  - `frontend/src/paginas/publicas/PaginaCadastro.vue`
- Perfil do usuario implementa logout e autoexclusao com reautenticacao por senha.

Status:

- Configuracao Firebase: pronta.
- Cadastro: implementado.
- Login: implementado.
- Logout: implementado.
- Guards de rota: implementados.
- Autoexclusao: implementada no app; depende de deploy das regras Firestore para producao.

---

### 2.3 Cloud Firestore

Requisitos:

- Armazenar os dados da aplicacao no Firestore.
- Inserir dados.
- Consultar dados.
- Atualizar dados.
- Excluir dados.

Estado atual:

- Firestore esta disponivel no frontend via `db`, exportado por `configuracaoFirebase.js`.
- Chamados, sessoes, chat e historico estao implementados em:
  - `frontend/src/servicos/servicoChamado.js`
  - `frontend/src/servicos/servicoSessao.js`
  - `frontend/src/composables/useChamados.js`
  - `frontend/src/composables/useChat.js`
  - `frontend/src/composables/useSessao.js`
  - `frontend/src/stores/storeChamado.js`
  - `frontend/src/stores/storeSessao.js`
  - `backend/firebase/regras/firestore.rules`
  - `backend/firebase/indices/firestore.indexes.json`

Status:

- Configuracao do Firestore no app: pronta.
- Regras do Firestore: implementadas localmente.
- CRUD de chamados: implementado.
- Consultas por perfil: implementadas com escopo real por sessao.
- Chat (`tickets/{id}/mensagens`): implementado.
- Historico (`tickets/{id}/historico`): implementado client-side.
- Deploy de regras/indices: pendente em producao.

---

## 3. Estrutura atual do projeto

Estrutura geral:

```txt
TicketFlow/
├── backend/
├── frontend/
├── PlanoProximosPassos.md
└── ticketflow-especificacao-projeto.md
```

### 3.1 Frontend

O frontend esta em:

```txt
frontend/
```

Arquivos principais:

```txt
frontend/package.json
frontend/package-lock.json
frontend/index.html
frontend/vite.config.js
frontend/src/App.vue
frontend/src/main.js
```

Pastas principais dentro de `frontend/src`:

```txt
src/
├── assets/
├── componentes/
├── composables/
├── constantes/
├── estilos/
├── firebase/
├── paginas/
├── rotas/
├── servicos/
├── stores/
└── utils/
```

Estado atual:

- A estrutura foi restaurada.
- Os arquivos de aplicacao estao implementados.
- O router importa paginas reais, e nao placeholders.
- O fluxo de sessao por codigo, chamados, chat, notificacoes e perfil esta distribuido entre `servicos/`, `stores/`, `composables/`, `paginas/` e `componentes/`.
- Os arquivos gerados pelo Vite e pelo npm permanecem com conteudo normal.

Dependencias instaladas no frontend:

```txt
vue
vite
@vitejs/plugin-vue
firebase
pinia
vue-router
@lucide/vue
```

Scripts disponiveis no frontend:

```bash
npm run dev
npm run build
npm run preview
```

---

### 3.2 Backend

O backend esta em:

```txt
backend/
```

Pastas principais:

```txt
backend/
├── firebase/
├── funcoes/
└── scripts/
```

#### Firebase config

Local:

```txt
backend/firebase/
```

Arquivos:

```txt
.firebaserc
firebase.json
backend/firebase/.firebaserc
backend/firebase/firebase.json
backend/firebase/indices/firestore.indexes.json
backend/firebase/regras/firestore.rules
```

Estado atual:

- `.firebaserc` da raiz aponta para o projeto `projetoticketflow`.
- `firebase.json` da raiz e a fonte para deploy Spark/free com Firestore e Hosting.
- `backend/firebase/firebase.json` fica apenas como config auxiliar de Firestore; Hosting deve ser deployado pela raiz.
- `firestore.indexes.json` existe e possui indexes compostos para consultas por solicitante, status, prioridade e suporte por sessao.
- `firestore.rules` esta implementado para `users`, `tickets`, subcolecoes `historico`/`mensagens` e `sessoes`.
- `storage.rules` foi removido do escopo Spark/free.

Hosting configurado:

```txt
site: projetoticketflow-c3b5c
public: frontend/dist
```

Deploy futuro do hosting:

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting:projetoticketflow-c3b5c
```

#### Cloud Functions

Local:

```txt
backend/funcoes/
```

Arquivos:

```txt
backend/funcoes/package.json
backend/funcoes/package-lock.json
backend/funcoes/src/index.js
backend/funcoes/src/chamados.js
backend/funcoes/src/usuarios.js
```

Estado atual:

- `firebase-admin` instalado.
- `firebase-functions` instalado.
- `main` do `package.json` aponta para `src/index.js`.
- Arquivos de Functions existem como apoio/alternativa Blaze-only, mas nao entram no deploy Spark/free atual.
- Historico e chat do app atual sao gravados pelo cliente com regras Firestore, sem depender de Cloud Functions.

Dependencias instaladas no backend:

```txt
firebase-admin
firebase-functions
```

---

## 4. Modelo de dados atual

### 4.1 Colecao `users`

```txt
users/{uid}
  uid: string
  name: string
  email: string
  role: "requester" | "support"
  department: string | null
  active: boolean
  createdAt: timestamp
  updatedAt: timestamp
```

Finalidade:

- Guardar os dados complementares do usuario autenticado.
- Definir o perfil do usuario.
- Permitir redirecionamento e controle de acesso por perfil.

---

### 4.2 Colecao `tickets`

```txt
tickets/{ticketId}
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "waiting_requester" | "resolved" | "cancelled"
  location: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  sessionId: string
  sessionSupportId: string
  lastMessageAt: timestamp | null
  lastMessageBy: "requester" | "support" | null
  assignedToId: string | null
  assignedToName: string | null
  supportResponse: string | null
  resolution: string | null
  createdAt: timestamp
  updatedAt: timestamp
  resolvedAt: timestamp | null
  cancelledAt: timestamp | null
```

Finalidade:

- Registrar os chamados abertos pelos solicitantes.
- Permitir consulta, edicao, atualizacao de status, resposta e finalizacao.
- Amarrar cada chamado ao suporte da sessao (`sessionSupportId`), evitando leitura global entre suportes.
- Alimentar notificacoes de chat com `lastMessageAt`/`lastMessageBy`.
- Cumprir o CRUD completo exigido pelo professor.

---

### 4.3 Colecao `sessoes`

```txt
sessoes/{codigo}
  codigo: string
  suporteId: string
  suporteNome: string
  ativo: boolean
  criadoEm: timestamp
```

Finalidade:

- Permitir que o suporte gere um codigo de atendimento.
- Permitir que o solicitante entre com esse codigo antes de abrir chamados.
- Definir qual suporte enxerga os chamados daquele atendimento.

---

### 4.4 Subcolecoes de `tickets`

```txt
tickets/{ticketId}/mensagens/{mensagemId}
  autorId: string
  autorNome: string
  autorPapel: "requester" | "support"
  texto: string
  criadoEm: timestamp

tickets/{ticketId}/historico/{historicoId}
  acao: string
  statusAnterior: string | null
  statusNovo: string | null
  autorId: string
  autorNome: string
  criadoEm: timestamp
```

Finalidade:

- `mensagens`: conversa em tempo real entre solicitante e suporte.
- `historico`: trilha de auditoria criada pelo cliente no plano Spark/free.

---

## 5. Rotas atuais

Rotas publicas:

```txt
/login
/cadastro
```

Rotas do solicitante:

```txt
/solicitante/sessao
/solicitante/painel
/solicitante/chamados
/solicitante/chamados/novo
/solicitante/chamados/:id/editar
/solicitante/chamados/:id
```

Rotas do suporte:

```txt
/suporte/painel
/suporte/chamados
/suporte/chamados/urgentes
/suporte/solicitantes
/suporte/chamados/:id
```

Rotas compartilhadas:

```txt
/perfil
/nao-autorizado
```

Rota fallback:

```txt
/:pathMatch(.*)*
```

Regras esperadas:

- Usuario nao autenticado nao acessa rotas internas.
- Perfil `requester` acessa apenas area de solicitante.
- Perfil `support` acessa area de suporte.
- Solicitante sem sessao ativa vai para `/solicitante/sessao`.
- Apos login, redirecionar conforme perfil.

---

## 6. Ordem recomendada de implementacao

### Etapa 1 - Regras de seguranca do Firebase

Arquivos:

```txt
backend/firebase/regras/firestore.rules
```

O que implementar:

- Bloquear acesso anonimo aos dados internos.
- Permitir que cada usuario leia o proprio documento em `users`.
- Permitir criacao do proprio perfil apos cadastro.
- Permitir que solicitante crie chamados com o proprio UID.
- Permitir que solicitante leia apenas os proprios chamados.
- Permitir que solicitante edite ou exclua apenas chamados proprios e abertos.
- Permitir que suporte leia chamados vinculados as proprias sessoes (`sessionSupportId`).
- Permitir que suporte atualize status, resposta, solucao e responsavel.

Resultado esperado:

- Firestore protegido contra acesso indevido.
- Base segura antes da implementacao das telas.

---

### Etapa 2 - Constantes e utilitarios

Arquivos:

```txt
frontend/src/constantes/statusChamado.js
frontend/src/constantes/prioridadesChamado.js
frontend/src/constantes/categoriasChamado.js
frontend/src/constantes/perfisUsuario.js
frontend/src/utils/formatarData.js
frontend/src/utils/ordenarChamados.js
frontend/src/utils/validarEmail.js
```

O que implementar:

- Valores fixos de status, prioridades, categorias e perfis.
- Formatacao de datas.
- Validacao basica de e-mail.
- Ordenacao de chamados por data/prioridade/status.

Resultado esperado:

- Evitar strings soltas pelo projeto.
- Facilitar uso dos mesmos valores em telas, servicos e filtros.

---

### Etapa 3 - Servicos Firebase

Arquivos:

```txt
frontend/src/servicos/servicoAutenticacao.js
frontend/src/servicos/servicoUsuario.js
frontend/src/servicos/servicoChamado.js
```

O que implementar:

- Cadastro com e-mail e senha.
- Criacao do documento do usuario em `users`.
- Login.
- Logout.
- Busca do perfil do usuario.
- Criacao de chamado.
- Listagem dos chamados do solicitante.
- Listagem dos chamados vinculados ao suporte.
- Atualizacao de chamado.
- Exclusao de chamado aberto.
- Atualizacao de status/resposta/solucao pelo suporte.

Resultado esperado:

- A comunicacao com Firebase fica centralizada.
- As paginas nao precisam chamar Firebase diretamente.

---

### Etapa 4 - Stores e composables

Arquivos:

```txt
frontend/src/stores/storeAutenticacao.js
frontend/src/stores/storeChamado.js
frontend/src/composables/useAutenticacao.js
frontend/src/composables/useChamados.js
frontend/src/composables/useFormatarData.js
frontend/src/composables/useNotificacao.js
```

O que implementar:

- Estado do usuario autenticado.
- Estado do perfil do usuario.
- Estado de carregamento e erro.
- Lista de chamados.
- Chamado selecionado.
- Acoes reutilizaveis para login, logout, cadastro e CRUD.

Resultado esperado:

- Estado global consistente.
- Menos duplicacao de logica entre paginas.

---

### Etapa 5 - Rotas e guards

Arquivo:

```txt
frontend/src/rotas/index.js
```

O que implementar:

- Rotas publicas.
- Rotas protegidas.
- Rotas por perfil.
- Redirecionamento apos login.
- Bloqueio para usuarios nao autenticados.
- Bloqueio para perfil incorreto.

Resultado esperado:

- Controle de acesso exigido pelo professor funcionando no front-end.

---

### Etapa 6 - Base do app Vue

Arquivos:

```txt
frontend/src/main.js
frontend/src/App.vue
frontend/src/estilos/variaveis.css
frontend/src/estilos/global.css
frontend/src/estilos/responsivo.css
```

O que implementar:

- Criar app Vue.
- Registrar Pinia.
- Registrar Vue Router.
- Importar estilos globais.
- Criar estrutura raiz com `<RouterView />`.

Resultado esperado:

- Aplicacao Vue inicia corretamente.
- Base pronta para renderizar paginas.

---

### Etapa 7 - Componentes comuns e layout

Arquivos principais:

```txt
frontend/src/componentes/comuns/
frontend/src/componentes/layout/
```

O que implementar:

- Botoes.
- Campos de texto.
- Area de texto.
- Select.
- Modal.
- Loading.
- Estado vazio.
- Layout de autenticacao.
- Layout interno.
- Cabecalho.
- Menu lateral.

Resultado esperado:

- Base visual reutilizavel.
- Menos repeticao nas paginas.

---

### Etapa 8 - Paginas publicas

Arquivos:

```txt
frontend/src/paginas/publicas/PaginaLogin.vue
frontend/src/paginas/publicas/PaginaCadastro.vue
```

O que implementar:

- Formulario de login.
- Formulario de cadastro.
- Validacoes basicas.
- Mensagens de erro.
- Redirecionamento apos sucesso.

Resultado esperado:

- Usuario consegue criar conta e entrar no sistema.

---

### Etapa 9 - Fluxo do solicitante

Arquivos:

```txt
frontend/src/paginas/solicitante/PainelSolicitante.vue
frontend/src/paginas/solicitante/MeusChamados.vue
frontend/src/paginas/solicitante/NovoChamado.vue
frontend/src/paginas/solicitante/DetalhesChamadoSolicitante.vue
frontend/src/componentes/chamados/
```

O que implementar:

- Dashboard com resumo dos proprios chamados.
- Listagem de chamados do usuario.
- Criacao de chamado.
- Edicao de chamado aberto.
- Exclusao de chamado aberto.
- Visualizacao da resposta e solucao.

Resultado esperado:

- Solicitante consegue cumprir o fluxo principal do projeto.

---

### Etapa 10 - Fluxo do suporte

Arquivos:

```txt
frontend/src/paginas/suporte/PainelSuporte.vue
frontend/src/paginas/suporte/TodosChamados.vue
frontend/src/paginas/suporte/ChamadosUrgentes.vue
frontend/src/paginas/suporte/DetalhesChamadoSuporte.vue
frontend/src/componentes/chamados/
```

O que implementar:

- Dashboard com resumo geral.
- Listagem dos chamados vinculados ao suporte.
- Filtros por status, prioridade e categoria.
- Tela de detalhes.
- Assumir chamado.
- Atualizar status.
- Responder chamado.
- Registrar solucao.
- Finalizar atendimento.

Resultado esperado:

- Suporte consegue atender chamados de ponta a ponta.

---

### Etapa 11 - Paginas compartilhadas

Arquivos:

```txt
frontend/src/paginas/compartilhadas/PerfilUsuario.vue
frontend/src/paginas/compartilhadas/PaginaNaoAutorizada.vue
frontend/src/paginas/compartilhadas/PaginaNaoEncontrada.vue
```

O que implementar:

- Perfil do usuario logado.
- Pagina para acesso negado.
- Pagina 404.

Resultado esperado:

- Navegacao mais completa e profissional.

---

### Etapa 12 - Testes manuais e validacao

O que validar:

- Cadastro de solicitante.
- Cadastro de suporte.
- Login de solicitante.
- Login de suporte.
- Logout.
- Bloqueio de rotas sem login.
- Bloqueio de rotas por perfil.
- Criacao de chamado.
- Listagem de chamados do solicitante.
- Edicao de chamado aberto.
- Exclusao de chamado aberto.
- Listagem geral para suporte.
- Assumir chamado.
- Atualizar status.
- Responder chamado.
- Registrar solucao.
- Finalizar chamado.
- Persistencia correta no Firestore.
- Responsividade basica em desktop e celular.

---

## 7. Checklist de acompanhamento

### Configuracao inicial

- [x] Estrutura `frontend/` e `backend/`
- [x] Projeto Vue com Vite em `frontend/`
- [x] Dependencias do frontend instaladas
- [x] Dependencias das Functions instaladas
- [x] Firebase CLI instalada
- [x] Firebase login realizado
- [x] `.firebaserc` configurado
- [x] `firebase.json` configurado
- [x] Hosting configurado com `site`
- [x] Firebase config do frontend criado

### Backend/Firebase

- [x] Regras do Firestore
- [x] Storage removido do escopo Spark/free
- [x] Indexes necessarios do Firestore
- [x] Functions opcionais
- [x] Scripts de dados de teste
- [x] Regras para sessoes de atendimento
- [x] Regras para chat de chamado
- [x] Regras para historico de chamado
- [ ] Deploy de regras/indices em producao

### Base do frontend

- [x] Constantes
- [x] Utilitarios
- [x] `main.js` (Pinia + Router + iniciar sessao)
- [x] `App.vue` (shell: RouterView + toasts)
- [x] Estilos globais
- [x] Router
- [x] Pinia

### Autenticacao

- [x] Servico de autenticacao
- [x] Servico de usuario
- [x] Store de autenticacao
- [x] Login (UI)
- [x] Cadastro (UI)
- [x] Logout (UI - botao na sidebar)
- [x] Controle de sessao (guard + iniciar)
- [x] Redirecionamento por perfil (guard + rotaInicial)

### Chamados

- [x] Servico de chamados
- [x] Store de chamados
- [x] Sessao de atendimento por codigo
- [x] Criar chamado
- [x] Listar meus chamados
- [x] Ver detalhes
- [x] Editar chamado aberto
- [x] Excluir chamado aberto
- [x] Listar chamados vinculados ao suporte
- [x] Assumir chamado
- [x] Atualizar status
- [x] Responder chamado
- [x] Registrar solucao
- [x] Finalizar chamado
- [x] Chat em tempo real por chamado
- [x] Historico/timeline do chamado
- [x] Notificacao para suporte
- [x] Notificacao para solicitante
- [x] Autoexclusao de conta pelo app

### Interface

- [x] Layout publico (LayoutAutenticacao)
- [x] Layout interno (LayoutApp + MenuLateralApp + CabecalhoApp)
- [x] Componentes comuns
- [x] Componentes de chamados
- [x] Componentes de painel
- [x] Paginas publicas
- [x] Paginas do solicitante
- [x] Paginas do suporte
- [x] Paginas compartilhadas
- [x] Responsividade (auditada no codigo + 1 fix em `.grade-solicitantes`; falta so validar em dispositivo real)
- [x] Feedback visual de erro, loading e sucesso (toasts + EstadoCarregamento/Vazio)

---

## 8. Criterio para considerar o projeto pronto

O projeto pode ser considerado pronto quando:

- Um usuario consegue se cadastrar.
- Um usuario consegue fazer login.
- Um usuario consegue fazer logout.
- O sistema cria documento em `users` no Firestore.
- O sistema diferencia `requester` e `support`.
- Rotas protegidas funcionam.
- Rotas por perfil funcionam.
- Suporte gera/usa codigo de atendimento.
- Solicitante entra com codigo antes de abrir chamado.
- Solicitante cria chamado.
- Solicitante ve apenas os proprios chamados.
- Solicitante edita e exclui chamados abertos.
- Suporte ve chamados vinculados as proprias sessoes.
- Suporte assume chamados.
- Suporte atualiza status.
- Chat funciona entre solicitante e suporte.
- Notificacoes aparecem para suporte e solicitante.
- Suporte responde chamados.
- Suporte registra solucao.
- Suporte finaliza chamados.
- Autoexclusao remove conta e chamados abertos sem deixar perfil orfao.
- Dados persistem corretamente no Firestore.
- Interface e responsiva.
- Projeto pode ser executado localmente.
- Build do frontend funciona.
- Firestore rules/indexes estao deployados.
- Hosting esta pronto para deploy/deployado.

---

## 9. Comandos uteis

Rodar frontend:

```bash
cd frontend
npm run dev
```

Gerar build do frontend:

```bash
cd frontend
npm run build
```

Ver projeto Firebase ativo:

```bash
cd TicketFlow
firebase use
```

Deploy somente do hosting:

```bash
cd TicketFlow
firebase deploy --only hosting:projetoticketflow-c3b5c
```

Deploy somente do Firestore:

```bash
cd TicketFlow
firebase deploy --only firestore
```

Deploy completo do Firebase configurado no Spark/free:

```bash
cd TicketFlow
firebase deploy
```

---

## 10. Proximo passo imediato

O proximo passo recomendado e validar o app em Firebase real:

1. Criar Firestore Database no Console (Native mode), se ainda nao existir.
2. Ativar Authentication -> E-mail/Senha.
3. Rodar `firebase deploy --only firestore` a partir da raiz.
4. Rodar `cd frontend && npm run dev`.
5. Testar ponta a ponta:
   - cadastro/login de suporte;
   - geracao de codigo de atendimento;
   - cadastro/login de solicitante;
   - entrada do solicitante com codigo;
   - criacao/listagem/edicao/exclusao de chamado aberto;
   - notificacao de novo chamado para suporte;
   - atendimento com assumir, status, chat, resposta, solucao e finalizacao;
   - notificacao de resposta/mensagem para solicitante;
   - guards de rota e autoexclusao.

Depois dos testes manuais: revisar responsividade final, gerar `npm run build` e fazer deploy do hosting.
