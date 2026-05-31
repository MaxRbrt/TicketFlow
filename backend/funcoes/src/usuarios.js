// ============================================================================
// TicketFlow - Cloud Functions de usuarios
// ----------------------------------------------------------------------------
// Funcoes que reagem a mudancas na colecao `users`. O objetivo principal e
// espelhar o papel (role) do usuario nas "custom claims" do Firebase
// Authentication. Assim o perfil fica disponivel direto no token de acesso,
// permitindo checagens mais rapidas no app e em integracoes futuras.
// ============================================================================

const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o Admin SDK uma unica vez (evita erro de app duplicado).
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * sincronizarPapelUsuario
 * -----------------------------------------------------------------------------
 * Dispara sempre que um documento em `users/{uid}` e criado, atualizado ou
 * removido. Mantem a custom claim `role` igual ao campo `role` do Firestore.
 *
 * - Documento removido: limpa as claims do usuario.
 * - Documento sem mudanca de `role`: nada a fazer (evita escrita desnecessaria).
 * - Caso contrario: grava a claim `role` com o valor atual.
 */
const sincronizarPapelUsuario = onDocumentWritten("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const dadosAntes = event.data?.before?.data();
  const dadosDepois = event.data?.after?.data();

  try {
    // Documento foi excluido: remove as claims personalizadas.
    if (!dadosDepois) {
      await admin.auth().setCustomUserClaims(uid, null);
      logger.info(`Claims removidas para o usuario ${uid}.`);
      return;
    }

    const papelNovo = dadosDepois.role ?? null;
    const papelAntigo = dadosAntes?.role ?? null;

    // Sem alteracao de papel: nao reescreve as claims.
    if (papelNovo === papelAntigo) {
      return;
    }

    await admin.auth().setCustomUserClaims(uid, { role: papelNovo });
    logger.info(`Papel '${papelNovo}' aplicado nas claims do usuario ${uid}.`);
  } catch (erro) {
    logger.error(`Falha ao sincronizar papel do usuario ${uid}:`, erro);
  }
});

module.exports = { sincronizarPapelUsuario };
