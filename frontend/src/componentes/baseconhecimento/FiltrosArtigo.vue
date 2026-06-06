<!--
  ============================================================================
  TicketFlow - FiltrosArtigo.vue
  ----------------------------------------------------------------------------
  Filtro de categoria da base de conhecimento. Reaproveita as categorias dos
  chamados. Usa v-model com a string da categoria; valor vazio ("") = todas.
  A busca textual fica na barra do LayoutApp (igual a tela de chamados).

  Uso:
    <FiltrosArtigo v-model="categoria" />
  ============================================================================
-->
<template>
  <div class="filtros-artigo vidro">
    <SeletorBase
      :model-value="modelValue"
      label="Categoria"
      :opcoes="opcoesCategoria"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import SeletorBase from "../comuns/SeletorBase.vue";
import { LISTA_CATEGORIAS } from "../../constantes/categoriasChamado.js";

defineProps({
  modelValue: { type: String, default: "" },
});

defineEmits(["update:modelValue"]);

// Comeca com "Todas" (valor vazio = sem filtro).
const opcoesCategoria = [
  { valor: "", rotulo: "Todas as categorias" },
  ...LISTA_CATEGORIAS,
];
</script>

<style scoped>
.filtros-artigo {
  padding: var(--espaco-md);
  border-radius: var(--raio-card);
  /* Filtro compacto: nao estica o select por toda a largura da pagina. */
  max-width: 320px;
}

@media (max-width: 720px) {
  .filtros-artigo {
    max-width: none;
  }
}
</style>
