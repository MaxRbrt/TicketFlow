// ============================================================================
// TicketFlow - Constantes de STATUS do chamado
// ----------------------------------------------------------------------------
// Centraliza os status possiveis de um chamado. As CHAVES sao exatamente os
// valores gravados no Firestore (campo `status`). Nunca espalhar essas strings
// pelo codigo: sempre importar daqui. Assim, mudar um rotulo ou cor e feito em
// um unico lugar.
// ============================================================================

// Valores crus do status, do jeito que ficam salvos no banco.
export const STATUS = {
  ABERTO: "open",
  EM_ANDAMENTO: "in_progress",
  AGUARDANDO_SOLICITANTE: "waiting_requester",
  RESOLVIDO: "resolved",
  CANCELADO: "cancelled",
};

// Metadados de cada status: rotulo em portugues, cor (token CSS definido em
// variaveis.css) e ordem de exibicao em listas/filtros.
export const STATUS_INFO = {
  [STATUS.ABERTO]: {
    valor: STATUS.ABERTO,
    rotulo: "Aberto",
    cor: "var(--cor-status-aberto)",
    ordem: 1,
  },
  [STATUS.EM_ANDAMENTO]: {
    valor: STATUS.EM_ANDAMENTO,
    rotulo: "Em andamento",
    cor: "var(--cor-status-andamento)",
    ordem: 2,
  },
  [STATUS.AGUARDANDO_SOLICITANTE]: {
    valor: STATUS.AGUARDANDO_SOLICITANTE,
    rotulo: "Aguardando solicitante",
    cor: "var(--cor-status-aguardando)",
    ordem: 3,
  },
  [STATUS.RESOLVIDO]: {
    valor: STATUS.RESOLVIDO,
    rotulo: "Resolvido",
    cor: "var(--cor-status-resolvido)",
    ordem: 4,
  },
  [STATUS.CANCELADO]: {
    valor: STATUS.CANCELADO,
    rotulo: "Cancelado",
    cor: "var(--cor-status-cancelado)",
    ordem: 5,
  },
};

// Lista pronta para preencher selects e filtros, ja na ordem correta.
export const LISTA_STATUS = Object.values(STATUS_INFO).sort(
  (a, b) => a.ordem - b.ordem
);

/**
 * Retorna os metadados de um status. Se o valor for desconhecido, devolve um
 * objeto neutro para evitar quebra de tela.
 * @param {string} valor - Valor cru do status (ex.: "open").
 */
export function obterInfoStatus(valor) {
  return (
    STATUS_INFO[valor] || {
      valor,
      rotulo: "Desconhecido",
      cor: "var(--cor-texto-secundario)",
      ordem: 99,
    }
  );
}

/**
 * Retorna apenas o rotulo em portugues de um status.
 * @param {string} valor - Valor cru do status.
 */
export function rotuloStatus(valor) {
  return obterInfoStatus(valor).rotulo;
}
