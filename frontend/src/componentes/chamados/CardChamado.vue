<!--
  ============================================================================
  TicketFlow - CardChamado.vue
  ----------------------------------------------------------------------------
  Card que resume um chamado (usado nas listas e na versao mobile da tabela).
  Mostra titulo, trecho da descricao, selos de status/prioridade, categoria,
  solicitante (opcional, para o suporte) e data. Clicar abre os detalhes.

  Props:  chamado, mostrarSolicitante
  Evento: abrir (id do chamado)
  ============================================================================
-->
<template>
  <article
    class="card-chamado cartao elevavel"
    role="button"
    tabindex="0"
    @click="$emit('abrir', chamado.id)"
    @keydown.enter="$emit('abrir', chamado.id)"
  >
    <header class="card-chamado-topo">
      <h3 class="titulo-card">{{ chamado.title }}</h3>
      <SeloStatusChamado :valor="chamado.status" tipo="status" />
    </header>

    <p class="card-chamado-desc texto-secundario">{{ chamado.description }}</p>

    <div class="card-chamado-meta">
      <SeloStatusChamado :valor="chamado.priority" tipo="prioridade" />
      <span class="card-chamado-categoria">{{ rotuloCategoria(chamado.category) }}</span>
    </div>

    <footer class="card-chamado-rodape">
      <span v-if="mostrarSolicitante" class="card-chamado-solicitante">
        <UserRound :size="14" /> {{ chamado.requesterName }}
      </span>
      <span class="card-chamado-data">{{ formatarDataRelativa(chamado.createdAt) }}</span>
    </footer>
  </article>
</template>

<script setup>
import { UserRound } from "@lucide/vue";
import SeloStatusChamado from "./SeloStatusChamado.vue";
import { rotuloCategoria } from "../../constantes/categoriasChamado.js";
import { formatarDataRelativa } from "../../utils/formatarData.js";

defineProps({
  chamado: { type: Object, required: true },
  mostrarSolicitante: { type: Boolean, default: false },
});

defineEmits(["abrir"]);
</script>

<style scoped>
.card-chamado {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
  cursor: pointer;
}

.card-chamado-topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--espaco-sm);
}

.card-chamado-desc {
  font-size: var(--fonte-corpo);
  /* Limita a 2 linhas (trecho). */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-chamado-meta {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
}

.card-chamado-categoria {
  font-size: var(--fonte-pequena);
  color: var(--cor-texto-secundario);
}

.card-chamado-rodape {
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

.card-chamado-solicitante {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
