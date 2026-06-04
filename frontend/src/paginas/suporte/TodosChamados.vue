<!--
  ============================================================================
  TicketFlow - TodosChamados.vue
  ----------------------------------------------------------------------------
  Lista de TODOS os chamados do sistema (RF012/RF013). O suporte pode filtrar
  por status, prioridade e categoria, alem de buscar por texto (titulo, descricao
  ou solicitante). A coluna de solicitante e exibida. Dados em tempo real
  (escutarTodos), permitidos pelas regras do Firestore para o perfil de suporte.
  ============================================================================
-->
<template>
  <LayoutApp titulo="Todos os Chamados" v-model:busca="busca">
    <div class="topo">
      <p class="texto-secundario">{{ chamadosFiltrados.length }} chamado(s)</p>
      <BotaoBase variante="secundario" @click="irUrgentes">
        <template #icone><Flame :size="18" /></template>
        Urgentes
      </BotaoBase>
    </div>

    <FiltrosChamados v-model="filtros" />

    <EstadoCarregamento v-if="carregando" texto="Carregando chamados..." />

    <EstadoVazio
      v-else-if="!chamados.length"
      titulo="Nenhum chamado no sistema"
      descricao="Assim que um solicitante abrir um chamado, ele aparece aqui."
    />

    <EstadoVazio
      v-else-if="!chamadosFiltrados.length"
      titulo="Nada encontrado"
      descricao="Nenhum chamado corresponde aos filtros aplicados."
    />

    <TabelaChamados
      v-else
      :chamados="chamadosFiltrados"
      mostrar-solicitante
      @abrir="abrirDetalhes"
    />
  </LayoutApp>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Flame } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import FiltrosChamados from "../../componentes/chamados/FiltrosChamados.vue";
import TabelaChamados from "../../componentes/chamados/TabelaChamados.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import EstadoVazio from "../../componentes/comuns/EstadoVazio.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useChamados } from "../../composables/useChamados.js";
import { useAutenticacao } from "../../composables/useAutenticacao.js";

const router = useRouter();
const { usuario } = useAutenticacao();
const { chamados, carregando, escutarTodos, pararEscutaLista } = useChamados();

const busca = ref("");
const filtros = ref({ status: "", prioridade: "", categoria: "" });

// Aplica filtros (status/prioridade/categoria) e busca textual (inclui solicitante).
const chamadosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase();
  const filtroAtual = filtros.value;
  return chamados.value.filter((c) => {
    if (filtroAtual.status && c.status !== filtroAtual.status) return false;
    if (filtroAtual.prioridade && c.priority !== filtroAtual.prioridade) return false;
    if (filtroAtual.categoria && c.category !== filtroAtual.categoria) return false;
    if (termo) {
      const alvo = `${c.title} ${c.description} ${c.requesterName}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });
});

function irUrgentes() {
  router.push("/suporte/chamados/urgentes");
}

function abrirDetalhes(id) {
  router.push(`/suporte/chamados/${id}`);
}

onMounted(() => {
  if (usuario.value) {
    escutarTodos(usuario.value.uid);
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
