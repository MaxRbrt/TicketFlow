<!--
  ============================================================================
  TicketFlow - CardArtigo.vue
  ----------------------------------------------------------------------------
  Card que resume um artigo da base de conhecimento (usado na listagem).
  Mostra titulo, um trecho do corpo, a categoria e quando foi atualizado.
  Clicar abre a leitura completa.

  Props:  artigo
  Evento: abrir (id do artigo)
  ============================================================================
-->
<template>
  <article
    class="card-artigo cartao elevavel"
    role="button"
    tabindex="0"
    @click="$emit('abrir', artigo.id)"
    @keydown.enter="$emit('abrir', artigo.id)"
  >
    <header class="card-artigo-topo">
      <span class="card-artigo-icone"><BookOpen :size="18" /></span>
      <h3 class="titulo-card">{{ artigo.title }}</h3>
    </header>

    <p class="card-artigo-resumo texto-secundario">{{ artigo.body }}</p>

    <footer class="card-artigo-rodape">
      <span class="badge badge-suave" :style="{ '--cor-badge': 'var(--cor-acento)' }">
        <span class="ponto"></span>{{ rotuloCategoria(artigo.category) }}
      </span>
      <span class="card-artigo-data">
        {{ formatarDataRelativa(artigo.updatedAt || artigo.createdAt) }}
      </span>
    </footer>
  </article>
</template>

<script setup>
import { BookOpen } from "@lucide/vue";
import { rotuloCategoria } from "../../constantes/categoriasChamado.js";
import { formatarDataRelativa } from "../../utils/formatarData.js";

defineProps({
  artigo: { type: Object, required: true },
});

defineEmits(["abrir"]);
</script>

<style scoped>
.card-artigo {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
  cursor: pointer;
}

.card-artigo-topo {
  display: flex;
  align-items: flex-start;
  gap: var(--espaco-sm);
}

.card-artigo-icone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  color: var(--cor-acento);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
}

.card-artigo-resumo {
  font-size: var(--fonte-corpo);
  /* Limita a 3 linhas (trecho). */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* Preserva quebras simples sem deixar palavras longas estourarem o card. */
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.card-artigo-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-sm);
  margin-top: 4px;
  padding-top: var(--espaco-sm);
  border-top: 1px solid var(--vidro-borda);
  font-size: var(--fonte-pequena);
  color: var(--cor-texto-secundario);
}
</style>
