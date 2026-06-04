// ============================================================================
// TicketFlow - useChamados
// ----------------------------------------------------------------------------
// Camada de conveniencia entre as telas e a store de chamados. Concentra:
//   - regras de negocio do atendimento (ex.: so finaliza com resposta E solucao);
//   - notificacoes de sucesso/erro (RNF006);
//   - retorno padronizado { ok, ... } para as telas.
// O estado reativo (lista, indicadores) vem direto da store.
// ============================================================================

import { storeToRefs } from "pinia";
import { useStoreChamado } from "../stores/storeChamado.js";
import { useNotificacao } from "./useNotificacao.js";
import { useAutenticacao } from "./useAutenticacao.js";
import { registrarEvento } from "../servicos/servicoChamado.js";
import { STATUS } from "../constantes/statusChamado.js";

export function useChamados() {
  const store = useStoreChamado();
  const notificacao = useNotificacao();
  const { usuario, nome } = useAutenticacao();

  // ----- Historico (trilha de auditoria, gravada pelo cliente no Spark) -----

  /** Autor do evento = usuario logado. */
  function autorEvento() {
    return { autorId: usuario.value?.uid || null, autorNome: nome.value || null };
  }

  /** Status atual do chamado em foco (para registrar a transicao), se for o mesmo. */
  function statusAnteriorDe(id) {
    const atual = store.chamadoAtual;
    return atual && atual.id === id ? atual.status : null;
  }

  /** Grava um evento no historico sem quebrar a acao em caso de falha. */
  async function logEvento(id, entrada) {
    try {
      await registrarEvento(id, entrada);
    } catch (e) {
      console.error("Falha ao registrar evento no historico:", e?.code || e);
    }
  }

  // Estado e indicadores reativos da store.
  const {
    chamados,
    chamadoAtual,
    carregando,
    erro,
    total,
    abertos,
    emAndamento,
    aguardando,
    resolvidos,
    cancelados,
    urgentes,
  } = storeToRefs(store);

  // ----- Leitura (delegacao direta das escutas em tempo real) --------------
  const escutarDoSolicitante = store.escutarDoSolicitante;
  const escutarTodos = store.escutarTodos;
  const escutarChamado = store.escutarChamado;
  const pararEscutaLista = store.pararEscutaLista;
  const pararEscutaItem = store.pararEscutaItem;
  const limpar = store.limpar;

  /**
   * Executa uma operacao da store com tratamento de erro + notificacao.
   * @param {() => Promise<*>} operacao - Funcao assincrona a executar.
   * @param {string} mensagemSucesso - Texto exibido em caso de sucesso.
   * @param {string} mensagemErro - Texto exibido em caso de falha.
   */
  async function executar(operacao, mensagemSucesso, mensagemErro) {
    try {
      const resultado = await operacao();
      if (mensagemSucesso) {
        notificacao.sucesso(mensagemSucesso);
      }
      return { ok: true, resultado };
    } catch (e) {
      notificacao.erro(mensagemErro || "Ocorreu um erro. Tente novamente.");
      return { ok: false, erro: e };
    }
  }

  // ----- Acoes do solicitante ----------------------------------------------

  /** Cria um novo chamado. */
  function criar(dados) {
    return executar(
      () => store.criar(dados),
      "Chamado aberto com sucesso.",
      "Nao foi possivel salvar o chamado."
    );
  }

  /** Edita um chamado (apenas enquanto aberto, garantido pelas regras). */
  function atualizar(id, dados) {
    return executar(
      () => store.atualizar(id, dados),
      "Chamado atualizado com sucesso.",
      "Nao foi possivel salvar o chamado."
    );
  }

  /** Exclui um chamado. */
  function excluir(id) {
    return executar(
      () => store.excluir(id),
      "Chamado excluido com sucesso.",
      "Nao foi possivel excluir o chamado."
    );
  }

  /** Cancela um chamado (solicitante desiste enquanto aberto). */
  function cancelar(id) {
    const anterior = statusAnteriorDe(id);
    return executar(
      async () => {
        await store.mudarStatus(id, STATUS.CANCELADO);
        await logEvento(id, {
          acao: "status_alterado",
          statusAnterior: anterior,
          statusNovo: STATUS.CANCELADO,
          ...autorEvento(),
        });
      },
      "Chamado cancelado.",
      "Nao foi possivel cancelar o chamado."
    );
  }

  // ----- Acoes do suporte --------------------------------------------------

  /** Suporte assume o chamado (vira responsavel e move para em andamento). */
  function assumir(id, suporte) {
    const anterior = statusAnteriorDe(id);
    return executar(
      async () => {
        await store.assumir(id, suporte);
        await logEvento(id, {
          acao: "assumido",
          statusAnterior: anterior,
          statusNovo: STATUS.EM_ANDAMENTO,
          autorId: suporte.uid,
          autorNome: suporte.nome,
        });
      },
      "Chamado assumido.",
      "Nao foi possivel assumir o chamado."
    );
  }

  /** Altera o status do chamado. */
  function mudarStatus(id, status) {
    const anterior = statusAnteriorDe(id);
    return executar(
      async () => {
        await store.mudarStatus(id, status);
        await logEvento(id, {
          acao: "status_alterado",
          statusAnterior: anterior,
          statusNovo: status,
          ...autorEvento(),
        });
      },
      "Status atualizado com sucesso.",
      "Nao foi possivel atualizar o status."
    );
  }

  /** Registra resposta ao solicitante (nao pode ser vazia - regra 25.4). */
  function responder(id, resposta) {
    if (!resposta || !resposta.trim()) {
      notificacao.erro("A resposta nao pode estar vazia.");
      return Promise.resolve({ ok: false });
    }
    return executar(
      () => store.responder(id, resposta.trim()),
      "Resposta enviada.",
      "Nao foi possivel enviar a resposta."
    );
  }

  /** Registra a solucao aplicada, sem finalizar (RF018). Nao pode ser vazia. */
  function registrarSolucao(id, solucao) {
    if (!solucao || !solucao.trim()) {
      notificacao.erro("A solucao nao pode estar vazia.");
      return Promise.resolve({ ok: false });
    }
    return executar(
      () => store.registrarSolucaoChamado(id, solucao.trim()),
      "Solucao registrada.",
      "Nao foi possivel registrar a solucao."
    );
  }

  /**
   * Finaliza o atendimento (status Resolvido). Regra de negocio (RF019/25.4):
   * exige que o suporte ja tenha respondido ao solicitante (pelo menos uma
   * mensagem no chat) E que a solucao aplicada esteja registrada.
   * @param {string} id - ID do chamado.
   * @param {object} dados - { solucao, respondeuSuporte }.
   */
  async function finalizar(id, { solucao, respondeuSuporte }) {
    if (!respondeuSuporte) {
      notificacao.erro("Responda ao solicitante no chat antes de finalizar.");
      return { ok: false };
    }
    if (!solucao || !solucao.trim()) {
      notificacao.erro("Informe a solucao aplicada antes de finalizar.");
      return { ok: false };
    }

    const anterior = statusAnteriorDe(id);
    return executar(
      async () => {
        await store.registrarSolucaoChamado(id, solucao.trim());
        await store.mudarStatus(id, STATUS.RESOLVIDO);
        await logEvento(id, {
          acao: "status_alterado",
          statusAnterior: anterior,
          statusNovo: STATUS.RESOLVIDO,
          ...autorEvento(),
        });
      },
      "Atendimento finalizado com sucesso.",
      "Nao foi possivel finalizar o atendimento."
    );
  }

  return {
    // estado / indicadores
    chamados,
    chamadoAtual,
    carregando,
    erro,
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
    // acoes solicitante
    criar,
    atualizar,
    excluir,
    cancelar,
    // acoes suporte
    assumir,
    mudarStatus,
    responder,
    registrarSolucao,
    finalizar,
  };
}
