<!--
  ============================================================================
  TicketFlow - PaginaCadastro.vue
  ----------------------------------------------------------------------------
  Tela de cadastro (RF001). Valida nome, e-mail, senha, confirmacao e tipo de
  conta; cria o usuario via useAutenticacao (que tambem cria o perfil no
  Firestore) e redireciona conforme o perfil escolhido.
  ============================================================================
-->
<template>
  <LayoutAutenticacao
    titulo="Criar conta"
    subtitulo="Cadastre-se para abrir e acompanhar chamados."
  >
    <form class="form" novalidate @submit.prevent="enviar">
      <CampoTextoBase
        v-model="nome"
        label="Nome completo"
        placeholder="Seu nome"
        autocomplete="name"
        obrigatorio
        :erro="erros.nome"
      >
        <template #icone><UserRound :size="18" /></template>
      </CampoTextoBase>

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

      <div class="form-linha">
        <CampoTextoBase
          v-model="senha"
          label="Senha"
          tipo="password"
          placeholder="Minimo 6 caracteres"
          autocomplete="new-password"
          obrigatorio
          :erro="erros.senha"
        >
          <template #icone><Lock :size="18" /></template>
        </CampoTextoBase>

        <CampoTextoBase
          v-model="confirmacao"
          label="Confirmar senha"
          tipo="password"
          placeholder="Repita a senha"
          autocomplete="new-password"
          obrigatorio
          :erro="erros.confirmacao"
        >
          <template #icone><Lock :size="18" /></template>
        </CampoTextoBase>
      </div>

      <SeletorBase
        v-model="perfil"
        label="Tipo de conta"
        placeholder="Selecione..."
        :opcoes="LISTA_PERFIS"
        obrigatorio
        :erro="erros.perfil"
      />

      <BotaoBase tipo="submit" variante="primario" bloco :carregando="enviando">
        Criar conta
      </BotaoBase>
    </form>

    <template #rodape>
      Ja tem conta?
      <RouterLink to="/login">Entrar</RouterLink>
    </template>
  </LayoutAutenticacao>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { Mail, Lock, UserRound } from "@lucide/vue";
import LayoutAutenticacao from "../../componentes/layout/LayoutAutenticacao.vue";
import CampoTextoBase from "../../componentes/comuns/CampoTextoBase.vue";
import SeletorBase from "../../componentes/comuns/SeletorBase.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { LISTA_PERFIS } from "../../constantes/perfisUsuario.js";
import {
  emailValido,
  senhaValida,
  senhasIguais,
  campoPreenchido,
} from "../../utils/validarEmail.js";

const router = useRouter();
const { cadastrar, rotaInicial } = useAutenticacao();

const nome = ref("");
const email = ref("");
const senha = ref("");
const confirmacao = ref("");
const perfil = ref("");
const enviando = ref(false);

const erros = reactive({
  nome: "",
  email: "",
  senha: "",
  confirmacao: "",
  perfil: "",
});

/** Valida todos os campos do cadastro (regras da secao 25.1). */
function validar() {
  erros.nome = campoPreenchido(nome.value) ? "" : "Informe seu nome.";
  erros.email = emailValido(email.value) ? "" : "Informe um e-mail valido.";
  erros.senha = senhaValida(senha.value)
    ? ""
    : "A senha deve ter pelo menos 6 caracteres.";
  erros.confirmacao = senhasIguais(senha.value, confirmacao.value)
    ? ""
    : "As senhas nao conferem.";
  erros.perfil = campoPreenchido(perfil.value) ? "" : "Selecione o tipo de conta.";

  return !erros.nome && !erros.email && !erros.senha && !erros.confirmacao && !erros.perfil;
}

/** Cria a conta e redireciona conforme o perfil. */
async function enviar() {
  if (!validar()) {
    return;
  }

  enviando.value = true;
  const resultado = await cadastrar({
    nome: nome.value.trim(),
    email: email.value.trim(),
    senha: senha.value,
    perfil: perfil.value,
  });
  enviando.value = false;

  if (resultado.ok) {
    router.push(rotaInicial.value);
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

.form-linha {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--espaco-md);
}

@media (max-width: 480px) {
  .form-linha {
    grid-template-columns: 1fr;
  }
}
</style>
