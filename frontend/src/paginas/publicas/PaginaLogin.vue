<!--
  ============================================================================
  TicketFlow - PaginaLogin.vue
  ----------------------------------------------------------------------------
  Tela de login (RF002). Valida os campos, autentica via useAutenticacao e
  redireciona conforme o perfil (ou para a rota guardada em ?redirect).
  ============================================================================
-->
<template>
  <LayoutAutenticacao
    titulo="Entrar"
    subtitulo="Acesse sua conta para gerenciar seus chamados."
  >
    <form class="form" novalidate @submit.prevent="enviar">
      <CampoTextoBase
        v-model="email"
        label="E-mail"
        tipo="email"
        placeholder="voce@exemplo.com"
        autocomplete="email"
        obrigatorio
        :erro="erros.email"
      >
        <template #icone><Mail :size="18" /></template>
      </CampoTextoBase>

      <CampoTextoBase
        v-model="senha"
        label="Senha"
        tipo="password"
        placeholder="Sua senha"
        autocomplete="current-password"
        obrigatorio
        :erro="erros.senha"
      >
        <template #icone><Lock :size="18" /></template>
      </CampoTextoBase>

      <BotaoBase tipo="submit" variante="primario" bloco :carregando="enviando">
        <template #icone><LogIn :size="18" /></template>
        Entrar
      </BotaoBase>
    </form>

    <template #rodape>
      Nao tem conta?
      <RouterLink to="/cadastro">Criar conta</RouterLink>
    </template>
  </LayoutAutenticacao>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Mail, Lock, LogIn } from "@lucide/vue";
import LayoutAutenticacao from "../../componentes/layout/LayoutAutenticacao.vue";
import CampoTextoBase from "../../componentes/comuns/CampoTextoBase.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { emailValido, campoPreenchido } from "../../utils/validarEmail.js";

const router = useRouter();
const route = useRoute();
const { entrar, rotaInicial } = useAutenticacao();

const email = ref("");
const senha = ref("");
const enviando = ref(false);
const erros = reactive({ email: "", senha: "" });

/** Valida os campos localmente antes de enviar. Retorna true se ok. */
function validar() {
  erros.email = "";
  erros.senha = "";

  if (!emailValido(email.value)) {
    erros.email = "Informe um e-mail valido.";
  }
  if (!campoPreenchido(senha.value)) {
    erros.senha = "Informe sua senha.";
  }
  return !erros.email && !erros.senha;
}

/** Tenta logar e redireciona conforme o perfil (ou ?redirect). */
async function enviar() {
  if (!validar()) {
    return;
  }

  enviando.value = true;
  const resultado = await entrar(email.value, senha.value);
  enviando.value = false;

  if (resultado.ok) {
    const destino = route.query.redirect || rotaInicial.value;
    router.push(destino);
  }
  // Em caso de erro, useAutenticacao ja exibiu a notificacao.
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}
</style>
