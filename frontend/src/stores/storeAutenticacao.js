// ============================================================================
// TicketFlow - Store de autenticacao (Pinia)
// ----------------------------------------------------------------------------
// Guarda o estado global do usuario autenticado e do seu perfil (role). E a
// fonte de verdade para o controle de acesso por perfil (usado pelos guards de
// rota e pelos menus). Delega as operacoes ao servico de autenticacao.
// ============================================================================

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  observarAutenticacao,
  cadastrar as cadastrarServico,
  entrar as entrarServico,
  sair as sairServico,
  reautenticar as reautenticarServico,
  excluirContaAtual,
} from "../servicos/servicoAutenticacao.js";
import { buscarPerfilUsuario, excluirPerfilUsuario } from "../servicos/servicoUsuario.js";
import { excluirChamadosAbertosDoSolicitante } from "../servicos/servicoChamado.js";
import { PERFIL, rotaInicialDoPerfil } from "../constantes/perfisUsuario.js";

export const useStoreAutenticacao = defineStore("autenticacao", () => {
  // ----- Estado ------------------------------------------------------------
  const usuario = ref(null); // usuario do Firebase Authentication
  const perfil = ref(null); // documento de `users` (com role)
  const carregando = ref(true); // true ate a sessao ser resolvida na 1a vez
  const inicializado = ref(false); // a escuta de sessao ja foi configurada?

  // Promessa unica que resolve quando a sessao e conhecida pela 1a vez.
  // Cacheada para que main.js e o guard de rota compartilhem a MESMA espera
  // (evita registrar dois listeners e garante que o guard espere a restauracao
  // da sessao no F5 antes de decidir o redirecionamento).
  let promessaPronto = null;

  // ----- Getters -----------------------------------------------------------
  const estaLogado = computed(() => !!usuario.value);
  const papel = computed(() => perfil.value?.role || null);
  const ehSuporte = computed(() => papel.value === PERFIL.SUPORTE);
  const ehSolicitante = computed(() => papel.value === PERFIL.SOLICITANTE);
  const nome = computed(() => perfil.value?.name || usuario.value?.displayName || "");

  // Rota inicial conforme o perfil (usada no redirecionamento pos-login).
  const rotaInicial = computed(() =>
    papel.value ? rotaInicialDoPerfil(papel.value) : "/login"
  );

  // ----- Acoes -------------------------------------------------------------

  /**
   * Carrega o perfil do Firestore para o usuario informado.
   * @param {import("firebase/auth").User|null} u
   */
  async function carregarPerfil(u) {
    if (!u) {
      perfil.value = null;
      return;
    }

    try {
      perfil.value = await buscarPerfilUsuario(u.uid);
    } catch (erro) {
      console.error("Erro ao carregar perfil do usuario:", erro?.code || erro);
      perfil.value = null;
    }
  }

  /**
   * Inicia a escuta da sessao. Resolve a Promise no primeiro estado conhecido,
   * permitindo que o router aguarde antes de liberar as rotas.
   * @returns {Promise<import("firebase/auth").User|null>}
   */
  function iniciar() {
    // Idempotente: se ja iniciou, devolve a mesma promessa (nao registra outro
    // listener nem cria nova espera).
    if (promessaPronto) return promessaPronto;

    promessaPronto = new Promise((resolve) => {
      observarAutenticacao(async (u) => {
        try {
          usuario.value = u;
          await carregarPerfil(u);
          resolve(u);
        } catch (erro) {
          console.error("Erro ao inicializar autenticacao:", erro?.code || erro);
          usuario.value = u || null;
          perfil.value = null;
          resolve(u || null);
        } finally {
          carregando.value = false;
          inicializado.value = true;
        }
      });
    });
    return promessaPronto;
  }

  /**
   * Espera a sessao ser resolvida pela primeira vez. Usado pelo guard de rota
   * para nao decidir o redirecionamento antes de a sessao ser restaurada (corrige
   * o "F5 -> login"). Inicia a escuta se ainda nao tiver iniciado.
   * @returns {Promise<import("firebase/auth").User|null>}
   */
  function aguardarPronto() {
    return iniciar();
  }

  /**
   * Cadastra um novo usuario e ja carrega o perfil criado.
   * @param {object} dados - { nome, email, senha, perfil, departamento? }.
   */
  async function cadastrar(dados) {
    const u = await cadastrarServico(dados);
    usuario.value = u;
    await carregarPerfil(u);
    return u;
  }

  /**
   * Faz login e carrega o perfil do usuario.
   * @param {string} email
   * @param {string} senha
   */
  async function entrar(email, senha) {
    const u = await entrarServico(email, senha);
    usuario.value = u;
    await carregarPerfil(u);
    return u;
  }

  /**
   * Encerra a sessao e limpa o estado.
   */
  async function sair() {
    await sairServico();
    usuario.value = null;
    perfil.value = null;
  }

  /**
   * Autoexclusao de conta (opcao A). Remove os dados do usuario no Firestore e
   * a conta no Authentication, nesta ordem (o cliente perde permissao no
   * Firestore assim que a conta do Auth e apagada):
   *   1. Reautentica (Firebase exige login recente p/ exclusao).
   *   2. Apaga os chamados ABERTOS do usuario (os demais ficam como historico).
   *   3. Apaga o documento de perfil em `users`.
   *   4. Apaga a conta no Authentication.
   *   5. Limpa o estado local.
   *
   * @param {string} senha - Senha atual, para reautenticacao.
   */
  async function excluirConta(senha) {
    const u = usuario.value;
    if (!u) {
      throw new Error("Nenhum usuario autenticado.");
    }

    await reautenticarServico(senha);
    await excluirChamadosAbertosDoSolicitante(u.uid);
    await excluirPerfilUsuario(u.uid);
    await excluirContaAtual();

    usuario.value = null;
    perfil.value = null;
  }

  return {
    // estado
    usuario,
    perfil,
    carregando,
    inicializado,
    // getters
    estaLogado,
    papel,
    ehSuporte,
    ehSolicitante,
    nome,
    rotaInicial,
    // acoes
    iniciar,
    aguardarPronto,
    cadastrar,
    entrar,
    sair,
    excluirConta,
  };
});
