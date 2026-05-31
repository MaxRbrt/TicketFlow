// ============================================================================
// TicketFlow - useAutenticacao
// ----------------------------------------------------------------------------
// Camada de conveniencia entre as telas e a store de autenticacao. Adiciona:
//   - traducao das mensagens de erro do Firebase para portugues (RNF010);
//   - notificacoes de sucesso/erro (RNF006);
//   - retorno padronizado { ok, erro } para simplificar o uso nas telas.
// ============================================================================

import { storeToRefs } from "pinia";
import { useStoreAutenticacao } from "../stores/storeAutenticacao.js";
import { useNotificacao } from "./useNotificacao.js";

// Mapa de codigos de erro do Firebase Auth -> mensagem amigavel em portugues.
const MENSAGENS_ERRO = {
  "auth/invalid-email": "E-mail invalido.",
  "auth/user-disabled": "Esta conta esta desativada.",
  "auth/user-not-found": "Nao foi possivel fazer login. Verifique seus dados.",
  "auth/wrong-password": "Nao foi possivel fazer login. Verifique seus dados.",
  "auth/invalid-credential": "Nao foi possivel fazer login. Verifique seus dados.",
  "auth/email-already-in-use": "Este e-mail ja esta cadastrado.",
  "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
  "auth/operation-not-allowed": "Cadastro por e-mail e senha nao esta ativado no Firebase Authentication.",
  "auth/admin-restricted-operation": "Cadastro bloqueado pela configuracao do Firebase Authentication.",
  "auth/invalid-api-key": "A chave da aplicacao Firebase esta invalida.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/network-request-failed": "Falha de conexao. Verifique sua internet.",
  "auth/requires-recent-login": "Sua sessao expirou. Faca login novamente para excluir a conta.",
  "auth/missing-password": "Informe sua senha para confirmar.",
  "permission-denied": "A conta foi autenticada, mas o Firestore bloqueou a criacao do perfil.",
  "unavailable": "Firebase indisponivel no momento. Tente novamente em instantes.",
};

/**
 * Traduz um erro do Firebase para mensagem amigavel.
 * @param {*} erro - Erro lancado pelo Firebase (tem `code`).
 * @returns {string} Mensagem em portugues.
 */
function traduzirErro(erro) {
  console.error("Erro Firebase:", erro?.code || erro?.message || erro);
  return (
    MENSAGENS_ERRO[erro?.code] ||
    `Ocorreu um erro inesperado${erro?.code ? ` (${erro.code})` : ""}. Tente novamente.`
  );
}

export function useAutenticacao() {
  const store = useStoreAutenticacao();
  const notificacao = useNotificacao();

  // Refs reativas do estado/getters da store (mantem reatividade no template).
  const { usuario, perfil, carregando, estaLogado, ehSuporte, ehSolicitante, nome, papel, rotaInicial } =
    storeToRefs(store);

  /**
   * Login com feedback. Retorna { ok, usuario?, erro? }.
   */
  async function entrar(email, senha) {
    try {
      const u = await store.entrar(email, senha);
      notificacao.sucesso("Login realizado com sucesso.");
      return { ok: true, usuario: u };
    } catch (erro) {
      const mensagem = traduzirErro(erro);
      notificacao.erro(mensagem);
      return { ok: false, erro: mensagem };
    }
  }

  /**
   * Cadastro com feedback. Retorna { ok, usuario?, erro? }.
   * @param {object} dados - { nome, email, senha, perfil, departamento? }.
   */
  async function cadastrar(dados) {
    try {
      const u = await store.cadastrar(dados);
      notificacao.sucesso("Conta criada com sucesso.");
      return { ok: true, usuario: u };
    } catch (erro) {
      const mensagem = traduzirErro(erro);
      notificacao.erro(mensagem);
      return { ok: false, erro: mensagem };
    }
  }

  /**
   * Logout com feedback.
   */
  async function sair() {
    try {
      await store.sair();
      return { ok: true };
    } catch (erro) {
      notificacao.erro(traduzirErro(erro));
      return { ok: false };
    }
  }

  /**
   * Autoexclusao de conta com feedback. Apaga dados no Firestore e a conta no
   * Authentication. Retorna { ok, erro? }.
   * @param {string} senha - Senha atual, para reautenticacao.
   */
  async function excluirConta(senha) {
    try {
      await store.excluirConta(senha);
      notificacao.sucesso("Sua conta foi excluida.");
      return { ok: true };
    } catch (erro) {
      const mensagem = traduzirErro(erro);
      notificacao.erro(mensagem);
      return { ok: false, erro: mensagem };
    }
  }

  return {
    // estado reativo
    usuario,
    perfil,
    carregando,
    estaLogado,
    ehSuporte,
    ehSolicitante,
    nome,
    papel,
    rotaInicial,
    // acoes com feedback
    entrar,
    cadastrar,
    sair,
    excluirConta,
  };
}
