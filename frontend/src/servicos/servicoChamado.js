// ============================================================================
// TicketFlow - Servico de chamados (colecao `tickets` no Firestore)
// ----------------------------------------------------------------------------
// Centraliza todo o CRUD de chamados e as consultas por perfil. As regras de
// negocio (ex.: exigir resposta antes de resolver) ficam nas stores/composables;
// aqui ficam apenas as operacoes de banco.
//
// Cobre os requisitos de CRUD do professor:
//   - Create : criarChamado
//   - Read   : listar/observar/buscar
//   - Update : atualizar, assumir, atualizarStatus, responder, registrarSolucao
//   - Delete : excluirChamado
// ============================================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/configuracaoFirebase.js";
import { STATUS } from "../constantes/statusChamado.js";
import { PRIORIDADE } from "../constantes/prioridadesChamado.js";

// Nome da colecao em um unico lugar.
const COLECAO = "tickets";

// Referencia reutilizavel para a colecao de chamados.
const colecaoChamados = collection(db, COLECAO);

/**
 * Converte um snapshot de documento em objeto de chamado, ja com o id.
 * @param {import("firebase/firestore").DocumentSnapshot} snap
 */
function paraChamado(snap) {
  return { id: snap.id, ...snap.data() };
}

// ----------------------------------------------------------------------------
// CREATE
// ----------------------------------------------------------------------------

/**
 * Cria um novo chamado. Define status inicial `open` (RN002), datas e o campo
 * `id` igual ao ID do documento, para facilitar o uso no front-end.
 *
 * @param {object} dados - Dados do chamado:
 *   { title, description, category, priority, location,
 *     requesterId, requesterName, requesterEmail }.
 * @returns {Promise<string>} ID do chamado criado.
 */
export async function criarChamado(dados) {
  // Cria a referencia antes para ja conhecer o ID e gravar no proprio documento.
  const referencia = doc(colecaoChamados);

  const chamado = {
    id: referencia.id,
    title: dados.title,
    description: dados.description,
    category: dados.category,
    priority: dados.priority || PRIORIDADE.MEDIA,
    status: STATUS.ABERTO,
    location: dados.location || "",
    requesterId: dados.requesterId,
    requesterName: dados.requesterName,
    requesterEmail: dados.requesterEmail,
    assignedToId: null,
    assignedToName: null,
    supportResponse: null,
    resolution: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    resolvedAt: null,
    cancelledAt: null,
  };

  await setDoc(referencia, chamado);
  return referencia.id;
}

// ----------------------------------------------------------------------------
// READ (uma vez)
// ----------------------------------------------------------------------------

/**
 * Busca um chamado pelo ID.
 * @param {string} id - ID do chamado.
 * @returns {Promise<object|null>} Chamado (com id) ou null.
 */
export async function buscarChamado(id) {
  const snap = await getDoc(doc(db, COLECAO, id));
  return snap.exists() ? paraChamado(snap) : null;
}

/**
 * Lista os chamados de um solicitante (apenas os proprios), do mais recente
 * para o mais antigo.
 * @param {string} requesterId - UID do solicitante.
 * @returns {Promise<object[]>} Lista de chamados.
 */
