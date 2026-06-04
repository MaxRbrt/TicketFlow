// ============================================================================
// TicketFlow - useSessao
// ----------------------------------------------------------------------------
// Camada de conveniencia entre as telas e a store de sessao. Concentra:
//   - validacao do codigo (solicitante) e geracao do codigo (suporte);
//   - notificacoes de sucesso/erro (RNF006);
//   - retorno padronizado { ok, ... } para as telas.
// ============================================================================

import { storeToRefs } from "pinia";
import { useStoreSessao } from "../stores/storeSessao.js";
import { useStoreAutenticacao } from "../stores/storeAutenticacao.js";
import { useNotificacao } from "./useNotificacao.js";
import {
  criarSessao,
  buscarSessao,
  buscarSessaoAtivaDoSuporte,
  encerrarSessao,
} from "../servicos/servicoSessao.js";

export function useSessao() {
  const store = useStoreSessao();
  const auth = useStoreAutenticacao();
  const notificacao = useNotificacao();

  const { codigo, suporteId, suporteNome, ativa } = storeToRefs(store);

  /**
   * SOLICITANTE entra com um codigo. Valida a existencia e o estado ativo da
   * sessao; em caso de sucesso, vincula e persiste.
   * @param {string} codigoDigitado - Codigo informado pelo solicitante.
   * @returns {Promise<{ok: boolean, erro?: string}>}
   */
  async function entrarComCodigo(codigoDigitado) {
    const uid = auth.usuario?.uid;
    if (!uid) {
      return { ok: false, erro: "Sessao de usuario invalida." };
    }

    const normalizado = (codigoDigitado || "").trim().toUpperCase();
    if (normalizado.length < 6) {
      notificacao.erro("Informe o codigo completo (6 caracteres).");
      return { ok: false };
    }

    try {
      const sessao = await buscarSessao(normalizado);
      if (!sessao) {
        notificacao.erro("Codigo nao encontrado. Confira com o suporte.");
        return { ok: false };
      }
      if (!sessao.ativo) {
        notificacao.erro("Esta sessao foi encerrada pelo suporte.");
        return { ok: false };
      }

      store.definir(
        {
          codigo: sessao.codigo,
          suporteId: sessao.suporteId,
          suporteNome: sessao.suporteNome,
        },
        uid
      );
      notificacao.sucesso(`Conectado ao suporte ${sessao.suporteNome || ""}.`.trim());
      return { ok: true };
    } catch (erro) {
      console.error("Erro ao entrar na sessao:", erro?.code || erro);
      notificacao.erro("Nao foi possivel validar o codigo. Tente novamente.");
      return { ok: false, erro };
    }
  }

  /**
   * SUPORTE gera (ou regera) o proprio codigo de sessao e o mantem como ativo.
   * @returns {Promise<{ok: boolean, codigo?: string}>}
   */
  async function gerarCodigoSuporte() {
    const uid = auth.usuario?.uid;
    if (!uid) return { ok: false };

    try {
      const sessao = await criarSessao({ uid, nome: auth.nome });
      store.definir(sessao, uid);
      notificacao.sucesso("Codigo de sessao gerado.");
      return { ok: true, codigo: sessao.codigo };
    } catch (erro) {
      console.error("Erro ao gerar codigo de sessao:", erro?.code || erro);
      notificacao.erro("Nao foi possivel gerar o codigo. Tente novamente.");
      return { ok: false };
    }
  }

  /**
   * SUPORTE carrega a sessao ativa existente (ao abrir o painel). Se nao houver
   * vinculo em memoria, busca no Firestore a sessao ativa mais recente.
   * @returns {Promise<{ok: boolean, codigo?: string}>}
   */
  async function carregarSessaoSuporte() {
    const uid = auth.usuario?.uid;
    if (!uid) return { ok: false };

    store.carregarDoStorage(uid);
    if (store.ativa) return { ok: true, codigo: store.codigo };

    try {
      const sessao = await buscarSessaoAtivaDoSuporte(uid);
      if (sessao) {
        store.definir(sessao, uid);
        return { ok: true, codigo: sessao.codigo };
      }
    } catch (erro) {
      console.error("Erro ao carregar sessao do suporte:", erro?.code || erro);
    }
    return { ok: false };
  }

  /**
   * SUPORTE encerra a sessao ativa (desativa o codigo). Os chamados ja
   * vinculados continuam visiveis; apenas impede novas entradas.
   * @returns {Promise<{ok: boolean}>}
   */
  async function encerrarSessaoSuporte() {
    const uid = auth.usuario?.uid;
    if (!uid || !store.codigo) return { ok: false };

    try {
      await encerrarSessao(store.codigo);
      store.limpar(uid);
      notificacao.sucesso("Sessao encerrada.");
      return { ok: true };
    } catch (erro) {
      console.error("Erro ao encerrar sessao:", erro?.code || erro);
      notificacao.erro("Nao foi possivel encerrar a sessao.");
      return { ok: false };
    }
  }

  /** Remove o vinculo do solicitante (sair da sessao atual). */
  function sairDaSessao() {
    const uid = auth.usuario?.uid;
    store.limpar(uid);
  }

  return {
    // estado reativo
    codigo,
    suporteId,
    suporteNome,
    ativa,
    // acoes
    entrarComCodigo,
    gerarCodigoSuporte,
    carregarSessaoSuporte,
    encerrarSessaoSuporte,
    sairDaSessao,
  };
}
