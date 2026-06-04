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

      <div class="linha-esqueci">
        <button
          type="button"
          class="link-esqueci"
          :disabled="recuperando"
          @click="esqueciSenha"
        >
          Esqueci minha senha
        </button>
      </div>

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
const { entrar, recuperarSenha, rotaInicial } = useAutenticacao();

const email = ref("");
const senha = ref("");
const enviando = ref(false);
const recuperando = ref(false);
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

/**
 * Envia o e-mail de redefinicao de senha. Reaproveita o e-mail ja digitado no
 * formulario; exige apenas um e-mail valido (a senha nao importa aqui).
 */
async function esqueciSenha() {
  erros.email = "";
  if (!emailValido(email.value)) {
    erros.email = "Informe seu e-mail para recuperar a senha.";
    return;
  }

  recuperando.value = true;
  await recuperarSenha(email.value);
  recuperando.value = false;
  // useAutenticacao exibe a notificacao de sucesso/erro.
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.linha-esqueci {
  display: flex;
  justify-content: flex-end;
  margin-top: calc(var(--espaco-md) * -1 + var(--espaco-xs, 4px));
}

.link-esqueci {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
  color: var(--cor-acento, #45d3da);
  opacity: 0.85;
  transition: opacity 0.15s ease;
}

.link-esqueci:hover:not(:disabled) {
  opacity: 1;
  text-decoration: underline;
}

.link-esqueci:disabled {
  opacity: 0.5;
  cursor: progress;
}
</style>
