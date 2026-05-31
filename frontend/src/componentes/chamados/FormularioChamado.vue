<!--
  ============================================================================
  TicketFlow - FormularioChamado.vue
  ----------------------------------------------------------------------------
  Formulario reutilizavel para CRIAR e EDITAR chamado (RF006/RF010). Valida os
  campos obrigatorios (secao 25.3) e emite os dados prontos. Nao fala com o
  Firebase: quem salva e a pagina que usa este formulario.

  Props:  valoresIniciais (para edicao), enviando, textoBotao
  Eventos: salvar (dados), cancelar
  ============================================================================
-->
<template>
  <form class="form-chamado" novalidate @submit.prevent="enviar">
    <CampoTextoBase
      v-model="form.title"
      label="Titulo"
      placeholder="Resumo do problema"
      obrigatorio
      :erro="erros.title"
    />

    <AreaTextoBase
      v-model="form.description"
      label="Descricao"
      placeholder="Descreva o problema ou solicitacao com detalhes"
      :linhas="5"
      :maximo="1000"
      obrigatorio
      :erro="erros.description"
    />

    <div class="form-linha">
      <SeletorBase
        v-model="form.category"
        label="Categoria"
        placeholder="Selecione..."
        :opcoes="LISTA_CATEGORIAS"
        obrigatorio
        :erro="erros.category"
      />
      <SeletorBase
        v-model="form.priority"
        label="Prioridade"
        :opcoes="LISTA_PRIORIDADES"
        obrigatorio
        :erro="erros.priority"
      />
    </div>

    <CampoTextoBase
      v-model="form.location"
      label="Setor / Local"
      placeholder="Ex.: Laboratorio 2, Sala 14 (opcional)"
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
import { LISTA_PRIORIDADES, PRIORIDADE } from "../../constantes/prioridadesChamado.js";
import { campoPreenchido } from "../../utils/validarEmail.js";

const props = defineProps({
  valoresIniciais: { type: Object, default: () => ({}) },
  enviando: { type: Boolean, default: false },
  textoBotao: { type: String, default: "Salvar chamado" },
});

const emit = defineEmits(["salvar", "cancelar"]);

// Estado do formulario (prioridade padrao: media).
const form = reactive({
  title: "",
  description: "",
  category: "",
  priority: PRIORIDADE.MEDIA,
  location: "",
});

const erros = reactive({
  title: "",
  description: "",
  category: "",
  priority: "",
});

// Preenche o formulario quando recebe valores iniciais (modo edicao).
watch(
  () => props.valoresIniciais,
  (valores) => {
    if (valores && Object.keys(valores).length) {
      form.title = valores.title ?? "";
      form.description = valores.description ?? "";
      form.category = valores.category ?? "";
      form.priority = valores.priority ?? PRIORIDADE.MEDIA;
      form.location = valores.location ?? "";
    }
  },
  { immediate: true }
);

/** Valida os campos obrigatorios (secao 25.3). */
function validar() {
  erros.title = campoPreenchido(form.title) ? "" : "Informe o titulo.";
  erros.description = campoPreenchido(form.description)
    ? ""
    : "Informe a descricao.";
  erros.category = campoPreenchido(form.category) ? "" : "Selecione a categoria.";
  erros.priority = campoPreenchido(form.priority) ? "" : "Selecione a prioridade.";

  return !erros.title && !erros.description && !erros.category && !erros.priority;
}

/** Valida e emite os dados (com textos aparados). */
function enviar() {
  if (!validar()) {
    return;
  }
  emit("salvar", {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    priority: form.priority,
    location: form.location.trim(),
  });
}
</script>

<style scoped>
.form-chamado {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.form-linha {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--espaco-md);
}

.form-acoes {
  display: flex;
  justify-content: flex-end;
  gap: var(--espaco-sm);
  margin-top: var(--espaco-sm);
}

@media (max-width: 560px) {
  .form-linha {
    grid-template-columns: 1fr;
  }
}
</style>
