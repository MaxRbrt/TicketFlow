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

const notificacao = useNotificacao();

// Chamados abertos sem responsavel, do mais recente para o mais antigo.
const pendentes = ref([]);

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
// Evita iniciar a escuta mais de uma vez.
let ativo = false;

/**
 * Trata cada atualizacao do Firestore: filtra abertos sem responsavel, ordena,
 * dispara toast para os que sao realmente novos e atualiza a lista.
 * @param {object[]} lista - Chamados com status `open`.
 */
function aoAtualizar(lista) {
  const semResponsavel = lista.filter((c) => !c.assignedToId);
  const ordenada = ordenarPorMaisRecente(semResponsavel);

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

/** Liga a escuta em tempo real (idempotente). Use quando o suporte loga. */
function iniciar() {
  if (ativo) return;
  ativo = true;
  idsConhecidos = null;
  cancelar = observarChamadosAbertos(aoAtualizar, (e) =>
    console.error("Falha ao observar chamados abertos:", e)
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
  pendentes.value = [];
}

/**
 * Acesso a central de notificacoes do suporte.
 * @returns lista somente-leitura, contador e controles de escuta.
 */
export function useNotificacaoSuporte() {
  return {
    pendentes: readonly(pendentes),
    quantidade: computed(() => pendentes.value.length),
    iniciar,
    parar,
    marcarLido,
  };
}
