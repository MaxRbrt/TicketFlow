<!--
  ============================================================================
  TicketFlow - PaginaNaoAutorizada.vue
  ----------------------------------------------------------------------------
  Exibida quando um usuario autenticado tenta acessar uma area de outro perfil
  (guard de rota -> /nao-autorizado). Oferece o caminho de volta para a area
  correta do usuario. Reforca o controle de acesso por perfil (RNF005).
  ============================================================================
-->
<template>
  <main class="tela-aviso">
    <section class="painel animar-surgir cartao-aviso">
      <span class="aviso-icone"><ShieldAlert :size="34" /></span>
      <h1 class="titulo-hero">Acesso negado</h1>
      <p class="texto-secundario">
        Voce nao tem permissao para acessar esta pagina. Ela pertence a outro
        perfil de usuario.
      </p>
      <div class="aviso-acoes">
        <BotaoBase v-if="estaLogado" variante="primario" @click="irPainel">
          Ir para o meu painel
        </BotaoBase>
        <BotaoBase v-else variante="primario" @click="irLogin">
          Ir para o login
        </BotaoBase>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ShieldAlert } from "@lucide/vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";

const router = useRouter();
const { estaLogado, rotaInicial } = useAutenticacao();

function irPainel() {
  router.push(rotaInicial.value);
}

function irLogin() {
  router.push("/login");
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

.aviso-icone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  color: var(--cor-status-cancelado);
  background: color-mix(in srgb, var(--cor-status-cancelado) 14%, transparent);
}

.aviso-acoes {
  display: flex;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--espaco-sm);
}
</style>
