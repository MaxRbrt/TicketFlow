<!--
  ============================================================================
  TicketFlow - ChamadosUrgentes.vue
  ----------------------------------------------------------------------------
  Atalho do suporte para os chamados de prioridade URGENTE ainda nao
  finalizados (RN008 / filtro recomendado RF013). Reusa a escuta de todos os
  chamados e aplica o filtro de urgencia localmente. Permite ainda buscar por
  texto dentro dos urgentes.
  ============================================================================
-->
<template>
  <LayoutApp titulo="Chamados Urgentes" v-model:busca="busca">
    <div class="topo">
      <div>
        <span class="pill-info pill-urgente">
          <span class="ponto"></span> Prioridade maxima
        </span>
        <p class="texto-secundario">{{ urgentesFiltrados.length }} chamado(s) urgente(s) em aberto</p>
      </div>
      <BotaoBase variante="fantasma" @click="irTodos">
        <template #icone><ListChecks :size="18" /></template>
        Ver todos
      </BotaoBase>
    </div>

    <EstadoCarregamento v-if="carregando" texto="Carregando chamados..." />

    <EstadoVazio
      v-else-if="!urgentesFiltrados.length"
      titulo="Nenhum urgente em aberto"
      descricao="Nao ha chamados urgentes aguardando atendimento no momento."
    >
      <template #icone><ShieldCheck :size="28" /></template>
    </EstadoVazio>

    <TabelaChamados
      v-else
      :chamados="urgentesFiltrados"
      mostrar-solicitante
      @abrir="abrirDetalhes"
    />
  </LayoutApp>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ListChecks, ShieldCheck } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import TabelaChamados from "../../componentes/chamados/TabelaChamados.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import EstadoVazio from "../../componentes/comuns/EstadoVazio.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useChamados } from "../../composables/useChamados.js";
import { STATUS } from "../../constantes/statusChamado.js";
import { PRIORIDADE } from "../../constantes/prioridadesChamado.js";

const router = useRouter();
const { chamados, carregando, escutarTodos, pararEscutaLista } = useChamados();

const busca = ref("");

// Urgentes ainda nao finalizados, opcionalmente refinados pela busca textual.
const urgentesFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase();
  return chamados.value.filter((c) => {
    if (c.priority !== PRIORIDADE.URGENTE) return false;
    if (c.status === STATUS.RESOLVIDO || c.status === STATUS.CANCELADO) return false;
    if (termo) {
      const alvo = `${c.title} ${c.description} ${c.requesterName}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });
});

function irTodos() {
  router.push("/suporte/chamados");
}

function abrirDetalhes(id) {
  router.push(`/suporte/chamados/${id}`);
}

onMounted(() => {
  escutarTodos();
});

onUnmounted(() => {
  pararEscutaLista();
});
</script>

<style scoped>
.topo {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--espaco-md);
  flex-wrap: wrap;
}

/* Variante avermelhada do pill-info para reforcar a urgencia. */
.pill-urgente {
  color: var(--cor-status-cancelado);
  margin-bottom: var(--espaco-sm);
}

.pill-urgente .ponto {
  background: var(--cor-status-cancelado);
}
</style>
