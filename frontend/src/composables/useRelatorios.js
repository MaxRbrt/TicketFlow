// ============================================================================
// TicketFlow - useRelatorios
// ----------------------------------------------------------------------------
// Conecta a lista de chamados do suporte (transmitida em tempo real pela escuta
// unica de `useNotificacaoSuporte`, criada no #8) com as funcoes puras de
// agregacao de `utils/relatorios.js`. Nao abre escuta propria nem faz leitura
// nova no Firestore: o App.vue ja liga o singleton no login do suporte.
//
// Cada chamada de useRelatorios() tem seu PROPRIO `periodo` (ref local), entao a
// aba Relatorios e a faixa de resumo do Painel podem usar periodos diferentes
// sem interferir uma na outra. A fonte de dados (todos) e compartilhada.
// ============================================================================

import { ref, computed } from "vue";
import { useNotificacaoSuporte } from "./useNotificacaoSuporte.js";
import {
  filtrarPorPeriodo,
  volumePorPeriodo,
  agruparPorSetor,
  tempoMedioResolucao,
  taxaResolucao,
  topSolicitantes,
} from "../utils/relatorios.js";

/**
 * @param {string} [periodoInicial='mes'] - 'mes' | 'trimestre' | 'ano' | 'tudo'
 */
export function useRelatorios(periodoInicial = "mes") {
  const { todos } = useNotificacaoSuporte();
  const periodo = ref(periodoInicial);

  const chamadosFiltrados = computed(() =>
    filtrarPorPeriodo(todos.value, periodo.value)
  );

  return {
    periodo,
    temDados: computed(() => chamadosFiltrados.value.length > 0),
    volume: computed(() => volumePorPeriodo(todos.value, periodo.value)),
    porSetor: computed(() => agruparPorSetor(chamadosFiltrados.value)),
    tempoMedio: computed(() => tempoMedioResolucao(chamadosFiltrados.value)),
    taxa: computed(() => taxaResolucao(chamadosFiltrados.value)),
    topSolicitantes: computed(() => topSolicitantes(chamadosFiltrados.value)),
  };
}
