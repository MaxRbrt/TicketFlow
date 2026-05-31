<!--
  ============================================================================
  TicketFlow - FiltrosChamados.vue
  ----------------------------------------------------------------------------
  Filtros de status, prioridade e categoria (RF008/RF013). Usa v-model com um
  objeto { status, prioridade, categoria }; valor vazio ("") significa "todos".

  Uso:
    <FiltrosChamados v-model="filtros" />
  ============================================================================
-->
<template>
  <div class="filtros vidro">
    <SeletorBase
      :model-value="modelValue.status"
      label="Status"
      :opcoes="opcoesStatus"
      @update:model-value="atualizar('status', $event)"
    />
    <SeletorBase
      :model-value="modelValue.prioridade"
      label="Prioridade"
      :opcoes="opcoesPrioridade"
      @update:model-value="atualizar('prioridade', $event)"
    />
    <SeletorBase
      :model-value="modelValue.categoria"
      label="Categoria"
      :opcoes="opcoesCategoria"
      @update:model-value="atualizar('categoria', $event)"
    />
  </div>
</template>

<script setup>
import SeletorBase from "../comuns/SeletorBase.vue";
import { LISTA_STATUS } from "../../constantes/statusChamado.js";
import { LISTA_PRIORIDADES } from "../../constantes/prioridadesChamado.js";
import { LISTA_CATEGORIAS } from "../../constantes/categoriasChamado.js";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ status: "", prioridade: "", categoria: "" }),
  },
});

const emit = defineEmits(["update:modelValue"]);

// Cada lista de opcoes comeca com "Todos" (valor vazio = sem filtro).
const opcoesStatus = [{ valor: "", rotulo: "Todos os status" }, ...LISTA_STATUS];
const opcoesPrioridade = [
  { valor: "", rotulo: "Todas as prioridades" },
  ...LISTA_PRIORIDADES,
];
const opcoesCategoria = [
  { valor: "", rotulo: "Todas as categorias" },
  ...LISTA_CATEGORIAS,
];

// Emite o objeto de filtros atualizado, preservando os demais campos.
function atualizar(campo, valor) {
  emit("update:modelValue", { ...props.modelValue, [campo]: valor });
}
</script>

<style scoped>
.filtros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
  gap: var(--espaco-md);
  padding: var(--espaco-md);
  border-radius: var(--raio-card);
}

@media (max-width: 720px) {
  .filtros {
    grid-template-columns: 1fr;
  }
}
</style>
