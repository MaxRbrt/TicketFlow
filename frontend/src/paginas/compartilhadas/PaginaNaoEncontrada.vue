<!--
  ============================================================================
  TicketFlow - PaginaNaoEncontrada.vue
  ----------------------------------------------------------------------------
  Pagina 404 (rota fallback :pathMatch). Mostrada quando o usuario acessa um
  endereco inexistente. O botao volta para a raiz, que o guard redireciona para
  o painel do perfil (se logado) ou para o login.
  ============================================================================
-->
<template>
  <main class="tela-aviso">
    <section class="painel animar-surgir cartao-aviso">
      <span class="aviso-codigo">404</span>
      <h1 class="titulo-hero">Pagina nao encontrada</h1>
      <p class="texto-secundario">
        O endereco que voce tentou abrir nao existe ou foi movido.
      </p>
      <div class="aviso-acoes">
        <BotaoBase variante="primario" @click="irInicio">
          <template #icone><House :size="16" /></template>
          Voltar ao inicio
        </BotaoBase>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from "vue-router";
import { House } from "@lucide/vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";

const router = useRouter();

function irInicio() {
  router.push("/");
}
</script>

<style scoped>
.tela-aviso {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--espaco-lg);
}

.cartao-aviso {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--espaco-md);
  max-width: 460px;
}

.aviso-codigo {
  font-family: var(--fonte-display);
  font-size: 72px;
  font-weight: var(--peso-bold);
  line-height: 1;
  color: var(--cor-acento);
  text-shadow: var(--glow-texto);
}

.aviso-acoes {
  display: flex;
  gap: var(--espaco-sm);
  justify-content: center;
  margin-top: var(--espaco-sm);
}
</style>
