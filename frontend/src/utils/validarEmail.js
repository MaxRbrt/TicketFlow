// ============================================================================
// TicketFlow - Utilitarios de validacao de formularios
// ----------------------------------------------------------------------------
// Validacoes simples e puras usadas nos formularios de login e cadastro. Nao
// substituem as validacoes do Firebase, apenas dao feedback rapido ao usuario
// antes de enviar.
// ============================================================================

// Tamanho minimo de senha exigido pelo Firebase Authentication.
export const TAMANHO_MINIMO_SENHA = 6;

// Regex simples para formato de e-mail (suficiente para feedback de interface).
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida o formato de um e-mail.
 * @param {string} email - E-mail digitado.
 * @returns {boolean} true se o formato for valido.
 */
export function emailValido(email) {
  if (typeof email !== "string") {
    return false;
  }
  return REGEX_EMAIL.test(email.trim());
}

/**
 * Valida se a senha atende ao tamanho minimo.
 * @param {string} senha - Senha digitada.
 * @returns {boolean} true se a senha tiver o tamanho minimo.
 */
export function senhaValida(senha) {
  return typeof senha === "string" && senha.length >= TAMANHO_MINIMO_SENHA;
}

/**
 * Valida se um texto obrigatorio foi preenchido (ignora espacos).
 * @param {string} texto - Valor do campo.
 * @returns {boolean} true se houver conteudo.
 */
export function campoPreenchido(texto) {
  return typeof texto === "string" && texto.trim().length > 0;
}

/**
 * Valida se duas senhas (senha e confirmacao) sao iguais.
 * @param {string} senha - Senha original.
 * @param {string} confirmacao - Confirmacao da senha.
 * @returns {boolean} true se forem identicas.
 */
export function senhasIguais(senha, confirmacao) {
  return senha === confirmacao;
}
