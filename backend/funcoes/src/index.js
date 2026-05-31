// ============================================================================
// TicketFlow - Ponto de entrada das Cloud Functions
// ----------------------------------------------------------------------------
// Inicializa o Firebase Admin SDK uma unica vez e reexporta todas as funcoes
// dos modulos. O Firebase descobre as funcoes a partir do que e exportado
// aqui (campo `main` do package.json aponta para este arquivo).
//
// Observacao: o deploy das Functions exige o plano Blaze do Firebase. As
// funcoes sao um complemento (historico e claims); o app funciona mesmo sem
// elas, pois a seguranca essencial esta nas regras do Firestore.
// ============================================================================

const admin = require("firebase-admin");

// Inicializacao central do Admin SDK. Os modulos tambem checam `apps.length`,
// garantindo uma unica inicializacao independente da ordem de carregamento.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const usuarios = require("./usuarios");
const chamados = require("./chamados");

// Reexporta cada funcao individualmente para o runtime do Firebase.
module.exports = {
  ...usuarios,
  ...chamados,
};
