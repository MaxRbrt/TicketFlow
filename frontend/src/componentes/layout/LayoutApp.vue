<!--
  ============================================================================
  TicketFlow - LayoutApp.vue
  ----------------------------------------------------------------------------
  Moldura das telas internas: sidebar a esquerda + barra superior + conteudo.
  No desktop a sidebar fica fixa; no mobile vira um menu deslizante (drawer)
  controlado pelo botao de menu da barra superior.

  Uso nas paginas:
    <LayoutApp titulo="Meus Chamados" v-model:busca="termo">
      ... conteudo da pagina ...
    </LayoutApp>

  Props: titulo, mostrarBusca, busca (v-model:busca)
  ============================================================================
-->
<template>
  <div class="layout">
    <!-- Overlay do drawer (apenas mobile, quando aberto) -->
    <div
      v-if="menuAberto"
      class="layout-overlay"
      @click="menuAberto = false"
    ></div>

    <!-- Sidebar / drawer -->
    <div class="layout-sidebar" :class="{ 'layout-sidebar-aberta': menuAberto }">
      <MenuLateralApp @navegou="menuAberto = false" />
    </div>

    <!-- Area principal -->
    <div class="layout-principal">
      <CabecalhoApp
        :titulo="titulo"
        :mostrar-busca="mostrarBusca"
        :model-value="busca"
        @update:model-value="$emit('update:busca', $event)"
        @abrir-menu="menuAberto = true"
      />

      <main class="layout-conteudo">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import MenuLateralApp from "./MenuLateralApp.vue";
import CabecalhoApp from "./CabecalhoApp.vue";

defineProps({
  titulo: { type: String, default: "" },
  mostrarBusca: { type: Boolean, default: true },
  busca: { type: String, default: "" },
});

defineEmits(["update:busca"]);

// Estado do drawer no mobile.
const menuAberto = ref(false);
</script>

<style scoped>
.layout {
  display: flex;
  gap: var(--espaco-lg);
  align-items: flex-start;
  max-width: var(--largura-maxima-conteudo);
  margin: 0 auto;
  padding: var(--espaco-lg);
  min-height: 100vh;
}

/* ----- Sidebar (desktop: fixa/sticky) ------------------------------------- */
.layout-sidebar {
  position: sticky;
  top: var(--espaco-lg);
  flex-shrink: 0;
  align-self: flex-start;
}

/* ----- Area principal ----------------------------------------------------- */
.layout-principal {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--espaco-lg);
}

.layout-conteudo {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-lg);
}

/* ----- Mobile: sidebar vira drawer deslizante ----------------------------- */
.layout-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-sidebar) - 1);
  background: rgba(8, 22, 27, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

@media (max-width: 1100px) {
  .layout {
    width: 100%;
    padding: var(--mobile-page-padding, var(--espaco-md));
    gap: var(--mobile-stack-gap, var(--espaco-md));
  }

  .layout-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: var(--largura-sidebar);
    max-width: calc(100vw - 20px);
    height: 100dvh;
    z-index: var(--z-sidebar);
    padding: var(--mobile-page-padding, var(--espaco-sm));
    overflow-y: auto;
    transform: translateX(calc(-100% - 20px));
    transition: transform var(--transicao-media);
  }

  .layout-sidebar-aberta {
    transform: translateX(0);
  }
}
</style>
