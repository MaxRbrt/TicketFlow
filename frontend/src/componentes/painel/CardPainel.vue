<!--
  ============================================================================
  TicketFlow - CardPainel.vue
  ----------------------------------------------------------------------------
  Card de indicador para os dashboards: rotulo em maiusculas, numero em
  destaque (ciano com glow) e um texto auxiliar. Icone via slot.

  Props: rotulo, numero, sub
  Slot:  icone
  ============================================================================
-->
<template>
  <article class="cartao elevavel card-painel">
    <header class="card-painel-topo">
      <span class="rotulo-pequeno">{{ rotulo }}</span>
      <span v-if="$slots.icone" class="card-painel-icone"><slot name="icone" /></span>
    </header>
    <strong class="numero-indicador">{{ numero }}</strong>
    <span v-if="sub" class="texto-secundario card-painel-sub">{{ sub }}</span>
  </article>
</template>

<script setup>
defineProps({
  rotulo: { type: String, default: "" },
  numero: { type: [Number, String], default: 0 },
  sub: { type: String, default: "" },
});
</script>

<style scoped>
.card-painel {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}

.card-painel-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-sm);
}

.card-painel-icone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: var(--cor-acento);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
}

.card-painel-sub {
  font-size: var(--fonte-pequena);
}
</style>