export async function listarChamadosDoSolicitante(requesterId) {
  const consulta = query(
    colecaoChamados,
    where("requesterId", "==", requesterId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(consulta);
  return snap.docs.map(paraChamado);
}

/**
 * Lista todos os chamados (uso do suporte), do mais recente para o mais antigo.
 * @returns {Promise<object[]>} Lista de chamados.
 */
export async function listarTodosChamados() {
  const consulta = query(colecaoChamados, orderBy("createdAt", "desc"));
  const snap = await getDocs(consulta);
  return snap.docs.map(paraChamado);
}

// ----------------------------------------------------------------------------
// READ (tempo real) - para paineis que atualizam sozinhos
// ----------------------------------------------------------------------------

/**
 * Observa em tempo real os chamados de um solicitante.
 * @param {string} requesterId - UID do solicitante.
 * @param {(chamados: object[]) => void} aoAtualizar - Recebe a lista atualizada.
 * @param {(erro: Error) => void} [aoErro] - Callback de erro opcional.
 * @returns {import("firebase/firestore").Unsubscribe} Cancela a escuta.
 */
export function observarChamadosDoSolicitante(requesterId, aoAtualizar, aoErro) {
  const consulta = query(
    colecaoChamados,
    where("requesterId", "==", requesterId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    consulta,
    (snap) => aoAtualizar(snap.docs.map(paraChamado)),
    aoErro
  );
}

/**
 * Observa em tempo real todos os chamados (painel de suporte).
 * @param {(chamados: object[]) => void} aoAtualizar - Recebe a lista atualizada.
 * @param {(erro: Error) => void} [aoErro] - Callback de erro opcional.
 * @returns {import("firebase/firestore").Unsubscribe} Cancela a escuta.
 */
export function observarTodosChamados(aoAtualizar, aoErro) {
  const consulta = query(colecaoChamados, orderBy("createdAt", "desc"));
  return onSnapshot(
    consulta,
    (snap) => aoAtualizar(snap.docs.map(paraChamado)),
    aoErro
  );
}

/**
 * Observa em tempo real os chamados ABERTOS (status `open`). Usado pela central
 * de notificacoes do suporte para avisar de chamados novos que ainda esperam
 * atendimento. Consulta apenas por igualdade (sem orderBy), logo nao exige
 * indice composto; a ordenacao/filtragem por responsavel fica no front-end.
 * @param {(chamados: object[]) => void} aoAtualizar - Recebe a lista atualizada.
 * @param {(erro: Error) => void} [aoErro] - Callback de erro opcional.
 * @returns {import("firebase/firestore").Unsubscribe} Cancela a escuta.
 */
export function observarChamadosAbertos(aoAtualizar, aoErro) {
  const consulta = query(colecaoChamados, where("status", "==", STATUS.ABERTO));
  return onSnapshot(
    consulta,
    (snap) => aoAtualizar(snap.docs.map(paraChamado)),
    aoErro
  );
}

/**
 * Observa em tempo real um unico chamado (tela de detalhes/atendimento).
 * @param {string} id - ID do chamado.
 * @param {(chamado: object|null) => void} aoAtualizar - Recebe o chamado.
 * @param {(erro: Error) => void} [aoErro] - Callback de erro opcional.
 * @returns {import("firebase/firestore").Unsubscribe} Cancela a escuta.
 */
export function observarChamado(id, aoAtualizar, aoErro) {
  return onSnapshot(
    doc(db, COLECAO, id),
    (snap) => aoAtualizar(snap.exists() ? paraChamado(snap) : null),
    aoErro
  );
}

// ----------------------------------------------------------------------------
// UPDATE
// ----------------------------------------------------------------------------

/**
 * Atualiza campos editaveis de um chamado (ex.: solicitante editando um
 * chamado aberto). Sempre renova `updatedAt`.
 * @param {string} id - ID do chamado.
 * @param {object} dados - Campos a atualizar.
 */
export async function atualizarChamado(id, dados) {
  await updateDoc(doc(db, COLECAO, id), {
    ...dados,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Suporte assume um chamado: registra o responsavel e move para
 * "em andamento".
 * @param {string} id - ID do chamado.
 * @param {object} suporte - { uid, nome } do usuario de suporte.
 */
export async function assumirChamado(id, suporte) {
  await updateDoc(doc(db, COLECAO, id), {
    assignedToId: suporte.uid,
    assignedToName: suporte.nome,
    status: STATUS.EM_ANDAMENTO,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Atualiza o status de um chamado. Preenche `resolvedAt`/`cancelledAt`
 * automaticamente quando aplicavel.
 * @param {string} id - ID do chamado.
 * @param {string} novoStatus - Um dos valores de STATUS.
 */
export async function atualizarStatusChamado(id, novoStatus) {
  const dados = {
    status: novoStatus,
    updatedAt: serverTimestamp(),
  };

  if (novoStatus === STATUS.RESOLVIDO) {
    dados.resolvedAt = serverTimestamp();
  } else if (novoStatus === STATUS.CANCELADO) {
    dados.cancelledAt = serverTimestamp();
  }

  await updateDoc(doc(db, COLECAO, id), dados);
}

/**
 * Registra a resposta do suporte (visivel ao solicitante).
 * @param {string} id - ID do chamado.
 * @param {string} resposta - Texto da resposta.
 */
export async function responderChamado(id, resposta) {
  await updateDoc(doc(db, COLECAO, id), {
    supportResponse: resposta,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Registra a solucao aplicada ao chamado.
 * @param {string} id - ID do chamado.
 * @param {string} solucao - Texto da solucao.
 */
export async function registrarSolucao(id, solucao) {
  await updateDoc(doc(db, COLECAO, id), {
    resolution: solucao,
    updatedAt: serverTimestamp(),
  });
}

// ----------------------------------------------------------------------------
// DELETE
// ----------------------------------------------------------------------------

/**
 * Exclui um chamado. As regras do Firestore garantem que o solicitante so
 * exclua chamados proprios e abertos; o suporte pode excluir qualquer um.
 * @param {string} id - ID do chamado.
 */
export async function excluirChamado(id) {
  await deleteDoc(doc(db, COLECAO, id));
}

/**
 * Apaga os chamados ABERTOS de um solicitante. Usado na autoexclusao de conta
 * para limpar os dados que o usuario ainda pode remover. Chamados em outros
 * status (em andamento, resolvido, cancelado, aguardando) sao preservados como
 * historico de atendimento e as regras do Firestore impedem o solicitante de
 * apaga-los (RN005/RN006).
 *
 * @param {string} requesterId - UID do solicitante.
 * @returns {Promise<number>} Quantidade de chamados apagados.
 */
export async function excluirChamadosAbertosDoSolicitante(requesterId) {
  const consulta = query(colecaoChamados, where("requesterId", "==", requesterId));
  const snap = await getDocs(consulta);
  const abertos = snap.docs.filter((d) => d.data().status === STATUS.ABERTO);
  await Promise.all(abertos.map((d) => deleteDoc(d.ref)));
  return abertos.length;
}
