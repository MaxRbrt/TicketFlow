<!--
  ============================================================================
  TicketFlow - PainelDetalhesChamado.vue
  ----------------------------------------------------------------------------
  Exibicao somente-leitura dos dados de um chamado, compartilhada pelas telas
  de detalhes do solicitante e de atendimento do suporte. Mostra titulo, selos,
  descricao, dados gerais, resposta do suporte e solucao aplicada.

  Prop: chamado
  ============================================================================
-->
<template>
  <article class="detalhes painel">
    <!-- Cabecalho: titulo + selos -->
    <header class="detalhes-cabecalho">
      <div>
        <h2 class="titulo-secao">{{ chamado.title }}</h2>
        <span class="detalhes-codigo texto-secundario">#{{ chamado.id.slice(0, 8) }}</span>
      </div>
      <div class="detalhes-selos">
        <SeloStatusChamado :valor="chamado.status" tipo="status" />
        <SeloStatusChamado :valor="chamado.priority" tipo="prioridade" />
      </div>
    </header>

    <!-- Descricao -->
    <section class="detalhes-bloco">
      <span class="rotulo-pequeno">Descricao</span>
      <p class="detalhes-texto">{{ chamado.description }}</p>
    </section>

    <!-- Grade de informacoes -->
    <section class="detalhes-grade">
      <div class="detalhes-item">
        <span class="rotulo-pequeno">Categoria</span>
        <span>{{ rotuloCategoria(chamado.category) }}</span>
      </div>
      <div class="detalhes-item">
        <span class="rotulo-pequeno">Setor / Local</span>
        <span>{{ chamado.location || "-" }}</span>
      </div>
      <div v-if="mostrarSolicitante" class="detalhes-item">
        <span class="rotulo-pequeno">Solicitante</span>
        <span>{{ chamado.requesterName }}</span>
      </div>
      <div class="detalhes-item">
        <span class="rotulo-pequeno">Tecnico responsavel</span>
        <span>{{ chamado.assignedToName || "Nao atribuido" }}</span>
      </div>
      <div class="detalhes-item">
        <span class="rotulo-pequeno">Aberto em</span>
        <span>{{ formatarDataHora(chamado.createdAt) }}</span>
      </div>
      <div class="detalhes-item">
        <span class="rotulo-pequeno">Ultima atualizacao</span>
        <span>{{ formatarDataHora(chamado.updatedAt) }}</span>
      </div>
    </section>

    <!-- Resposta do suporte -->
    <section v-if="chamado.supportResponse" class="detalhes-bloco detalhes-resposta">
      <span class="rotulo-pequeno">Resposta do suporte</span>
      <p class="detalhes-texto">{{ chamado.supportResponse }}</p>
    </section>

    <!-- Solucao aplicada -->
    <section v-if="chamado.resolution" class="detalhes-bloco detalhes-solucao">
      <span class="rotulo-pequeno">Solucao aplicada</span>
      <p class="detalhes-texto">{{ chamado.resolution }}</p>
    </section>
  </article>
</template>

<script setup>
import SeloStatusChamado from "./SeloStatusChamado.vue";
import { rotuloCategoria } from "../../constantes/categoriasChamado.js";
import { formatarDataHora } from "../../utils/formatarData.js";

defineProps({
  chamado: { type: Object, required: true },
  mostrarSolicitante: { type: Boolean, default: false },
});
</script>

<style scoped>
.detalhes {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-lg);
}

.detalhes-cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--espaco-md);
  flex-wrap: wrap;
}

.detalhes-codigo {
  font-size: var(--fonte-pequena);
}

.detalhes-selos {
  display: flex;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
}

.detalhes-bloco {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}

.detalhes-texto {
  color: var(--cor-texto-principal);
  line-height: 1.6;
  white-space: pre-line;
}

.detalhes-grade {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--espaco-md);
  padding: var(--espaco-md) 0;
  border-top: 1px solid var(--vidro-borda);
  border-bottom: 1px solid var(--vidro-borda);
}

.detalhes-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Blocos de resposta e solucao com leve destaque lateral. */
.detalhes-resposta,
.detalhes-solucao {
  padding: var(--espaco-md);
  border-radius: var(--raio-card);
  background: var(--vidro-fundo);
  border-left: 3px solid var(--cor-acento);
}

.detalhes-solucao {
  border-left-color: var(--cor-sucesso);
}

@media (max-width: 560px) {
  .detalhes-grade {
    grid-template-columns: 1fr;
  }
}
</style>
