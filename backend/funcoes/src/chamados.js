// ============================================================================
// TicketFlow - Cloud Functions de chamados
// ----------------------------------------------------------------------------
// Funcoes que reagem a mudancas na colecao `tickets`. Elas mantem uma trilha
// de auditoria (subcolecao `historico`) registrando a criacao do chamado e
// cada mudanca de status. A escrita do historico e feita pelo backend, com
// privilegios de admin, por isso as regras do Firestore bloqueiam escrita do
// cliente nessa subcolecao.
// ============================================================================

const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o Admin SDK uma unica vez (evita erro de app duplicado).
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * registrarHistorico
 * -----------------------------------------------------------------------------
 * Grava uma entrada na subcolecao `tickets/{ticketId}/historico`.
 * Centraliza a escrita para reaproveitar entre os gatilhos.
 *
 * @param {string} ticketId     - ID do chamado.
 * @param {object} entrada      - Campos do evento (acao, status, autor, etc).
 */
async function registrarHistorico(ticketId, entrada) {
  await db
    .collection("tickets")
    .doc(ticketId)
    .collection("historico")
    .add({
      ...entrada,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * aoCriarChamado
 * -----------------------------------------------------------------------------
 * Dispara quando um novo chamado e criado. Registra o evento inicial de
 * abertura no historico do chamado.
 */
const aoCriarChamado = onDocumentCreated("tickets/{ticketId}", async (event) => {
  const ticketId = event.params.ticketId;
  const dados = event.data?.data();

  if (!dados) {
    return;
  }

  try {
    await registrarHistorico(ticketId, {
      acao: "criado",
      statusAnterior: null,
      statusNovo: dados.status ?? "open",
      autorId: dados.requesterId ?? null,
      autorNome: dados.requesterName ?? null,
    });
    logger.info(`Historico de criacao registrado para o chamado ${ticketId}.`);
  } catch (erro) {
    logger.error(`Falha ao registrar criacao do chamado ${ticketId}:`, erro);
  }
});

/**
 * aoMudarStatusChamado
 * -----------------------------------------------------------------------------
 * Dispara em qualquer atualizacao de um chamado. So registra no historico
 * quando o campo `status` realmente muda, evitando entradas redundantes.
 * Escreve apenas na subcolecao `historico`, nunca no proprio documento, o que
 * impede loops de gatilho.
 */
const aoMudarStatusChamado = onDocumentUpdated("tickets/{ticketId}", async (event) => {
  const ticketId = event.params.ticketId;
  const antes = event.data?.before?.data();
  const depois = event.data?.after?.data();

  if (!antes || !depois) {
    return;
  }

  // Sem mudanca de status: nada a registrar.
  if (antes.status === depois.status) {
    return;
  }

  // O autor da mudanca de status normalmente e o suporte que assumiu o chamado;
  // se nao houver responsavel, atribui ao proprio solicitante.
  const autorId = depois.assignedToId ?? depois.requesterId ?? null;
  const autorNome = depois.assignedToName ?? depois.requesterName ?? null;

  try {
    await registrarHistorico(ticketId, {
      acao: "status_alterado",
      statusAnterior: antes.status ?? null,
      statusNovo: depois.status ?? null,
      autorId,
      autorNome,
    });
    logger.info(
      `Status do chamado ${ticketId} mudou de '${antes.status}' para '${depois.status}'.`
    );
  } catch (erro) {
    logger.error(`Falha ao registrar mudanca de status do chamado ${ticketId}:`, erro);
  }
});

module.exports = { aoCriarChamado, aoMudarStatusChamado };
