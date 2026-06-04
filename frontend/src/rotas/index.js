// ============================================================================
// TicketFlow - Rotas e controle de acesso (Vue Router)
// ----------------------------------------------------------------------------
// Define as rotas publicas, do solicitante, do suporte e compartilhadas, e os
// guards que garantem o controle de acesso exigido pelo professor:
//   - usuario nao autenticado nao acessa rotas internas;
//   - cada perfil so acessa a sua area;
//   - apos o login, o usuario e enviado para o painel do seu perfil.
//
// IMPORTANTE (estado atual): as paginas reais ainda nao existem. Por isso as
// rotas apontam para o placeholder `EmConstrucao`. Conforme cada pagina for
// implementada (Etapas 8-11), troque o `component` da rota correspondente.
// ============================================================================

import { createRouter, createWebHistory } from "vue-router";
import { useStoreAutenticacao } from "../stores/storeAutenticacao.js";
import { useStoreSessao } from "../stores/storeSessao.js";
import { PERFIL } from "../constantes/perfisUsuario.js";

// Paginas publicas (Etapa 8).
import PaginaLogin from "../paginas/publicas/PaginaLogin.vue";
import PaginaCadastro from "../paginas/publicas/PaginaCadastro.vue";

// Paginas do solicitante (Etapa 9).
import PainelSolicitante from "../paginas/solicitante/PainelSolicitante.vue";
import MeusChamados from "../paginas/solicitante/MeusChamados.vue";
import NovoChamado from "../paginas/solicitante/NovoChamado.vue";
import DetalhesChamadoSolicitante from "../paginas/solicitante/DetalhesChamadoSolicitante.vue";
import EntrarSessao from "../paginas/solicitante/EntrarSessao.vue";

// Paginas do suporte (Etapa 10).
import PainelSuporte from "../paginas/suporte/PainelSuporte.vue";
import TodosChamados from "../paginas/suporte/TodosChamados.vue";
import ChamadosUrgentes from "../paginas/suporte/ChamadosUrgentes.vue";
import MeusSolicitantes from "../paginas/suporte/MeusSolicitantes.vue";
import DetalhesChamadoSuporte from "../paginas/suporte/DetalhesChamadoSuporte.vue";

// Paginas compartilhadas (Etapa 11).
import PerfilUsuario from "../paginas/compartilhadas/PerfilUsuario.vue";
import PaginaNaoAutorizada from "../paginas/compartilhadas/PaginaNaoAutorizada.vue";
import PaginaNaoEncontrada from "../paginas/compartilhadas/PaginaNaoEncontrada.vue";

// ----------------------------------------------------------------------------
// Tabela de rotas
// ----------------------------------------------------------------------------
// Convencoes de meta:
//   - somenteVisitante: rota so para quem NAO esta logado (login/cadastro).
//   - requiresAuth: exige usuario autenticado.
//   - perfil: restringe a um perfil especifico (requester | support).
//   - titulo: usado pelo placeholder e pelo <title> da aba.
const routes = [
  // ----- Raiz: o guard redireciona conforme a sessao --------------------
  { path: "/", redirect: "/login" },

  // ----- Publicas -------------------------------------------------------
  {
    path: "/login",
    name: "login",
    component: PaginaLogin,
    meta: { somenteVisitante: true, titulo: "Entrar" },
  },
  {
    path: "/cadastro",
    name: "cadastro",
    component: PaginaCadastro,
    meta: { somenteVisitante: true, titulo: "Criar conta" },
  },

  // ----- Solicitante (perfil requester) ---------------------------------
  // `exigeSessao`: so acessa apos vincular um codigo de atendimento do suporte.
  {
    path: "/solicitante/sessao",
    name: "solicitante-sessao",
    component: EntrarSessao,
    meta: { requiresAuth: true, perfil: PERFIL.SOLICITANTE, ehSessao: true, titulo: "Conectar ao suporte" },
  },
  {
    path: "/solicitante/painel",
    name: "solicitante-painel",
    component: PainelSolicitante,
    meta: { requiresAuth: true, perfil: PERFIL.SOLICITANTE, exigeSessao: true, titulo: "Meu Painel" },
  },
  {
    path: "/solicitante/chamados",
    name: "solicitante-chamados",
    component: MeusChamados,
    meta: { requiresAuth: true, perfil: PERFIL.SOLICITANTE, exigeSessao: true, titulo: "Meus Chamados" },
  },
  {
    path: "/solicitante/chamados/novo",
    name: "solicitante-novo-chamado",
    component: NovoChamado,
    meta: { requiresAuth: true, perfil: PERFIL.SOLICITANTE, exigeSessao: true, titulo: "Novo Chamado" },
  },
  {
    path: "/solicitante/chamados/:id/editar",
    name: "solicitante-editar-chamado",
    component: NovoChamado,
    meta: { requiresAuth: true, perfil: PERFIL.SOLICITANTE, exigeSessao: true, titulo: "Editar Chamado" },
  },
  {
    path: "/solicitante/chamados/:id",
    name: "solicitante-detalhes-chamado",
    component: DetalhesChamadoSolicitante,
    meta: { requiresAuth: true, perfil: PERFIL.SOLICITANTE, exigeSessao: true, titulo: "Detalhes do Chamado" },
  },

  // ----- Suporte (perfil support) ---------------------------------------
  {
    path: "/suporte/painel",
    name: "suporte-painel",
    component: PainelSuporte,
    meta: { requiresAuth: true, perfil: PERFIL.SUPORTE, titulo: "Central de Suporte" },
  },
  {
    path: "/suporte/chamados",
    name: "suporte-chamados",
    component: TodosChamados,
    meta: { requiresAuth: true, perfil: PERFIL.SUPORTE, titulo: "Todos os Chamados" },
  },
  {
    path: "/suporte/chamados/urgentes",
    name: "suporte-urgentes",
    component: ChamadosUrgentes,
    meta: { requiresAuth: true, perfil: PERFIL.SUPORTE, titulo: "Chamados Urgentes" },
  },
  {
    path: "/suporte/solicitantes",
    name: "suporte-solicitantes",
    component: MeusSolicitantes,
    meta: { requiresAuth: true, perfil: PERFIL.SUPORTE, titulo: "Meus Solicitantes" },
  },
  {
    path: "/suporte/chamados/:id",
    name: "suporte-detalhes-chamado",
    component: DetalhesChamadoSuporte,
    meta: { requiresAuth: true, perfil: PERFIL.SUPORTE, titulo: "Atendimento" },
  },

  // ----- Compartilhadas (qualquer usuario autenticado) ------------------
  {
    path: "/perfil",
    name: "perfil",
    component: PerfilUsuario,
    meta: { requiresAuth: true, titulo: "Meu Perfil" },
  },
  {
    path: "/nao-autorizado",
    name: "nao-autorizado",
    component: PaginaNaoAutorizada,
    meta: { titulo: "Acesso negado" },
  },

  // ----- Fallback 404 ---------------------------------------------------
  {
    path: "/:pathMatch(.*)*",
    name: "nao-encontrada",
    component: PaginaNaoEncontrada,
    meta: { titulo: "Pagina nao encontrada" },
  },
];

