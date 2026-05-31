// ============================================================================
// TicketFlow - Servico de autenticacao (Firebase Authentication)
// ----------------------------------------------------------------------------
// Centraliza cadastro, login, logout e observacao da sessao. Apos o cadastro,
// cria automaticamente o documento de perfil em `users` (via servicoUsuario),
// garantindo que todo usuario autenticado tenha um perfil com `role`.
// ============================================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/configuracaoFirebase.js";
import { criarPerfilUsuario } from "./servicoUsuario.js";
import { PERFIL } from "../constantes/perfisUsuario.js";

/**
 * Cadastra um novo usuario: cria a conta no Authentication, define o nome de
 * exibicao e cria o documento de perfil em `users`.
 *
 * @param {object} dados - { nome, email, senha, perfil, departamento? }.
 * @returns {Promise<import("firebase/auth").User>} Usuario do Authentication.
 */
export async function cadastrar({ nome, email, senha, perfil, departamento }) {
  const nomeNormalizado = nome.trim();
  const emailNormalizado = email.trim().toLowerCase();

  // 1. Cria a conta no Firebase Authentication.
  const credencial = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);
  const usuario = credencial.user;

  // 2. Define o nome de exibicao na conta de autenticacao.
  await updateProfile(usuario, { displayName: nomeNormalizado });

  try {
    // 3. Cria o documento complementar do perfil no Firestore.
    // Usa usuario.email (canonico do Authentication) para casar com a regra do
    // Firestore que exige email == request.auth.token.email.
    await criarPerfilUsuario(usuario.uid, {
      name: nomeNormalizado,
      email: usuario.email,
      role: perfil || PERFIL.SOLICITANTE,
      department: departamento || null,
    });
  } catch (erro) {
    await deleteUser(usuario).catch(() => {});
    throw erro;
  }

  return usuario;
}

/**
 * Realiza login com e-mail e senha.
 *
 * @param {string} email - E-mail do usuario.
 * @param {string} senha - Senha do usuario.
 * @returns {Promise<import("firebase/auth").User>} Usuario autenticado.
 */
export async function entrar(email, senha) {
  const credencial = await signInWithEmailAndPassword(auth, email, senha);
  return credencial.user;
}

/**
 * Encerra a sessao do usuario atual.
 */
export async function sair() {
  await signOut(auth);
}

/**
 * Observa mudancas na sessao (login/logout). Util para manter o estado global
 * sincronizado e para o controle de rotas.
 *
 * @param {(usuario: import("firebase/auth").User|null) => void} callback
 *        Recebe o usuario logado ou null quando deslogado.
 * @returns {import("firebase/auth").Unsubscribe} Funcao para cancelar a escuta.
 */
export function observarAutenticacao(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retorna o usuario autenticado no momento (ou null), de forma sincrona.
 * @returns {import("firebase/auth").User|null}
 */
export function usuarioAtual() {
  return auth.currentUser;
}

/**
 * Reautentica o usuario atual com e-mail e senha. Necessario antes de operacoes
 * sensiveis como excluir a conta: o Firebase exige login recente e pode lancar
 * `auth/requires-recent-login` caso contrario.
 *
 * @param {string} senha - Senha atual do usuario.
 */
export async function reautenticar(senha) {
  const usuario = auth.currentUser;
  if (!usuario) {
    throw new Error("Nenhum usuario autenticado.");
  }
  const credencial = EmailAuthProvider.credential(usuario.email, senha);
  await reauthenticateWithCredential(usuario, credencial);
}

/**
 * Exclui a conta do usuario atual no Firebase Authentication. Deve ser a ULTIMA
 * etapa da autoexclusao: apos remover a conta, o cliente perde a autenticacao e
 * nao consegue mais apagar documentos no Firestore.
 */
export async function excluirContaAtual() {
  const usuario = auth.currentUser;
  if (!usuario) {
    throw new Error("Nenhum usuario autenticado.");
  }
  await deleteUser(usuario);
}
