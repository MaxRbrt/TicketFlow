<!--
  ============================================================================
  TicketFlow - PainelSolicitante.vue
  ----------------------------------------------------------------------------
  Dashboard do solicitante (secao 15.3). Mostra indicadores dos proprios
  chamados, os mais recentes e um atalho para abrir um novo chamado. Os dados
  vem em tempo real (escuta do Firestore), filtrados pelo UID do usuario.
  ============================================================================
-->
<template>
  <LayoutApp titulo="Meu Painel" :mostrar-busca="false">
    <!-- Cabecalho com saudacao + acao -->
    <div class="topo-painel">
      <div>
        <span class="pill-info"><span class="ponto"></span> Em tempo real</span>
        <h2 class="titulo-hero saudacao">Ola, {{ primeiroNome }}</h2>
        <p class="texto-secundario">Acompanhe seus chamados e abra novas solicitacoes.</p>
      </div>
      <BotaoBase variante="primario" @click="irNovo">
        <template #icone><CirclePlus :size="18" /></template>
        Novo Chamado
      </BotaoBase>
    </div>

    <!-- Indicadores -->
    <ResumoPainel :cards="indicadores" />

    <!-- Chamados recentes -->
    <section class="bloco-recentes">
      <div class="bloco-cabecalho">
        <h3 class="titulo-secao">Chamados recentes</h3>
        <RouterLink to="/solicitante/chamados" class="ver-todos">Ver todos</RouterLink>
      </div>

      <EstadoCarregamento v-if="carregando" texto="Carregando seus chamados..." />

      <EstadoVazio
        v-else-if="!chamados.length"
        titulo="Nenhum chamado ainda"
        descricao="Quando voce abrir um chamado, ele aparece aqui."
      >
        <template #acao>
          <BotaoBase variante="primario" @click="irNovo">
            <template #icone><CirclePlus :size="18" /></template>
            Abrir primeiro chamado
          </BotaoBase>
        </template>
      </EstadoVazio>

      <TabelaChamados
        v-else
        :chamados="recentes"
        @abrir="abrirDetalhes"
      />
    </section>
  </LayoutApp>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { CirclePlus } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import ResumoPainel from "../../componentes/painel/ResumoPainel.vue";
import TabelaChamados from "../../componentes/chamados/TabelaChamados.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import EstadoVazio from "../../componentes/comuns/EstadoVazio.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useChamados } from "../../composables/useChamados.js";

const router = useRouter();
const { usuario, nome } = useAutenticacao();
const {
  chamados,
  carregando,
  abertos,
  emAndamento,
  aguardando,
  resolvidos,
  escutarDoSolicitante,
  pararEscutaLista,
} = useChamados();

const primeiroNome = computed(() => (nome.value ? nome.value.split(" ")[0] : "voce"));

// Cards de indicadores (numeros reativos vindos da store).
const indicadores = computed(() => [
  { rotulo: "Abertos", numero: abertos.value, sub: "aguardando atendimento" },
  { rotulo: "Em andamento", numero: emAndamento.value, sub: "em atendimento" },
  { rotulo: "Aguardando", numero: aguardando.value, sub: "aguardando voce" },
  { rotulo: "Resolvidos", numero: resolvidos.value, sub: "finalizados" },
]);

// Mostra apenas os 5 mais recentes no painel.
const recentes = computed(() => chamados.value.slice(0, 5));

function irNovo() {
  router.push("/solicitante/chamados/novo");
}

function abrirDetalhes(id) {
  router.push(`/solicitante/chamados/${id}`);
}

// Inicia/encerra a escuta em tempo real dos chamados do usuario.
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

.bloco-recentes {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.bloco-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
}

.ver-todos {
  font-size: var(--fonte-corpo);
  font-weight: var(--peso-semibold);
}
</style>
