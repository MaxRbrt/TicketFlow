<!--
  ============================================================================
  TicketFlow - EmConstrucao.vue (TEMPORARIO)
  ----------------------------------------------------------------------------
  Placeholder usado pelas rotas cujas paginas ainda nao foram implementadas.
  Conforme cada pagina real fica pronta (Etapas 8-11), a rota deixa de apontar
  para este componente. Le o titulo da rota via meta.titulo.
  ============================================================================
-->
<template>
  <section class="painel animar-surgir em-construcao">
    <span class="pill-info"><span class="ponto"></span> Em construcao</span>
    <h1 class="titulo-hero">{{ titulo }}</h1>
    <p class="texto-secundario">
      Esta tela sera implementada em uma das proximas etapas do projeto.
    </p>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
// Titulo vem da meta da rota; cai num texto neutro se nao houver.
const titulo = computed(() => route.meta?.titulo || "Pagina");
</script>

<style scoped>
.em-construcao {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  align-items: flex-start;
  max-width: 640px;
  margin: var(--espaco-2xl) auto;
}
</style>
