<!--
  ============================================================================
  TicketFlow - EstadoVazio.vue
  ----------------------------------------------------------------------------
  Estado vazio amigavel (RNF006): mostrado quando uma lista nao tem itens.
  Aceita um icone (slot), titulo, descricao e uma acao (slot) - ex.: botao
  "Abrir novo chamado".
  ============================================================================
-->
<template>
  <div class="vazio animar-surgir">
    <div v-if="$slots.icone" class="vazio-icone">
      <slot name="icone" />
    </div>
    <div v-else class="vazio-icone">
      <Inbox :size="32" />
    </div>

    <h3 class="vazio-titulo">{{ titulo }}</h3>
    <p v-if="descricao" class="vazio-descricao">{{ descricao }}</p>

    <div v-if="$slots.acao" class="vazio-acao">
      <slot name="acao" />
    </div>
  </div>
</template>

<script setup>
import { Inbox } from "@lucide/vue";

defineProps({
  titulo: { type: String, default: "Nada por aqui" },
  descricao: { type: String, default: "" },
});
</script>

<style scoped>
.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--espaco-sm);
  padding: var(--espaco-2xl) var(--espaco-lg);
}

.vazio-icone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: var(--espaco-sm);
  border-radius: 50%;
  color: var(--cor-acento);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
}

.vazio-titulo {
  font-size: var(--fonte-titulo);
  font-family: var(--fonte-display);
  color: var(--cor-texto-principal);
}

.vazio-descricao {
  max-width: 380px;
  color: var(--cor-texto-secundario);
}

.vazio-acao {
  margin-top: var(--espaco-md);
}
</style>
