// ============================================================================
// TicketFlow - useNotificacaoSolicitante
// ----------------------------------------------------------------------------
// Central de notificacoes do SOLICITANTE. Escuta em tempo real os chamados do
// proprio usuario e avisa quando o SUPORTE faz uma atualizacao relevante:
//   - nova resposta ao solicitante (supportResponse);
//   - mudanca de status (assumido, em andamento, resolvido, etc.);
//   - solucao aplicada (resolution).
//
// "Visto" por chamado e guardado no localStorage (por UID), entao o aviso
// sobrevive a recarregar/relogar: se o suporte responder enquanto o solicitante
// esta offline, ao voltar ele ve o badge. Edicoes do PROPRIO solicitante (titulo,
// descricao, etc.) NAO entram na assinatura -> nao geram falso aviso.
//
// Estado em nivel de modulo (singleton): uma unica escuta compartilhada.
// ============================================================================

import { ref, computed, readonly } from "vue";
import { observarChamadosDoSolicitante } from "../servicos/servicoChamado.js";
import { ordenarPorMaisRecente } from "../utils/ordenarChamados.js";
import { useNotificacao } from "./useNotificacao.js";

const notificacao = useNotificacao();

// Chamados com atualizacao do suporte ainda nao vista, mais recente primeiro.
const pendentes = ref([]);

let cancelar = null;
let ativo = false;
let uidAtual = null;
// Mapa { idChamado: assinatura } do que ja foi visto (carregado do localStorage).
let vistos = {};
// Evita toast duplicado para a mesma versao do chamado nesta sessao.
const avisados = new Set();
// `true` apos a 1a carga: antes disso so semeamos, sem avisar.
let inicializado = false;

/**
 * Assinatura dos campos que o SUPORTE altera. Se mudar, houve novidade para o
 * solicitante. Campos editaveis pelo proprio solicitante ficam de fora.
 * @param {object} c - Chamado.
 */
function assinatura(c) {
  return [
    c.status || "",
    c.supportResponse || "",
    c.resolution || "",
    c.assignedToName || "",
  ].join("|");
}

function chaveStorage() {
  return `tf-notif-solic-${uidAtual}`;
}

function carregarVistos() {
  try {
    vistos = JSON.parse(localStorage.getItem(chaveStorage()) || "{}");
  } catch {
    vistos = {};
  }
}

function salvarVistos() {
  try {
    localStorage.setItem(chaveStorage(), JSON.stringify(vistos));
  } catch {
    // localStorage indisponivel (modo privado): segue so em memoria.
  }
}

/**
 * Trata cada atualizacao do Firestore: semeia chamados novos, detecta
 * atualizacoes do suporte ainda nao vistas, avisa por toast e monta a lista.
 * @param {object[]} lista - Chamados do solicitante.
 */
function aoAtualizar(lista) {
  // Semeia chamados nunca vistos antes (ex.: recem-criados pelo usuario): nao
  // geram aviso, apenas registram a assinatura atual como "ja vista".
  for (const c of lista) {
    if (!(c.id in vistos)) vistos[c.id] = assinatura(c);
  }
  salvarVistos();

  // Pendentes = chamados cuja assinatura atual difere da ultima vista.
  const novos = ordenarPorMaisRecente(
    lista.filter((c) => vistos[c.id] !== assinatura(c))
  );

  if (inicializado) {
    for (const c of novos) {
      const marca = `${c.id}:${assinatura(c)}`;
      if (avisados.has(marca)) continue;
      avisados.add(marca);
      notificacao.info(`Atualizacao no chamado: ${c.title}`);
    }
  }
  inicializado = true;

  pendentes.value = novos;
}

/**
 * Marca um chamado como visto: grava a assinatura atual e some do badge/painel.
 * @param {object} chamado - Chamado visto (precisa do objeto p/ a assinatura).
 */
function marcarVisto(chamado) {
  if (!chamado) return;
  vistos[chamado.id] = assinatura(chamado);
  salvarVistos();
  pendentes.value = pendentes.value.filter((c) => c.id !== chamado.id);
}

/**
 * Liga a escuta dos chamados do solicitante (idempotente).
 * @param {string} uid - UID do solicitante logado.
 */
function iniciar(uid) {
  if (ativo) return;
  ativo = true;
  uidAtual = uid;
  inicializado = false;
  carregarVistos();
  cancelar = observarChamadosDoSolicitante(uid, aoAtualizar, (e) =>
    console.error("Falha ao observar chamados do solicitante:", e)
  );
}

/** Desliga a escuta e limpa o estado visivel (mantem o "visto" no storage). */
function parar() {
  if (cancelar) {
    cancelar();
    cancelar = null;
  }
  ativo = false;
  uidAtual = null;
  inicializado = false;
  pendentes.value = [];
}

/**
 * Acesso a central de notificacoes do solicitante.
 * @returns lista somente-leitura, contador e controles.
 */
export function useNotificacaoSolicitante() {
  return {
    pendentes: readonly(pendentes),
    quantidade: computed(() => pendentes.value.length),
    iniciar,
    parar,
    marcarVisto,
  };
}
