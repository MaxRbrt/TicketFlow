// ============================================================================
// TicketFlow - Constantes de CATEGORIA do chamado
// ----------------------------------------------------------------------------
// Categorias fixas (decisao da especificacao, para reduzir complexidade). As
// CHAVES sao os valores gravados no Firestore (campo `category`).
// ============================================================================

// Valores crus da categoria, do jeito que ficam salvos no banco.
export const CATEGORIA = {
  HARDWARE: "hardware",
  SOFTWARE: "software",
  REDE: "network",
  IMPRESSORA: "printer",
  ACESSO: "access",
  MANUTENCAO: "maintenance",
  INSTALACAO: "installation",
  ADMINISTRATIVO: "administrative",
  OUTROS: "other",
};

// Metadados de cada categoria: rotulo em portugues e ordem de exibicao.
export const CATEGORIA_INFO = {
  [CATEGORIA.HARDWARE]: { valor: CATEGORIA.HARDWARE, rotulo: "Hardware", ordem: 1 },
  [CATEGORIA.SOFTWARE]: { valor: CATEGORIA.SOFTWARE, rotulo: "Software", ordem: 2 },
  [CATEGORIA.REDE]: { valor: CATEGORIA.REDE, rotulo: "Internet/Rede", ordem: 3 },
  [CATEGORIA.IMPRESSORA]: { valor: CATEGORIA.IMPRESSORA, rotulo: "Impressora", ordem: 4 },
  [CATEGORIA.ACESSO]: { valor: CATEGORIA.ACESSO, rotulo: "Acesso a sistemas", ordem: 5 },
  [CATEGORIA.MANUTENCAO]: { valor: CATEGORIA.MANUTENCAO, rotulo: "Manutencao", ordem: 6 },
  [CATEGORIA.INSTALACAO]: { valor: CATEGORIA.INSTALACAO, rotulo: "Instalacao", ordem: 7 },
  [CATEGORIA.ADMINISTRATIVO]: {
    valor: CATEGORIA.ADMINISTRATIVO,
    rotulo: "Solicitacao administrativa",
    ordem: 8,
  },
  [CATEGORIA.OUTROS]: { valor: CATEGORIA.OUTROS, rotulo: "Outros", ordem: 9 },
};

// Lista pronta para selects e filtros, na ordem definida.
export const LISTA_CATEGORIAS = Object.values(CATEGORIA_INFO).sort(
  (a, b) => a.ordem - b.ordem
);

/**
 * Retorna os metadados de uma categoria, com fallback neutro.
 * @param {string} valor - Valor cru da categoria (ex.: "hardware").
 */
export function obterInfoCategoria(valor) {
  return (
    CATEGORIA_INFO[valor] || { valor, rotulo: "Outros", ordem: 99 }
  );
}

/**
 * Retorna o rotulo em portugues de uma categoria.
 * @param {string} valor - Valor cru da categoria.
 */
export function rotuloCategoria(valor) {
  return obterInfoCategoria(valor).rotulo;
}
