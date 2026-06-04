<!--
  ============================================================================
  TicketFlow - EntrarSessao.vue
  ----------------------------------------------------------------------------
  Tela de vinculo do SOLICITANTE. Antes de abrir chamados, o solicitante precisa
  informar o codigo de sessao gerado pelo suporte. Isso associa os dois lados:
  os chamados criados passam a pertencer aquele suporte (escopo por sessao),
  evitando que chamados de pessoas diferentes se misturem.
  ============================================================================
-->
<template>
  <LayoutAutenticacao
    titulo="Conectar ao suporte"
    subtitulo="Digite o codigo de atendimento informado pelo suporte para vincular sua sessao."
  >
    <form class="form" novalidate @submit.prevent="enviar">
      <CampoTextoBase
        v-model="codigoDigitado"
        label="Codigo de atendimento"
        placeholder="Ex.: K7P2QX"
        autocomplete="off"
        obrigatorio
        :erro="erro"
        @blur="normalizar"
      >
        <template #icone><KeyRound :size="18" /></template>
      </CampoTextoBase>

      <BotaoBase tipo="submit" variante="primario" bloco :carregando="enviando">
        <template #icone><LogIn :size="18" /></template>
        Conectar
      </BotaoBase>
    </form>

    <template #rodape>
      Nao tem um codigo? Peca ao suporte que gere um para voce.
      <br />
      <button type="button" class="link-sair" @click="sair">Sair da conta</button>
    </template>
  </LayoutAutenticacao>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { KeyRound, LogIn } from "@lucide/vue";
import LayoutAutenticacao from "../../componentes/layout/LayoutAutenticacao.vue";
import CampoTextoBase from "../../componentes/comuns/CampoTextoBase.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useSessao } from "../../composables/useSessao.js";
import { useAutenticacao } from "../../composables/useAutenticacao.js";

const router = useRouter();
const { entrarComCodigo } = useSessao();
const { sair: sairConta } = useAutenticacao();

const codigoDigitado = ref("");
const erro = ref("");
const enviando = ref(false);

// Normaliza para maiusculas enquanto o usuario digita/sai do campo.
function normalizar() {
  codigoDigitado.value = codigoDigitado.value.trim().toUpperCase();
}

/** Valida e tenta vincular a sessao. Em sucesso, vai para o painel. */
async function enviar() {
  erro.value = "";
  normalizar();

  if (!codigoDigitado.value) {
    erro.value = "Informe o codigo de atendimento.";
    return;
  }

  enviando.value = true;
  const resultado = await entrarComCodigo(codigoDigitado.value);
  enviando.value = false;

  if (resultado.ok) {
    router.push("/solicitante/painel");
  }
  // Em caso de erro, useSessao ja exibiu a notificacao.
}

/** Sai da conta (caso o usuario nao tenha codigo e queira trocar de perfil). */
async function sair() {
  await sairConta();
  router.push("/login");
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.link-sair {
  color: var(--cor-acento-claro);
  font-weight: var(--peso-semibold);
  margin-top: var(--espaco-sm);
}

.link-sair:hover {
  text-decoration: underline;
}
</style>
