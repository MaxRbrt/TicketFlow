// ============================================================================
// TicketFlow - Servico de usuario (colecao `users` no Firestore)
// ----------------------------------------------------------------------------
// Centraliza toda a comunicacao com a colecao `users`. As telas e stores NUNCA
// devem chamar o Firestore diretamente: sempre passam por aqui. Isso mantem a
// regra de acesso a dados em um unico lugar.
//
// O documento usa o UID do Firebase Authentication como ID, casando com as
// regras de seguranca do Firestore.
// ============================================================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/configuracaoFirebase.js";
import { PERFIL } from "../constantes/perfisUsuario.js";

// Nome da colecao, em um unico lugar para evitar erro de digitacao.
const COLECAO = "users";

/**
 * Cria o documento de perfil de um usuario recem-cadastrado.
 * O ID do documento e o proprio UID (exigido pelas regras do Firestore).
 *
 * @param {string} uid - UID vindo do Firebase Authentication.
 * @param {object} dados - { name, email, role, department? }.
 * @returns {Promise<object>} O perfil criado (dados enviados).
 */
export async function criarPerfilUsuario(uid, dados) {
  const perfil = {
    uid,
    name: dados.name,
    email: dados.email,
    role: dados.role || PERFIL.SOLICITANTE,
    department: dados.department || null,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, COLECAO, uid), perfil);
  return perfil;
}

/**
 * Busca o documento de perfil de um usuario pelo UID.
 *
 * @param {string} uid - UID do usuario.
 * @returns {Promise<object|null>} Dados do perfil ou null se nao existir.
 */
export async function buscarPerfilUsuario(uid) {
  const snap = await getDoc(doc(db, COLECAO, uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Atualiza campos do perfil do usuario. Sempre renova `updatedAt`.
 * As regras do Firestore impedem alterar uid e role pelo cliente.
 *
 * @param {string} uid - UID do usuario.
 * @param {object} dados - Campos a atualizar (ex.: { name, department }).
 */
export async function atualizarPerfilUsuario(uid, dados) {
  await updateDoc(doc(db, COLECAO, uid), {
    ...dados,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Exclui o documento de perfil do usuario. As regras do Firestore so permitem
 * que o proprio dono apague seu documento (autoexclusao de conta). Deve ser
 * chamado enquanto o usuario ainda esta autenticado e ANTES de remover a conta
 * no Authentication (depois disso o cliente perde permissao no Firestore).
 *
 * @param {string} uid - UID do usuario.
 */
export async function excluirPerfilUsuario(uid) {
  await deleteDoc(doc(db, COLECAO, uid));
}
