// ============================================================================
// TicketFlow - useNotificacao
// ----------------------------------------------------------------------------
// Sistema global de notificacoes (toasts). Estado em nivel de modulo: uma unica
// fila compartilhada por todo o app. Um componente de notificacoes renderiza a
// lista; qualquer parte do codigo dispara mensagens via sucesso/erro/info.
//
// Cobre o requisito de feedback visual (RNF006): sucesso, erro, etc.
// ============================================================================

import { reactive, readonly } from "vue";

// Fila unica de notificacoes ativas (compartilhada entre todos os usos).
const estado = reactive({ lista: [] });

// Evita empilhar a mesma mensagem varias vezes quando duas escutas/eventos
// disparam quase ao mesmo tempo.
const JANELA_DUPLICADA_MS = 6000;
const LIMITE_NOTIFICACOES = 4;
const recentes = new Map();

// Gera IDs incrementais para identificar/remover cada notificacao.
let proximoId = 1;

/**
 * Remove uma notificacao da fila pelo ID.
 * @param {number} id - ID da notificacao.
 */
function remover(id) {
  const indice = estado.lista.findIndex((n) => n.id === id);
  if (indice !== -1) {
    estado.lista.splice(indice, 1);
  }

  for (const [chave, item] of recentes) {
    if (item.id === id) recentes.delete(chave);
  }
}

/**
 * Adiciona uma notificacao a fila. Some sozinha apos `duracao` ms.
 * @param {"sucesso"|"erro"|"info"} tipo - Tipo visual.
 * @param {string} mensagem - Texto exibido.
 * @param {number} [duracao=4000] - Tempo ate sumir (0 = nao some sozinha).
 * @returns {number} ID da notificacao criada.
 */
function adicionar(tipo, mensagem, duracao = 4000) {
  const agora = Date.now();
  const chave = `${tipo}:${mensagem}`;
  const recente = recentes.get(chave);

  if (recente && agora - recente.criadoEm < JANELA_DUPLICADA_MS) {
    return recente.id;
  }

  const id = proximoId++;
  estado.lista.push({ id, tipo, mensagem });
  recentes.set(chave, { id, criadoEm: agora });

  if (estado.lista.length > LIMITE_NOTIFICACOES) {
    const excedentes = estado.lista.splice(0, estado.lista.length - LIMITE_NOTIFICACOES);
    for (const item of excedentes) remover(item.id);
  }

  if (duracao > 0) {
    setTimeout(() => remover(id), duracao);
  }
  return id;
}

/**
 * Acesso ao sistema de notificacoes.
 * @returns API com a lista (somente leitura) e os disparadores.
 */
export function useNotificacao() {
  return {
    // Lista somente-leitura para o componente que renderiza os toasts.
    notificacoes: readonly(estado).lista,
    sucesso: (mensagem, duracao) => adicionar("sucesso", mensagem, duracao),
    erro: (mensagem, duracao) => adicionar("erro", mensagem, duracao),
    info: (mensagem, duracao) => adicionar("info", mensagem, duracao),
    remover,
  };
}
