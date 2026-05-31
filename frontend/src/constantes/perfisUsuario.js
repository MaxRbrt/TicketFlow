// ============================================================================
// TicketFlow - Constantes de PERFIL (role) do usuario
// ----------------------------------------------------------------------------
// As CHAVES sao os valores gravados no Firestore (campo `role` em `users`) e
// tambem refletidos nas custom claims do Auth. Definem o controle de acesso
// por perfil em todo o app (rotas, menus, permissoes).
// ============================================================================

// Valores crus do papel, do jeito que ficam salvos no banco.
export const PERFIL = {
  SOLICITANTE: "requester",
  SUPORTE: "support",
};

// Metadados de cada perfil: rotulo e rota inicial apos o login.
export const PERFIL_INFO = {
  [PERFIL.SOLICITANTE]: {
    valor: PERFIL.SOLICITANTE,
    rotulo: "Solicitante",
    rotaInicial: "/solicitante/painel",
  },
  [PERFIL.SUPORTE]: {
    valor: PERFIL.SUPORTE,
    rotulo: "Suporte",
    rotaInicial: "/suporte/painel",
  },
};

// Lista pronta para o select de tipo de conta no cadastro.
export const LISTA_PERFIS = Object.values(PERFIL_INFO);

/**
 * Retorna os metadados de um perfil, com fallback para solicitante.
 * @param {string} valor - Valor cru do perfil (ex.: "support").
 */
export function obterInfoPerfil(valor) {
  return PERFIL_INFO[valor] || PERFIL_INFO[PERFIL.SOLICITANTE];
}

/**
 * Indica se o perfil informado e de suporte.
 * @param {string} valor - Valor cru do perfil.
 */
export function ehSuporte(valor) {
  return valor === PERFIL.SUPORTE;
}

/**
 * Retorna a rota inicial (pos-login) correspondente ao perfil.
 * @param {string} valor - Valor cru do perfil.
 */
export function rotaInicialDoPerfil(valor) {
  return obterInfoPerfil(valor).rotaInicial;
}
