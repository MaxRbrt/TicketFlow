// ============================================================================
// TicketFlow - Servico da Base de Conhecimento (colecao `articles`)
// ----------------------------------------------------------------------------
// Central de autoatendimento: o suporte publica artigos de ajuda (ex.: "Como
// resetar a senha") e qualquer usuario autenticado consulta antes de abrir um
// chamado. Como nas demais camadas, aqui ficam SO as operacoes de banco; as
// regras de negocio/notificacoes vivem na store/composable.
//
// Cobre o CRUD completo:
//   - Create : criarArtigo
//   - Read   : buscarArtigo, listarArtigos
//   - Update : atualizarArtigo
//   - Delete : excluirArtigo
//
// Categoria reutiliza as constantes de chamado (`categoriasChamado.js`): os
// mesmos temas (Hardware, Software, Rede...) servem de filtro para a ajuda.
// ============================================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/configuracaoFirebase.js";

// Nome da colecao em um unico lugar.
const COLECAO = "articles";

// Referencia reutilizavel para a colecao de artigos.
const colecaoArtigos = collection(db, COLECAO);

/**
 * Converte um snapshot de documento em objeto de artigo, ja com o id.
 * @param {import("firebase/firestore").DocumentSnapshot} snap
 */
function paraArtigo(snap) {
  return { id: snap.id, ...snap.data() };
}

// ----------------------------------------------------------------------------
// CREATE
// ----------------------------------------------------------------------------

/**
 * Publica um novo artigo. Gera a referencia antes para gravar o proprio `id`
 * no documento (mesmo padrao de `criarChamado`).
 *
 * @param {object} dados - { title, body, category, authorId, authorName }.
 * @returns {Promise<string>} ID do artigo criado.
 */
export async function criarArtigo(dados) {
  const referencia = doc(colecaoArtigos);

  const artigo = {
    id: referencia.id,
    title: dados.title,
    body: dados.body,
    category: dados.category,
    authorId: dados.authorId,
    authorName: dados.authorName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(referencia, artigo);
  return referencia.id;
}

// ----------------------------------------------------------------------------
// READ
// ----------------------------------------------------------------------------

/**
 * Busca um artigo pelo ID.
 * @param {string} id - ID do artigo.
 * @returns {Promise<object|null>} Artigo (com id) ou null.
 */
export async function buscarArtigo(id) {
  const snap = await getDoc(doc(db, COLECAO, id));
  return snap.exists() ? paraArtigo(snap) : null;
}

/**
 * Lista todos os artigos, do mais recente para o mais antigo. A filtragem por
 * categoria e a busca textual ficam no cliente (volume baixo), dispensando
 * indice composto - mesmo principio adotado nas listas de chamados.
 * @returns {Promise<object[]>} Lista de artigos.
 */
export async function listarArtigos() {
  const consulta = query(colecaoArtigos, orderBy("createdAt", "desc"));
  const snap = await getDocs(consulta);
  return snap.docs.map(paraArtigo);
}

// ----------------------------------------------------------------------------
// UPDATE
// ----------------------------------------------------------------------------

/**
 * Atualiza os campos editaveis de um artigo (titulo, corpo, categoria) e renova
 * `updatedAt`. Autor e data de criacao sao preservados (garantido tambem pelas
 * regras do Firestore).
 * @param {string} id - ID do artigo.
 * @param {object} dados - { title, body, category }.
 */
export async function atualizarArtigo(id, dados) {
  await updateDoc(doc(db, COLECAO, id), {
    title: dados.title,
    body: dados.body,
    category: dados.category,
    updatedAt: serverTimestamp(),
  });
}

// ----------------------------------------------------------------------------
// DELETE
// ----------------------------------------------------------------------------

/**
 * Exclui um artigo. As regras do Firestore garantem que apenas o suporte autor
 * do artigo possa remove-lo.
 * @param {string} id - ID do artigo.
 */
export async function excluirArtigo(id) {
  await deleteDoc(doc(db, COLECAO, id));
}
