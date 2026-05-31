<!--
  ============================================================================
  TicketFlow - BotaoBase.vue
  ----------------------------------------------------------------------------
  Botao reutilizavel. Usa as classes globais (.botao + variantes de botoes.css)
  e adiciona estado de carregamento (spinner) e icone via slot.

  Props:
    - variante : "primario" | "secundario" | "perigo" | "fantasma" | "icone"
    - tamanho  : "normal" | "pequeno"
    - tipo     : "button" | "submit" | "reset"
    - bloco    : ocupa 100% da largura
    - carregando / desabilitado
  ============================================================================
-->
<template>
  <button
    :type="tipo"
    class="botao"
    :class="[classeVariante, { 'botao-pequeno': tamanho === 'pequeno', 'botao-bloco': bloco }]"
    :disabled="desabilitado || carregando"
  >
    <span v-if="carregando" class="botao-spinner" aria-hidden="true"></span>
    <slot name="icone" />
    <slot />
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variante: { type: String, default: "primario" },
  tamanho: { type: String, default: "normal" },
  tipo: { type: String, default: "button" },
  bloco: { type: Boolean, default: false },
  carregando: { type: Boolean, default: false },
  desabilitado: { type: Boolean, default: false },
});

// Mapeia a prop variante para a classe global correspondente.
const classeVariante = computed(() => `botao-${props.variante}`);
</script>

<style scoped>
.botao-bloco {
  width: 100%;
}

/* Spinner inline para o estado de carregamento. */
.botao-spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: girar 0.7s linear infinite;
}
</style>
