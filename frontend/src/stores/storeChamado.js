// ============================================================================
// TicketFlow - Store de chamados (Pinia)
// ----------------------------------------------------------------------------
// Mantem a lista de chamados, o chamado selecionado e indicadores prontos para
// os dashboards. Suporta escuta em tempo real (onSnapshot via servico) e expoe
// as operacoes de CRUD. Toda a comunicacao com o Firestore passa pelo servico.
// ============================================================================

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  observarChamadosDoSolicitante,
  observarTodosChamados,
  observarChamado,
  criarChamado,
  atualizarChamado,
  assumirChamado,
  atualizarStatusChamado,
  responderChamado,
  registrarSolucao,
  excluirChamado,
} from "../servicos/servicoChamado.js";
import { STATUS } from "../constantes/statusChamado.js";
import { PRIORIDADE } from "../constantes/prioridadesChamado.js";

export const useStoreChamado = defineStore("chamado", () => {
  // ----- Estado ------------------------------------------------------------
  const chamados = ref([]); // lista atual (do solicitante OU todos)
  const chamadoAtual = ref(null); // chamado selecionado (detalhes)
  const carregando = ref(false);
  const erro = ref(null);

  // Funcoes para cancelar as escutas em tempo real (mantidas fora do estado
  // reativo de propósito; sao apenas referencias internas).
  let cancelarLista = null;
  let cancelarItem = null;

  // ----- Getters: indicadores para os dashboards ---------------------------
  const total = computed(() => chamados.value.length);

  // Conta quantos chamados estao em um determinado status.
  function contarPorStatus(status) {
    return chamados.value.filter((c) => c.status === status).length;
  }

  const abertos = computed(() => contarPorStatus(STATUS.ABERTO));
  const emAndamento = computed(() => contarPorStatus(STATUS.EM_ANDAMENTO));
  const aguardando = computed(() => contarPorStatus(STATUS.AGUARDANDO_SOLICITANTE));
  const resolvidos = computed(() => contarPorStatus(STATUS.RESOLVIDO));
  const cancelados = computed(() => contarPorStatus(STATUS.CANCELADO));

  // Urgentes ainda nao finalizados (destaque do painel de suporte, RN008).
  const urgentes = computed(
    () =>
      chamados.value.filter(
        (c) =>
          c.priority === PRIORIDADE.URGENTE &&
          c.status !== STATUS.RESOLVIDO &&
          c.status !== STATUS.CANCELADO
      ).length
  );

  // ----- Escuta em tempo real ----------------------------------------------

  /** Cancela a escuta da lista, se houver. */
  function pararEscutaLista() {
    if (cancelarLista) {
      cancelarLista();
      cancelarLista = null;
    }
  }

  /** Cancela a escuta do chamado selecionado, se houver. */
  function pararEscutaItem() {
    if (cancelarItem) {
      cancelarItem();
      cancelarItem = null;
    }
  }

  /**
   * Escuta em tempo real os chamados do solicitante.
   * @param {string} requesterId - UID do solicitante.
   */
  function escutarDoSolicitante(requesterId) {
    pararEscutaLista();
    carregando.value = true;
    erro.value = null;
    cancelarLista = observarChamadosDoSolicitante(
      requesterId,
      (lista) => {
        chamados.value = lista;
        carregando.value = false;
      },
      (e) => {
        erro.value = e;
        carregando.value = false;
      }
    );
  }

  /** Escuta em tempo real todos os chamados (painel de suporte). */
  function escutarTodos() {
    pararEscutaLista();
    carregando.value = true;
    erro.value = null;
    cancelarLista = observarTodosChamados(
      (lista) => {
        chamados.value = lista;
        carregando.value = false;
      },
      (e) => {
        erro.value = e;
        carregando.value = false;
      }
    );
  }

  /**
   * Escuta em tempo real um chamado especifico (tela de detalhes).
   * @param {string} id - ID do chamado.
   */
  function escutarChamado(id) {
    pararEscutaItem();
    cancelarItem = observarChamado(
      id,
      (c) => {
        chamadoAtual.value = c;
      },
      (e) => {
        erro.value = e;
      }
    );
  }

  /** Limpa todas as escutas e o estado da lista (ex.: ao deslogar). */
  function limpar() {
    pararEscutaLista();
    pararEscutaItem();
    chamados.value = [];
    chamadoAtual.value = null;
    erro.value = null;
  }

  // ----- CRUD (delegado ao servico) ----------------------------------------
  // Retornam Promises; o tratamento de erro/notificacao fica no composable
  // useChamados ou na propria tela.

  function criar(dados) {
    return criarChamado(dados);
  }

  function atualizar(id, dados) {
    return atualizarChamado(id, dados);
  }

  function assumir(id, suporte) {
    return assumirChamado(id, suporte);
  }

  function mudarStatus(id, status) {
    return atualizarStatusChamado(id, status);
  }

  function responder(id, resposta) {
    return responderChamado(id, resposta);
  }

  function registrarSolucaoChamado(id, solucao) {
    return registrarSolucao(id, solucao);
  }

  function excluir(id) {
    return excluirChamado(id);
  }

  return {
    // estado
    chamados,
    chamadoAtual,
    carregando,
    erro,
    // indicadores
    total,
    abertos,
    emAndamento,
    aguardando,
    resolvidos,
    cancelados,
    urgentes,
    // escutas
    escutarDoSolicitante,
    escutarTodos,
    escutarChamado,
    pararEscutaLista,
    pararEscutaItem,
    limpar,
    // crud
    criar,
    atualizar,
    assumir,
    mudarStatus,
    responder,
    registrarSolucaoChamado,
    excluir,
  };
});
