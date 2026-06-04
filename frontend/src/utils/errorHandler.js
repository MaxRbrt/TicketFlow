// ============================================================================
// TicketFlow - Tratamento centralizado de erros do Firebase (RNF010)
// ----------------------------------------------------------------------------
// Mapeia codigos de erro do Firebase (Authentication e Firestore) para mensagens
// amigaveis em portugues e expoe `traduzirErro` para uso nos composables/telas.
// Antes essa logica vivia dentro de `useAutenticacao`; foi extraida para ca para
// ser reutilizada por qualquer fluxo (login, cadastro, recuperacao de senha,
// autoexclusao, operacoes de chamado).
// ============================================================================

// Mapa de codigos de erro do Firebase -> mensagem amigavel em portugues.
export const MENSAGENS_ERRO = {
  // --- Authentication: login / cadastro ---
  "auth/invalid-email": "E-mail invalido.",
  "auth/user-disabled": "Esta conta esta desativada.",
  "auth/user-not-found": "Nao foi possivel fazer login. Verifique seus dados.",
  "auth/wrong-password": "Nao foi possivel fazer login. Verifique seus dados.",
  "auth/invalid-credential": "Nao foi possivel fazer login. Verifique seus dados.",
  "auth/email-already-in-use": "Este e-mail ja esta cadastrado.",
  "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
  "auth/operation-not-allowed": "Cadastro por e-mail e senha nao esta ativado no Firebase Authentication.",
  "auth/admin-restricted-operation": "Cadastro bloqueado pela configuracao do Firebase Authentication.",
  "auth/invalid-api-key": "A chave da aplicacao Firebase esta invalida.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/network-request-failed": "Falha de conexao. Verifique sua internet.",
  "auth/requires-recent-login": "Sua sessao expirou. Faca login novamente para excluir a conta.",
  "auth/missing-password": "Informe sua senha para confirmar.",
  // --- Authentication: recuperacao de senha ---
  "auth/missing-email": "Informe um e-mail para recuperar a senha.",
  // --- Firestore ---
  "permission-denied": "A conta foi autenticada, mas o Firestore bloqueou a operacao.",
  "unavailable": "Firebase indisponivel no momento. Tente novamente em instantes.",
};

/**
 * Traduz um erro do Firebase para mensagem amigavel em portugues. Loga o codigo
 * original no console para depuracao e cai em mensagem generica (com o codigo
 * entre parenteses) quando o erro nao esta mapeado.
 * @param {*} erro - Erro lancado pelo Firebase (geralmente tem `code`).
 * @returns {string} Mensagem amigavel em portugues.
 */
export function traduzirErro(erro) {
  console.error("Erro Firebase:", erro?.code || erro?.message || erro);
  return (
    MENSAGENS_ERRO[erro?.code] ||
    `Ocorreu um erro inesperado${erro?.code ? ` (${erro.code})` : ""}. Tente novamente.`
  );
}
