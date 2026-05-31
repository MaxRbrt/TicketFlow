// ============================================================================
// TicketFlow - useFormatarData
// ----------------------------------------------------------------------------
// Composable fino que expoe os utilitarios de data para os componentes, sem
// que cada tela precise importar de utils/. Mantem um ponto unico de acesso a
// formatacao no template.
// ============================================================================

import {
  formatarData,
  formatarDataHora,
  formatarDataRelativa,
} from "../utils/formatarData.js";

/**
 * Disponibiliza as funcoes de formatacao de data.
 * Uso no <script setup>: const { formatarData } = useFormatarData();
 */
export function useFormatarData() {
  return {
    formatarData,
    formatarDataHora,
    formatarDataRelativa,
  };
}
