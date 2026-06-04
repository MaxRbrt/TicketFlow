// ============================================================================
// TicketFlow - useNotificacaoSuporte
// ----------------------------------------------------------------------------
// Central de notificacoes do SUPORTE. Mantem em tempo real a lista de chamados
// que esperam atendimento (status `open` e ainda SEM responsavel) e avisa
// quando um chamado novo chega:
//   - dispara um toast ("Novo chamado: ...");
//   - alimenta o badge/contador e o painel do sino (CabecalhoApp).
//
// Estado em nivel de modulo (singleton): uma unica escuta compartilhada por
// todo o app, ligada enquanto o usuario logado for suporte. Diferente de
// `useNotificacao` (toasts efemeros), aqui o estado de "pendentes" persiste
// enquanto houver chamados aguardando.
// ============================================================================

import { ref, computed, readonly } from "vue";
import { observarChamadosAbertos } from "../servicos/servicoChamado.js";
import { ordenarPorMaisRecente } from "../utils/ordenarChamados.js";
import { useNotificacao } from "./useNotificacao.js";
import { STATUS } from "../constantes/statusChamado.js";

const notificacao = useNotificacao();

// Chamados abertos sem responsavel, do mais recente para o mais antigo.
const pendentes = ref([]);

// Lista COMPLETA dos chamados do suporte (qualquer status), crua (sem ordenar).
// Exposta para a store espelhar e evitar abrir um 2o onSnapshot na mesma query
// (mesma fonte alimenta o sino e os paineis de suporte). `carregado` indica que
// a 1a leitura ja chegou (usado para o estado de carregamento dos paineis).
const todos = ref([]);
const carregado = ref(false);

// Referencia para cancelar a escuta em tempo real.
let cancelar = null;
// Set com os IDs ja conhecidos. `null` enquanto a 1a carga nao chegou: nessa
// carga inicial NAO disparamos toast (evita "avisar" chamados que ja existiam).
let idsConhecidos = null;
// IDs que o suporte ja "leu" (clicou na notificacao): somem do badge/painel
// mesmo continuando abertos no Firestore, ate serem de fato assumidos.
let lidos = new Set();
// IDs que ja geraram toast nesta sessao do navegador. Segura duplicatas quando
// o Firestore reenvia snapshots ou a escuta e reiniciada rapidamente.
const idsNotificados = new Set();
// Mapa { idChamado: marca da ultima mensagem }. Detecta mensagens novas do
// solicitante para avisar o suporte. Semeado na 1a carga (sem avisar).
let ultimasMensagens = new Map();
let mensagensSemeadas = false;
// Evita iniciar a escuta mais de uma vez.
let ativo = false;

/**
 * Detecta mensagens novas vindas do SOLICITANTE e dispara um toast. Mensagens
 * do proprio suporte nao avisam. Na 1a carga apenas semeia (sem avisar) para
 * nao notificar conversas que ja existiam.
 * @param {object[]} lista - Chamados do suporte (qualquer status).
 */
function detectarMensagens(lista) {
  for (const c of lista) {
    const marca = c.lastMessageAt?.toMillis?.() || 0;
    if (!marca) continue;

    const anterior = ultimasMensagens.get(c.id);
    ultimasMensagens.set(c.id, marca);

    if (!mensagensSemeadas) continue; // 1a carga: so semeia
    if (c.lastMessageBy !== "requester") continue; // so msg do solicitante avisa
    if (anterior === undefined || marca > anterior) {
      const autor = c.requesterName ? ` de ${c.requesterName}` : "";
      notificacao.info(`Nova mensagem${autor}: ${c.title}`);
    }
  }
  mensagensSemeadas = true;
}

/**
 * Trata cada atualizacao do Firestore: filtra abertos sem responsavel, ordena,
 * dispara toast para os que sao realmente novos e atualiza a lista.
 * @param {object[]} lista - Chamados das sessoes do suporte (qualquer status).
 */
function aoAtualizar(lista) {
  // Espelha a lista completa (fonte unica para a store dos paineis de suporte).
  todos.value = lista;
  carregado.value = true;

  // Avisa de mensagens novas do solicitante (independe do status do chamado).
  detectarMensagens(lista);

  // A escuta traz todos os chamados do suporte; aqui filtramos os que ainda
  // aguardam atendimento (abertos e sem responsavel).
  const aguardando = lista.filter(
    (c) => c.status === STATUS.ABERTO && !c.assignedToId
  );
  const ordenada = ordenarPorMaisRecente(aguardando);

  // Limpa de "lidos" os IDs que nao estao mais abertos/sem-dono (foram
  // assumidos, resolvidos ou excluidos): evita o Set crescer sem limite.
  const idsAtuais = new Set(ordenada.map((c) => c.id));
  for (const id of lidos) {
    if (!idsAtuais.has(id)) lidos.delete(id);
  }

  if (idsConhecidos === null) {
    // Primeira carga: apenas semeia os IDs, sem avisar.
    idsConhecidos = idsAtuais;
  } else {
    // Avisa cada chamado que apareceu depois da carga inicial.
    const novos = ordenada.filter((c) => !idsConhecidos.has(c.id));
    for (const c of novos) {
      if (idsNotificados.has(c.id)) continue;

      idsNotificados.add(c.id);
      const autor = c.requesterName ? ` - ${c.requesterName}` : "";
      notificacao.info(`Novo chamado: ${c.title}${autor}`);
    }
    idsConhecidos = idsAtuais;
  }

  // O badge/painel mostram apenas os que o suporte ainda nao leu.
  pendentes.value = ordenada.filter((c) => !lidos.has(c.id));
}

/**
 * Marca um chamado como lido: some do badge e do painel imediatamente. O
 * chamado continua aberto no Firestore ate ser assumido de fato.
 * @param {string} id - ID do chamado.
 */
function marcarLido(id) {
  lidos.add(id);
  pendentes.value = pendentes.value.filter((c) => c.id !== id);
}

/**
 * Liga a escuta em tempo real (idempotente). Use quando o suporte loga.
 * @param {string} suporteId - UID do suporte (escopo das sessoes).
 */
function iniciar(suporteId) {
  if (ativo) return;
  ativo = true;
  idsConhecidos = null;
  ultimasMensagens = new Map();
  mensagensSemeadas = false;
  cancelar = observarChamadosAbertos(suporteId, aoAtualizar, (e) =>
    console.error("Falha ao observar chamados do suporte:", e)
  );
}

/**
 * Desliga a escuta e limpa o estado visivel. Os IDs ja notificados ficam na
 * sessao para evitar toast duplicado se a autenticacao oscilar e religar.
 */
function parar() {
  if (cancelar) {
    cancelar();
    cancelar = null;
  }
  ativo = false;
  idsConhecidos = null;
  lidos = new Set();
  ultimasMensagens = new Map();
  mensagensSemeadas = false;
  pendentes.value = [];
  todos.value = [];
  carregado.value = false;
}

/**
 * Acesso a central de notificacoes do suporte.
 * @returns lista somente-leitura, contador e controles de escuta.
 */
export function useNotificacaoSuporte() {
  return {
    pendentes: readonly(pendentes),
    quantidade: computed(() => pendentes.value.length),
    todos: readonly(todos),
    carregado: readonly(carregado),
    iniciar,
    parar,
    marcarLido,
  };
}
