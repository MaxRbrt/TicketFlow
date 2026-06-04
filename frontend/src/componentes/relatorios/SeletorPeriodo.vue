<!--
  ============================================================================
  TicketFlow - SeletorPeriodo.vue
  ----------------------------------------------------------------------------
  Chips de preset de periodo para os relatorios. v-model com a string do
  periodo ('mes' | 'trimestre' | 'ano' | 'tudo'). O ativo recebe glow ciano.
  ============================================================================
-->
<template>
  <div class="seletor-periodo" role="group" aria-label="Periodo do relatorio">
    <button
      v-for="op in opcoes"
      :key="op.valor"
      type="button"
      class="chip"
      :class="{ ativo: modelValue === op.valor }"
      :aria-pressed="modelValue === op.valor"
      @click="$emit('update:modelValue', op.valor)"
    >
      {{ op.rotulo }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: "mes" },
});
defineEmits(["update:modelValue"]);

const opcoes = [
  { valor: "mes", rotulo: "Este mes" },
  { valor: "trimestre", rotulo: "Ultimo trimestre" },
  { valor: "ano", rotulo: "Este ano" },
  { valor: "tudo", rotulo: "Tudo" },
];
</script>

<style scoped>
.seletor-periodo {
  display: flex;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
}

.chip {
  font: inherit;
  font-size: var(--fonte-pequena);
  font-weight: var(--peso-semibold);
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  color: var(--cor-texto-secundario);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
  transition: color var(--transicao-rapida), border-color var(--transicao-rapida),
    background var(--transicao-rapida), box-shadow var(--transicao-rapida);
}

.chip:hover {
  color: var(--cor-texto-principal);
  border-color: color-mix(in srgb, var(--cor-acento) 35%, transparent);
}

.chip.ativo {
  color: var(--cor-acento-claro, #9fe9ee);
  background: color-mix(in srgb, var(--cor-acento) 16%, transparent);
  border-color: color-mix(in srgb, var(--cor-acento) 50%, transparent);
  box-shadow: var(--glow-acento, 0 0 16px rgba(69, 211, 218, 0.25));
}
</style>
