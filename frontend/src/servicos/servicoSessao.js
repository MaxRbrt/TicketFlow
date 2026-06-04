// ============================================================================
// TicketFlow - Servico de sessoes de atendimento (colecao `sessoes`)
// ----------------------------------------------------------------------------
// Resolve o problema de vinculo entre perfis: o SUPORTE gera um codigo de
// sessao e o SOLICITANTE entra com esse codigo. A partir dai os chamados do
// solicitante ficam marcados com o `sessionSupportId` daquele suporte, e o
// suporte so enxerga os chamados das proprias sessoes (escopo por sessao).
//
// Modelo do documento `sessoes/{codigo}` (o ID do documento E o codigo):
//   { codigo, suporteId, suporteNome, ativo, criadoEm }
// ============================================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/configuracaoFirebase.js";

// Nome da colecao em um unico lugar.
const COLECAO = "sessoes";

// Referencia reutilizavel para a colecao.
const colecaoSessoes = collection(db, COLECAO);

// Alfabeto sem caracteres ambiguos (sem 0/O, 1/I/L) para o codigo ser facil de
// ditar e digitar sem confusao.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const TAMANHO_CODIGO = 6;

/**
 * Gera um codigo aleatorio (6 chars) usando uma fonte criptografica. Sem
 * caracteres ambiguos. ~30^6 combinacoes, suficiente para uso simultaneo.
 * @returns {string} Codigo em maiusculas (ex.: "K7P2QX").
 */
function gerarCodigo() {
  const aleatorios = new Uint32Array(TAMANHO_CODIGO);
  crypto.getRandomValues(aleatorios);
  let codigo = "";
  for (let i = 0; i < TAMANHO_CODIGO; i++) {
    codigo += ALFABETO[aleatorios[i] % ALFABETO.length];
  }
  return codigo;
}

/**
 * Converte um snapshot em objeto de sessao.
 * @param {import("firebase/firestore").DocumentSnapshot} snap
 */
function paraSessao(snap) {
  return { codigo: snap.id, ...snap.data() };
}

/**
 * Cria uma nova sessao de atendimento para um suporte. Gera um codigo unico
 * (com algumas tentativas em caso de colisao improvavel) e grava o documento.
 *
 * @param {object} suporte - { uid, nome } do usuario de suporte.
 * @returns {Promise<object>} Sessao criada: { codigo, suporteId, suporteNome }.
 */
export async function criarSessao(suporte) {
  // Tenta gerar um codigo livre. Colisao e improvavel; 5 tentativas bastam.
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = gerarCodigo();
    const referencia = doc(db, COLECAO, codigo);
    const existente = await getDoc(referencia);
    if (existente.exists()) continue;

    const sessao = {
      codigo,
      suporteId: suporte.uid,
      suporteNome: suporte.nome,
      ativo: true,
      criadoEm: serverTimestamp(),
    };
    await setDoc(referencia, sessao);
    return { codigo, suporteId: suporte.uid, suporteNome: suporte.nome };
  }
  throw new Error("Nao foi possivel gerar um codigo de sessao. Tente novamente.");
}

/**
 * Busca uma sessao pelo codigo (usado pelo solicitante ao entrar).
 * @param {string} codigo - Codigo da sessao (case-insensitive).
 * @returns {Promise<object|null>} Sessao (com codigo) ou null se nao existir.
 */
export async function buscarSessao(codigo) {
  const normalizado = (codigo || "").trim().toUpperCase();
  if (!normalizado) return null;
  const snap = await getDoc(doc(db, COLECAO, normalizado));
  return snap.exists() ? paraSessao(snap) : null;
}

/**
 * Retorna a sessao ATIVA mais recente de um suporte, se houver. Consulta apenas
 * por igualdade (sem orderBy) para nao exigir indice composto; a filtragem por
 * `ativo` e a escolha da mais recente sao feitas aqui.
 * @param {string} suporteId - UID do suporte.
 * @returns {Promise<object|null>} Sessao ativa ou null.
 */
export async function buscarSessaoAtivaDoSuporte(suporteId) {
  const consulta = query(colecaoSessoes, where("suporteId", "==", suporteId));
  const snap = await getDocs(consulta);
  const ativas = snap.docs
    .map(paraSessao)
    .filter((s) => s.ativo)
    .sort((a, b) => (b.criadoEm?.toMillis?.() || 0) - (a.criadoEm?.toMillis?.() || 0));
  return ativas[0] || null;
}

/**
 * Encerra (desativa) uma sessao. Novos solicitantes nao conseguem mais entrar
 * com o codigo; os chamados ja vinculados continuam visiveis ao suporte.
 * @param {string} codigo - Codigo da sessao.
 */
export async function encerrarSessao(codigo) {
  await updateDoc(doc(db, COLECAO, codigo), { ativo: false });
}
