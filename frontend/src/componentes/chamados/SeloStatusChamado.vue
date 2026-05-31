<!--
  ============================================================================
  TicketFlow - SeloStatusChamado.vue
  ----------------------------------------------------------------------------
  Selo (badge) que mostra o status OU a prioridade de um chamado, com a cor
  vinda das constantes (via variavel CSS --cor-badge). Reaproveita as classes
  globais .badge / .badge-suave.

  Props:
    - valor : valor cru (ex.: "open" ou "urgent")
    - tipo  : "status" (padrao) | "prioridade"
  ============================================================================
-->
<template>
  <span
    class="badge badge-suave"
    :class="{ 'badge-urgente': destaqueUrgente }"
    :style="{ '--cor-badge': info.cor }"
  >
    <span class="ponto"></span>{{ info.rotulo }}
  </span>
</template>

<script setup>
import { computed } from "vue";
import { obterInfoStatus } from "../../constantes/statusChamado.js";
import { obterInfoPrioridade, PRIORIDADE } from "../../constantes/prioridadesChamado.js";

const props = defineProps({
  valor: { type: String, required: true },
  tipo: { type: String, default: "status" },
});

// Resolve rotulo + cor conforme o tipo do selo.
const info = computed(() =>
  props.tipo === "prioridade"
    ? obterInfoPrioridade(props.valor)
    : obterInfoStatus(props.valor)
);

// Prioridade urgente recebe o pulso de destaque (RN008).
const destaqueUrgente = computed(
  () => props.tipo === "prioridade" && props.valor === PRIORIDADE.URGENTE
);
</script>
