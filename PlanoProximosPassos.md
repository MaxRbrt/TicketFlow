# TicketFlow - Plano de Proximos Passos

> INSTRUCAO PARA IA: Leia este documento inteiro no inicio de cada sessao. Ele e a fonte de verdade sobre o que foi feito, o que esta pendente e qual e o proximo passo. Atualize o LOG e o CHECKLIST apos cada arquivo implementado.

---

## STATUS ATUAL DA SESSAO

**Ultimo arquivo implementado:** FIX sino suporte — `DetalhesChamadoSuporte.vue` agora chama `marcarLido(id)` no `onMounted`. Bug: abrir chamado por fora do sino (lista "Todos os Chamados") nao baixava o badge; so o clique no sino (`aoAbrirItem`) marcava lido. Lado solicitante ja fazia isso (watch+`marcarVisto`); faltava o equivalente no suporte. Sem build (feedback do usuario).

**Antes desse fix:** Central de notificacoes do SUPORTE (sino funcional). Antes o sino do CabecalhoApp era decorativo (sem handler/badge/painel) e chamado novo do solicitante so aparecia na lista, sem aviso. Agora: escuta dedicada de chamados ABERTOS sem responsavel (`observarChamadosAbertos`, query equality-only = sem indice), composable singleton `useNotificacaoSuporte` (lista `pendentes` + `quantidade`, toast "Novo chamado: ..." na chegada, semeia na 1a carga p/ nao avisar antigos), App.vue liga/desliga a escuta via `watch(ehSuporte)`, e o sino virou badge pulsante + dropdown (clica -> lista pendentes -> link p/ atendimento, fecha fora/Esc). So o suporte ve o sino. Sem build (feedback do usuario).  
**Proximo passo imediato:** Etapa 12 — testes manuais ponta a ponta (cadastro/login solicitante+suporte, CRUD, assumir/status/responder/finalizar, guards, autoexclusao, responsividade). Pre-req: Auth email/senha ativado + Firestore DB criado + `firebase deploy --only firestore` (regras+indices; necessario p/ a nova regra de delete de perfil valer). Depois: revisar responsividade final, gerar build e deploy de hosting.  
**Sessao atual:** 3 (2026-05-31)  

**>>> CHECKPOINT DE TESTE 1 disponivel:** com Auth(email/senha) ativado + regras Firestore deployadas, da pra testar TODO o fluxo do solicitante: cadastro/login -> painel -> novo chamado -> lista/filtros -> detalhes -> editar/cancelar/excluir.

**PLANO FREE (Spark) - CONFIG AJUSTADA:** projeto roda 100% no free usando Auth + Firestore + Hosting (+ Analytics opcional). Storage e Cloud Functions exigem Blaze para este escopo e foram REMOVIDOS do deploy em `firebase.json`. Codigo das Functions continua em `backend/funcoes/` como opcional Blaze-only, sem deploy. `configuracaoFirebase.js` nao usa Storage e `storage.rules` foi removido.

**PRE-REQUISITOS p/ testar (usuario faz):**
1. Firestore Database criado no Console (Native mode).
2. Authentication -> Sign-in method -> ativar E-mail/Senha.
3. Deploy SO do firestore quando for publicar regras: `firebase deploy --only firestore` a partir da raiz do projeto. NAO usar storage/functions no deploy.
4. Fix aplicado: cadastro grava `usuario.email` (canonico) p/ casar com regra `email == auth.token.email`.

**App roda de verdade agora:** localhost:5173. `/` -> /login (placeholder EmConstrucao). Guards ativos (rota protegida sem login redireciona p/ /login; perfil errado -> /nao-autorizado). Paginas reais ainda sao placeholders (rotas apontam p/ `componentes/comuns/EmConstrucao.vue`; trocar o `component` da rota ao implementar cada pagina).

**Servidor de desenvolvimento:** rodando via `npm run dev` em http://localhost:5173 (HMR ativo). App.vue = vitrine temporaria do design system.

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