// ----------------------------------------------------------------------------
// Instancia do router
// ----------------------------------------------------------------------------
const router = createRouter({
  history: createWebHistory(),
  routes,
  // Rola para o topo ao trocar de rota.
  scrollBehavior() {
    return { top: 0 };
  },
});

// ----------------------------------------------------------------------------
// Guard global: controle de acesso
// ----------------------------------------------------------------------------
router.beforeEach(async (to) => {
  const auth = useStoreAutenticacao();

  // 0. Espera a sessao ser restaurada antes de decidir (corrige o "F5 -> login":
  // sem isso, a navegacao inicial roda com usuario=null e redireciona pro login
  // antes de o Firebase restaurar a sessao). Apos a 1a vez, resolve na hora.
  await auth.aguardarPronto();

  // 1. Raiz: envia para o painel do perfil (se logado) ou para o login.
  if (to.path === "/") {
    return auth.estaLogado ? auth.rotaInicial : "/login";
  }

  // 2. Rota so para visitantes (login/cadastro): redireciona apenas quando
  // ja existe perfil carregado. Se o Auth ficou logado sem perfil no Firestore,
  // manter login/cadastro acessiveis evita loop para /login.
  if (to.meta.somenteVisitante && auth.estaLogado && auth.papel) {
    return auth.rotaInicial;
  }

  // 3. Rota protegida: exige autenticacao.
  if (to.meta.requiresAuth && !auth.estaLogado) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  // 4. Rota restrita a um perfil: bloqueia perfil incorreto.
  if (to.meta.perfil && auth.papel !== to.meta.perfil) {
    return "/nao-autorizado";
  }

  // 5. Vinculo de sessao (solicitante): garante que o solicitante esteja
  // conectado a um suporte (via codigo) antes de usar a area de chamados.
  if (auth.estaLogado && auth.ehSolicitante && auth.usuario?.uid) {
    const sessao = useStoreSessao();
    sessao.carregarDoStorage(auth.usuario.uid);

    // Rota interna exige vinculo: sem sessao ativa -> tela de conexao.
    if (to.meta.exigeSessao && !sessao.ativa) {
      return "/solicitante/sessao";
    }
    // Ja conectado e indo para a tela de conexao -> manda para o painel.
    if (to.meta.ehSessao && sessao.ativa) {
      return "/solicitante/painel";
    }
  }

  // Caso contrario, segue normalmente.
  return true;
});

// Atualiza o titulo da aba conforme a rota.
router.afterEach((to) => {
  const base = "TicketFlow";
  document.title = to.meta?.titulo ? `${to.meta.titulo} - ${base}` : base;
});

export default router;
