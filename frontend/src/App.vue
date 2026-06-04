<!--
  ============================================================================
  TicketFlow - App.vue (raiz)
  ----------------------------------------------------------------------------
  Casca da aplicacao: renderiza a rota atual (<RouterView />) e o host global
  de notificacoes (toasts). O layout interno (sidebar/topbar) sera aplicado
  pelas proprias paginas/layouts nas proximas etapas.
  ============================================================================
-->
<template>
  <RouterView v-slot="{ Component }">
    <transition name="pagina" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>

  <!-- Notificacoes globais (toasts) - feedback de sucesso/erro/info -->
  <div class="toasts" aria-live="polite" aria-relevant="additions">
    <TransitionGroup name="toast">
      <article
        v-for="n in notificacoes"
        :key="n.id"
        class="toast"
        :class="`toast-${n.tipo}`"
        :role="papelToast(n.tipo)"
      >
        <span class="toast-icone" aria-hidden="true">
          <component :is="iconeToast(n.tipo)" :size="18" />
        </span>

        <div class="toast-corpo">
          <strong class="toast-titulo">{{ tituloToast(n.tipo) }}</strong>
          <p class="toast-mensagem">{{ n.mensagem }}</p>
        </div>

        <button
          class="toast-fechar"
          type="button"
          aria-label="Fechar notificacao"
          @click="remover(n.id)"
        >
          <X :size="16" />
        </button>
      </article>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { watch } from "vue";
import { RouterView } from "vue-router";
import { AlertCircle, CheckCircle, Info, X } from "@lucide/vue";
import { useNotificacao } from "./composables/useNotificacao.js";
import { useAutenticacao } from "./composables/useAutenticacao.js";
import { useNotificacaoSuporte } from "./composables/useNotificacaoSuporte.js";
import { useNotificacaoSolicitante } from "./composables/useNotificacaoSolicitante.js";

const { notificacoes, remover } = useNotificacao();

const ICONES_TOAST = {
  sucesso: CheckCircle,
  erro: AlertCircle,
  info: Info,
};

const TITULOS_TOAST = {
  sucesso: "Sucesso",
  erro: "Atencao",
  info: "Aviso",
};

function iconeToast(tipo) {
  return ICONES_TOAST[tipo] || Info;
}

function tituloToast(tipo) {
  return TITULOS_TOAST[tipo] || "Notificacao";
}

function papelToast(tipo) {
  return tipo === "erro" ? "alert" : "status";
}

// Centrais de notificacao por perfil: o suporte escuta os chamados novos; o
// solicitante escuta atualizacoes do suporte nos proprios chamados. Cada uma
// liga/desliga conforme o perfil logado.
const { ehSuporte, ehSolicitante, usuario } = useAutenticacao();

const notifSuporte = useNotificacaoSuporte();
watch(
  [ehSuporte, usuario],
  ([sup, u]) => (sup && u?.uid ? notifSuporte.iniciar(u.uid) : notifSuporte.parar()),
  { immediate: true }
);

const notifSolicitante = useNotificacaoSolicitante();
watch(
  [ehSolicitante, usuario],
  ([sol, u]) => (sol && u?.uid ? notifSolicitante.iniciar(u.uid) : notifSolicitante.parar()),
  { immediate: true }
);
</script>

<style scoped>
/* Transicao suave entre paginas */
.pagina-enter-active,
.pagina-leave-active {
  transition: opacity var(--transicao-media), transform var(--transicao-media);
}
.pagina-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.pagina-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
