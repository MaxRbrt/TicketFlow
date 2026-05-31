<!--
  ============================================================================
  TicketFlow - EstadoCarregamento.vue
  ----------------------------------------------------------------------------
  Indicador de carregamento (spinner ciano com glow) + texto opcional. Usado
  enquanto dados sao buscados (RNF006). Pode ocupar a area inteira (centralizado).
  ============================================================================
-->
<template>
  <div class="carregando" :class="{ 'carregando-pagina': pagina }">
    <span class="spinner" aria-hidden="true"></span>
    <p v-if="texto" class="carregando-texto">{{ texto }}</p>
    <span class="somente-leitores">Carregando</span>
  </div>
</template>

<script setup>
defineProps({
  texto: { type: String, default: "" },
  // Quando true, ocupa altura generosa e centraliza (estado de pagina cheia).
  pagina: { type: Boolean, default: false },
});
</script>

<style scoped>
.carregando {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--espaco-md);
  padding: var(--espaco-lg);
}

.carregando-pagina {
  min-height: 50vh;
}

.spinner {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 3px solid var(--vidro-borda);
  border-top-color: var(--cor-acento);
  box-shadow: var(--glow-acento);
  animation: girar 0.8s linear infinite;
}

.carregando-texto {
  color: var(--cor-texto-secundario);
  font-size: var(--fonte-corpo);
}
</style>
