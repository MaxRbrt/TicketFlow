// ============================================================================
// TicketFlow - Constantes de PRIORIDADE do chamado
// ----------------------------------------------------------------------------
// As CHAVES sao os valores gravados no Firestore (campo `priority`). O campo
// `peso` serve para ordenar chamados por urgencia (maior = mais urgente).
// ============================================================================

// Valores crus da prioridade, do jeito que ficam salvos no banco.
export const PRIORIDADE = {
  BAIXA: "low",
  MEDIA: "medium",
  ALTA: "high",
  URGENTE: "urgent",
};

// Metadados de cada prioridade: rotulo, cor (token CSS) e peso para ordenacao.
export const PRIORIDADE_INFO = {
  [PRIORIDADE.BAIXA]: {
    valor: PRIORIDADE.BAIXA,
    rotulo: "Baixa",
    cor: "var(--cor-prioridade-baixa)",
    peso: 1,
  },
  [PRIORIDADE.MEDIA]: {
    valor: PRIORIDADE.MEDIA,
    rotulo: "Media",
    cor: "var(--cor-prioridade-media)",
    peso: 2,
  },
  [PRIORIDADE.ALTA]: {
    valor: PRIORIDADE.ALTA,
    rotulo: "Alta",
    cor: "var(--cor-prioridade-alta)",
    peso: 3,
  },
  [PRIORIDADE.URGENTE]: {
    valor: PRIORIDADE.URGENTE,
    rotulo: "Urgente",
    cor: "var(--cor-prioridade-urgente)",
    peso: 4,
  },
};

// Lista pronta para selects e filtros, da menos para a mais urgente.
export const LISTA_PRIORIDADES = Object.values(PRIORIDADE_INFO).sort(
  (a, b) => a.peso - b.peso
);

/**
 * Retorna os metadados de uma prioridade, com fallback neutro.
 * @param {string} valor - Valor cru da prioridade (ex.: "high").
 */
export function obterInfoPrioridade(valor) {
  return (
    PRIORIDADE_INFO[valor] || {
      valor,
      rotulo: "Desconhecida",
      cor: "var(--cor-texto-secundario)",
      peso: 0,
    }
  );
}

/**
 * Retorna o peso de uma prioridade (usado para ordenar por urgencia).
 * @param {string} valor - Valor cru da prioridade.
 */
export function pesoPrioridade(valor) {
  return obterInfoPrioridade(valor).peso;
}
