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
import { recuperarSenha as recuperarSenhaServico } from "../servicos/servicoAutenticacao.js";
import { traduzirErro } from "../utils/errorHandler.js";

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
   * Envia e-mail de recuperacao de senha (RF extra). Por seguranca, o Firebase
   * nao revela se o e-mail existe; mostramos a mesma mensagem de sucesso em
   * qualquer caso (exceto erros de formato/conexao). Retorna { ok, erro? }.
   * @param {string} email - E-mail para onde enviar o link de redefinicao.
   */
  async function recuperarSenha(email) {
    try {
      await recuperarSenhaServico(email);
      notificacao.sucesso(
        "Se este e-mail estiver cadastrado, enviamos um link para redefinir a senha."
      );
      return { ok: true };
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
    recuperarSenha,
    sair,
    excluirConta,
  };
}