**Notas tecnicas da sessao 1:**
- Constantes usam as chaves = valores exatos do Firestore (open/in_progress/...; low/medium/...; requester/support). Cores apontam para tokens CSS (`var(--cor-...)`) que serao definidos em `variaveis.css`.
- Constantes + utils testados via Node ESM (smoke test): todas as funcoes retornaram o esperado.
- DECISAO PENDENTE de design: tokens de cor do design (soft glassmorphism) ja definidos na memoria do projeto; serao escritos em `variaveis.css` na proxima etapa.
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
- Suporte: visualiza todos os chamados, assume atendimentos, altera status, responde, registra solucao e finaliza chamados.

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
- Os arquivos principais ainda estao vazios e precisam ser implementados.

Status:

- Estrutura: pronta.
- Implementacao visual: pendente.
- Responsividade: pendente.

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
- Existem arquivos planejados para autenticacao:
  - `frontend/src/servicos/servicoAutenticacao.js`
  - `frontend/src/composables/useAutenticacao.js`
  - `frontend/src/stores/storeAutenticacao.js`
  - `frontend/src/paginas/publicas/PaginaLogin.vue`
  - `frontend/src/paginas/publicas/PaginaCadastro.vue`

Status:

- Configuracao Firebase: pronta.
- Cadastro: pendente.
- Login: pendente.
- Logout: pendente.
- Guards de rota: pendente.

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
- Existem arquivos planejados para os chamados:
  - `frontend/src/servicos/servicoChamado.js`
  - `frontend/src/composables/useChamados.js`
  - `frontend/src/stores/storeChamado.js`
  - `backend/firebase/regras/firestore.rules`
  - `backend/firebase/indices/firestore.indexes.json`

Status:

- Configuracao do Firestore no app: pronta.
- Regras do Firestore: implementadas localmente.
- CRUD de chamados: pendente.
- Consultas por perfil: pendente.

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
- Os arquivos de aplicacao estao vazios, exceto `src/firebase/configuracaoFirebase.js`.
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
- `firestore.indexes.json` existe e esta valido, ainda sem indexes customizados.
- `firestore.rules` esta vazio.
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
- Arquivos `index.js`, `chamados.js` e `usuarios.js` ainda estao vazios.

Dependencias instaladas no backend:

```txt
firebase-admin
firebase-functions
```

---

## 4. Modelo de dados planejado

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
- Cumprir o CRUD completo exigido pelo professor.

---

## 5. Rotas planejadas

Rotas publicas:

```txt
/login
/cadastro
```

Rotas do solicitante:

```txt
/solicitante/painel
/solicitante/chamados
/solicitante/chamados/novo
/solicitante/chamados/:id
```

Rotas do suporte:

```txt
/suporte/painel
/suporte/chamados
/suporte/chamados/urgentes
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
- Permitir que suporte leia todos os chamados.
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
- Listagem de todos os chamados para suporte.
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
- Listagem de todos os chamados.
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
- [x] Regras do Storage
- [x] Indexes necessarios do Firestore
- [x] Functions opcionais
- [ ] Scripts de dados de teste

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
- [x] Criar chamado
- [x] Listar meus chamados
- [x] Ver detalhes
- [x] Editar chamado aberto
- [x] Excluir chamado aberto
- [x] Listar todos os chamados para suporte
- [x] Assumir chamado
- [x] Atualizar status
- [x] Responder chamado
- [x] Registrar solucao
- [x] Finalizar chamado

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
- [~] Responsividade (layout/componentes ja responsivos; revisar no fim)
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
- Solicitante cria chamado.
- Solicitante ve apenas os proprios chamados.
- Solicitante edita e exclui chamados abertos.
- Suporte ve todos os chamados.
- Suporte assume chamados.
- Suporte atualiza status.
- Suporte responde chamados.
- Suporte registra solucao.
- Suporte finaliza chamados.
- Dados persistem corretamente no Firestore.
- Interface e responsiva.
- Projeto pode ser executado localmente.
- Build do frontend funciona.
- Hosting esta pronto para deploy.

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

Deploy completo do Firebase configurado no Spark/free:

```bash
cd TicketFlow
firebase deploy
```

---

## 10. Proximo passo imediato

O proximo passo recomendado e implementar:

```txt
backend/firebase/regras/firestore.rules
```

Motivo:

- As regras de seguranca sao a base do backend no Firebase.
- Elas protegem os dados antes da criacao das telas.
- Elas garantem que o controle por perfil nao fique apenas no front-end.

Depois disso, a ordem natural e implementar as constantes e os servicos Firebase do frontend.
