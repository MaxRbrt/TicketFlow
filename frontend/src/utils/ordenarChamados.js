// ============================================================================
// TicketFlow - Utilitario de ordenacao de chamados
// ----------------------------------------------------------------------------
// Funcoes puras que ordenam listas de chamados sem alterar o array original
// (sempre retornam uma copia). Reutilizam o `peso` da prioridade e a conversao
// de datas dos modulos correspondentes.
// ============================================================================

import { pesoPrioridade } from "../constantes/prioridadesChamado.js";
import { paraData } from "./formatarData.js";

/**
 * Converte um campo de data do chamado em numero (epoch ms) para comparacao.
 * Datas ausentes/invalidas viram 0, indo para o fim em ordem decrescente.
 * @param {*} valor - Campo de data (Timestamp, Date, string ou numero).
 */
function tempo(valor) {
  const data = paraData(valor);
  return data ? data.getTime() : 0;
}

/**
 * Ordena chamados do mais recente para o mais antigo (por `createdAt`).
 * @param {Array} chamados - Lista de chamados.
 * @returns {Array} Nova lista ordenada.
 */
export function ordenarPorMaisRecente(chamados = []) {
  return [...chamados].sort((a, b) => tempo(b.createdAt) - tempo(a.createdAt));
}

/**
 * Ordena chamados do mais antigo para o mais recente (por `createdAt`).
 * @param {Array} chamados - Lista de chamados.
 * @returns {Array} Nova lista ordenada.
 */
export function ordenarPorMaisAntigo(chamados = []) {
  return [...chamados].sort((a, b) => tempo(a.createdAt) - tempo(b.createdAt));
}

/**
 * Ordena chamados por urgencia (prioridade mais alta primeiro). Em caso de
 * empate, o mais recente vem antes. Util para o painel de suporte.
 * @param {Array} chamados - Lista de chamados.
 * @returns {Array} Nova lista ordenada.
 */
export function ordenarPorPrioridade(chamados = []) {
  return [...chamados].sort((a, b) => {
    const diferenca = pesoPrioridade(b.priority) - pesoPrioridade(a.priority);
    if (diferenca !== 0) {
      return diferenca;
    }
    return tempo(b.createdAt) - tempo(a.createdAt);
  });
}
