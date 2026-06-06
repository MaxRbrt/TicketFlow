<!--
  ============================================================================
  TicketFlow - FormularioArtigo.vue
  ----------------------------------------------------------------------------
  Formulario reutilizavel para CRIAR e EDITAR um artigo da base de conhecimento.
  Valida os campos obrigatorios e os limites aceitos pelas regras do Firestore
  (titulo <= 160, corpo <= 20000) e emite os dados prontos. Nao fala com o
  Firebase: quem salva e a pagina que usa este formulario.

  Props:  valoresIniciais (para edicao), enviando, textoBotao
  Eventos: salvar (dados), cancelar
  ============================================================================
-->
<template>
  <form class="form-artigo" novalidate @submit.prevent="enviar">
    <CampoTextoBase
      v-model="form.title"
      label="Titulo"
      placeholder="Ex.: Como resetar a senha do sistema"
      obrigatorio
      :erro="erros.title"
    />

    <SeletorBase
      v-model="form.category"
      label="Categoria"
      placeholder="Selecione..."
      :opcoes="LISTA_CATEGORIAS"
      obrigatorio
      :erro="erros.category"
    />

    <AreaTextoBase
      v-model="form.body"
      label="Conteudo"
      placeholder="Escreva o passo a passo ou a explicacao do artigo."
      :linhas="10"
      :maximo="LIMITE_CORPO"
      obrigatorio
      :erro="erros.body"
    />

    <div class="form-acoes">
      <BotaoBase variante="secundario" type="button" @click="$emit('cancelar')">
        Cancelar
      </BotaoBase>
      <BotaoBase variante="primario" tipo="submit" :carregando="enviando">
        {{ textoBotao }}
      </BotaoBase>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from "vue";
import CampoTextoBase from "../comuns/CampoTextoBase.vue";
import AreaTextoBase from "../comuns/AreaTextoBase.vue";
import SeletorBase from "../comuns/SeletorBase.vue";
import BotaoBase from "../comuns/BotaoBase.vue";
import { LISTA_CATEGORIAS } from "../../constantes/categoriasChamado.js";
import { campoPreenchido } from "../../utils/validarEmail.js";

// Limites alinhados as regras do Firestore (artigoValido).
const LIMITE_TITULO = 160;
const LIMITE_CORPO = 8000;

const props = defineProps({
  valoresIniciais: { type: Object, default: () => ({}) },
  enviando: { type: Boolean, default: false },
  textoBotao: { type: String, default: "Publicar artigo" },
});

const emit = defineEmits(["salvar", "cancelar"]);

const form = reactive({
  title: "",
  category: "",
  body: "",
});

const erros = reactive({
  title: "",
  category: "",
  body: "",
});

// Preenche o formulario quando recebe valores iniciais (modo edicao).
watch(
  () => props.valoresIniciais,
  (valores) => {
    if (valores && Object.keys(valores).length) {
      form.title = valores.title ?? "";
      form.category = valores.category ?? "";
      form.body = valores.body ?? "";
    }
  },
  { immediate: true }
);

/** Valida os campos obrigatorios e os limites de tamanho. */
function validar() {
  if (!campoPreenchido(form.title)) {
    erros.title = "Informe o titulo.";
  } else if (form.title.trim().length > LIMITE_TITULO) {
    erros.title = `O titulo deve ter no maximo ${LIMITE_TITULO} caracteres.`;
  } else {
    erros.title = "";
  }

  erros.category = campoPreenchido(form.category) ? "" : "Selecione a categoria.";

  if (!campoPreenchido(form.body)) {
    erros.body = "Escreva o conteudo do artigo.";
  } else if (form.body.trim().length > LIMITE_CORPO) {
    erros.body = `O conteudo deve ter no maximo ${LIMITE_CORPO} caracteres.`;
  } else {
    erros.body = "";
  }

  return !erros.title && !erros.category && !erros.body;
}

/** Valida e emite os dados (com textos aparados). */
function enviar() {
  if (!validar()) {
    return;
  }
  emit("salvar", {
    title: form.title.trim(),
    category: form.category,
    body: form.body.trim(),
  });
}
</script>

<style scoped>
.form-artigo {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.form-acoes {
  display: flex;
  justify-content: flex-end;
  gap: var(--espaco-sm);
  margin-top: var(--espaco-sm);
}
</style>
