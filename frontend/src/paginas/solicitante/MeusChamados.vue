<!--
  ============================================================================
  TicketFlow - MeusChamados.vue
  ----------------------------------------------------------------------------
  Lista dos chamados do solicitante (RF007/RF008). Permite filtrar por status,
  prioridade e categoria, alem de buscar por texto. Os dados chegam em tempo
  real (somente os proprios chamados, garantido pelas regras do Firestore).
  ============================================================================
-->
<template>
  <LayoutApp titulo="Meus Chamados" v-model:busca="busca">
    <div class="topo">
      <p class="texto-secundario">{{ chamadosFiltrados.length }} chamado(s)</p>
      <BotaoBase variante="primario" @click="irNovo">
        <template #icone><CirclePlus :size="18" /></template>
        Novo Chamado
      </BotaoBase>
    </div>

    <FiltrosChamados v-model="filtros" />

    <EstadoCarregamento v-if="carregando" texto="Carregando seus chamados..." />

    <EstadoVazio
      v-else-if="!chamados.length"
      titulo="Nenhum chamado ainda"
      descricao="Abra seu primeiro chamado para comecar."
    >
      <template #acao>
        <BotaoBase variante="primario" @click="irNovo">
          <template #icone><CirclePlus :size="18" /></template>
          Abrir chamado
        </BotaoBase>
      </template>
    </EstadoVazio>

    <EstadoVazio
      v-else-if="!chamadosFiltrados.length"
      titulo="Nada encontrado"
      descricao="Nenhum chamado corresponde aos filtros aplicados."
    />

    <TabelaChamados v-else :chamados="chamadosFiltrados" @abrir="abrirDetalhes" />
  </LayoutApp>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { CirclePlus } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import FiltrosChamados from "../../componentes/chamados/FiltrosChamados.vue";
import TabelaChamados from "../../componentes/chamados/TabelaChamados.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import EstadoVazio from "../../componentes/comuns/EstadoVazio.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useChamados } from "../../composables/useChamados.js";

const router = useRouter();
const { usuario } = useAutenticacao();
const { chamados, carregando, escutarDoSolicitante, pararEscutaLista } = useChamados();

const busca = ref("");
const filtros = ref({ status: "", prioridade: "", categoria: "" });

// Aplica filtros (status/prioridade/categoria) e busca textual.
const chamadosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase();
  const filtroAtual = filtros.value;
  return chamados.value.filter((c) => {
    if (filtroAtual.status && c.status !== filtroAtual.status) return false;
    if (filtroAtual.prioridade && c.priority !== filtroAtual.prioridade) return false;
    if (filtroAtual.categoria && c.category !== filtroAtual.categoria) return false;
    if (termo) {
      const alvo = `${c.title} ${c.description}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });
});

function irNovo() {
  router.push("/solicitante/chamados/novo");
}

function abrirDetalhes(id) {
  router.push(`/solicitante/chamados/${id}`);
}

onMounted(() => {
  if (usuario.value) {
    escutarDoSolicitante(usuario.value.uid);
  }
});

onUnmounted(() => {
  pararEscutaLista();
});
</script>

<style scoped>
.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
  flex-wrap: wrap;
}
</style>
