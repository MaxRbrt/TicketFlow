<!--
  ============================================================================
  TicketFlow - PainelSuporte.vue
  ----------------------------------------------------------------------------
  Dashboard do suporte (secao 15.7). Mostra indicadores gerais de TODOS os
  chamados do sistema, um destaque para os urgentes em aberto (RN008) e a lista
  dos mais recentes. Layout empilhado e responsivo (sem grids frageis com
  tabela). Dados em tempo real (escutarTodos), permitidos pelas regras do
  Firestore para o perfil de suporte.
  ============================================================================
-->
<template>
  <LayoutApp titulo="Central de Suporte" :mostrar-busca="false">
    <!-- Cabecalho com saudacao + acao -->
    <div class="topo-painel">
      <div>
        <span class="pill-info"><span class="ponto"></span> Em tempo real</span>
        <h2 class="titulo-hero saudacao">Ola, {{ primeiroNome }}</h2>
        <p class="texto-secundario">Visao geral de todos os chamados do sistema.</p>
      </div>
      <BotaoBase variante="secundario" @click="irTodos">
        <template #icone><ListChecks :size="18" /></template>
        Ver todos os chamados
      </BotaoBase>
    </div>

    <!-- Indicadores -->
    <ResumoPainel :cards="indicadores" />

    <!-- Destaque: urgentes em aberto (so aparece quando ha algum) -->
    <section v-if="listaUrgentes.length" class="cartao-destaque destaque-urgentes">
      <header class="bloco-cabecalho">
        <h3 class="titulo-secao">Urgentes em aberto</h3>
        <RouterLink to="/suporte/chamados/urgentes" class="ver-todos">Ver todos</RouterLink>
      </header>
      <div class="urgentes-grade">
        <article
          v-for="c in listaUrgentes"
          :key="c.id"
          class="urgente-card elevavel"
          @click="abrirDetalhes(c.id)"
        >
          <div class="urgente-selos">
            <SeloStatusChamado :valor="c.priority" tipo="prioridade" />
            <SeloStatusChamado :valor="c.status" tipo="status" />
          </div>
          <strong class="titulo-card urgente-titulo">{{ c.title }}</strong>
          <span class="texto-secundario">{{ c.requesterName }}</span>
        </article>
      </div>
    </section>

    <!-- Chamados recentes (largura total) -->
    <section class="bloco-recentes">
      <div class="bloco-cabecalho">
        <h3 class="titulo-secao">Chamados recentes</h3>
        <RouterLink to="/suporte/chamados" class="ver-todos">Ver todos</RouterLink>
      </div>

      <EstadoCarregamento v-if="carregando" texto="Carregando chamados..." />

      <EstadoVazio
        v-else-if="!chamados.length"
        titulo="Nenhum chamado no sistema"
        descricao="Assim que um solicitante abrir um chamado, ele aparece aqui."
      />

      <TabelaChamados
        v-else
        :chamados="recentes"
        mostrar-solicitante
        @abrir="abrirDetalhes"
      />
    </section>
  </LayoutApp>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ListChecks } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import ResumoPainel from "../../componentes/painel/ResumoPainel.vue";
import TabelaChamados from "../../componentes/chamados/TabelaChamados.vue";
import SeloStatusChamado from "../../componentes/chamados/SeloStatusChamado.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import EstadoVazio from "../../componentes/comuns/EstadoVazio.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useChamados } from "../../composables/useChamados.js";
import { STATUS } from "../../constantes/statusChamado.js";
import { PRIORIDADE } from "../../constantes/prioridadesChamado.js";

const router = useRouter();
const { nome } = useAutenticacao();
const {
  chamados,
  carregando,
  total,
  abertos,
  emAndamento,
  urgentes,
  escutarTodos,
  pararEscutaLista,
} = useChamados();

const primeiroNome = computed(() => (nome.value ? nome.value.split(" ")[0] : "suporte"));

// Cards de indicadores (secao 15.7): total, abertos, em andamento, urgentes.
const indicadores = computed(() => [
  { rotulo: "Total", numero: total.value, sub: "chamados no sistema" },
  { rotulo: "Abertos", numero: abertos.value, sub: "aguardando atendimento" },
  { rotulo: "Em andamento", numero: emAndamento.value, sub: "sendo atendidos" },
  { rotulo: "Urgentes", numero: urgentes.value, sub: "exigem prioridade" },
]);

// Mostra apenas os 5 mais recentes no painel.
const recentes = computed(() => chamados.value.slice(0, 5));

// Urgentes ainda nao finalizados, para o destaque (RN008).
const listaUrgentes = computed(() =>
  chamados.value
    .filter(
      (c) =>
        c.priority === PRIORIDADE.URGENTE &&
        c.status !== STATUS.RESOLVIDO &&
        c.status !== STATUS.CANCELADO
    )
    .slice(0, 6)
);

function irTodos() {
  router.push("/suporte/chamados");
}

function abrirDetalhes(id) {
  router.push(`/suporte/chamados/${id}`);
}

// Inicia/encerra a escuta em tempo real de todos os chamados.
onMounted(() => {
  escutarTodos();
});

onUnmounted(() => {
  pararEscutaLista();
});
</script>

<style scoped>
.topo-painel {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--espaco-md);
  flex-wrap: wrap;
}

.saudacao {
  margin-top: var(--espaco-sm);
}

.bloco-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
  margin-bottom: var(--espaco-md);
}

.ver-todos {
  font-size: var(--fonte-corpo);
  font-weight: var(--peso-semibold);
}

/* ----- Destaque de urgentes (largura total, grade responsiva) ------------- */
.destaque-urgentes {
  /* .cartao-destaque ja traz vidro + glow ciano + padding. */
}

.urgentes-grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--espaco-md);
}

.urgente-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--espaco-md);
  border-radius: var(--raio-card);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
  cursor: pointer;
  min-width: 0;
}

.urgente-selos {
  display: flex;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
}

.urgente-titulo {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bloco-recentes {
  display: flex;
  flex-direction: column;
}

/* O cabecalho ja tem margem; remove a margem extra dentro do bloco recentes. */
.bloco-recentes .bloco-cabecalho {
  margin-bottom: var(--espaco-md);
}
</style>
