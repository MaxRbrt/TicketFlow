<!--
  ============================================================================
  TicketFlow - ResumoPainel.vue
  ----------------------------------------------------------------------------
  Fileira de cards indicadores (CardPainel) para o topo dos dashboards. Recebe
  uma lista de cards e os exibe em grade responsiva, com entrada em cascata.

  Prop `cards`: array de { rotulo, numero, sub, icone? }.
    - icone (opcional): componente de icone (ex.: lucide) renderizado no card.
  ============================================================================
-->
<template>
  <section class="resumo cascata">
    <CardPainel
      v-for="(card, i) in cards"
      :key="i"
      :rotulo="card.rotulo"
      :numero="card.numero"
      :sub="card.sub"
    >
      <template v-if="card.icone" #icone>
        <component :is="card.icone" :size="20" />
      </template>
    </CardPainel>
  </section>
</template>

<script setup>
import CardPainel from "./CardPainel.vue";

defineProps({
  cards: { type: Array, default: () => [] },
});
</script>

<style scoped>
.resumo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr));
  gap: var(--espaco-md);
}

@media (max-width: 1024px) {
  .resumo {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  }
}

@media (max-width: 560px) {
  .resumo {
    grid-template-columns: 1fr;
  }
}
</style>
