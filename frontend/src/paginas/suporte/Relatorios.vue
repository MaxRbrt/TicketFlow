<!--
  ============================================================================
  TicketFlow - Relatorios.vue (perfil suporte)
  ----------------------------------------------------------------------------
  Aba de relatorios do suporte. Metricas derivadas dos chamados das proprias
  sessoes (escopo por sessionSupportId), em tempo real, sem leitura/indice novo:
  consome a lista ja transmitida pela escuta unica (useRelatorios -> singleton).

  Estrutura (validada no brainstorming): periodo -> KPIs -> volume no tempo ->
  por setor + top solicitantes.
  ============================================================================
-->
<template>
  <LayoutApp titulo="Relatorios" :mostrar-busca="false">
    <div class="topo">
      <div>
        <span class="pill-info"><span class="ponto"></span> Em tempo real</span>
        <h2 class="titulo-hero saudacao">Relatorios</h2>
        <p class="texto-secundario">Visao analitica dos chamados das suas sessoes.</p>
      </div>
      <SeletorPeriodo v-model="periodo" />
    </div>

    <EstadoVazio
      v-if="!temDados"
      titulo="Sem dados no periodo"
      descricao="Nenhum chamado encontrado para o periodo selecionado. Troque o filtro acima."
    />

    <template v-else>
      <!-- KPIs -->
      <div class="kpis">
        <CardPainel
          rotulo="Tempo medio de resolucao"
          :numero="tempoMedioTexto"
          :sub="tempoMedioSub"
        >
          <template #icone><Clock :size="18" /></template>
        </CardPainel>
        <CardPainel
          rotulo="Taxa de resolucao"
          :numero="`${taxa.percentual}%`"
          :sub="`${taxa.backlog} em aberto no backlog`"
        >
          <template #icone><CircleCheck :size="18" /></template>
        </CardPainel>
      </div>

      <!-- Volume no tempo (largura total) -->
      <section class="painel bloco">
        <header class="bloco-cab"><h3 class="titulo-card">Volume de chamados no tempo</h3></header>
        <GraficoLinha :labels="volume.labels" :valores="volume.data" />
      </section>

      <!-- Setor + Top solicitantes -->
      <div class="grade-inferior">
        <section class="painel bloco">
          <header class="bloco-cab"><h3 class="titulo-card">Chamados por setor / local</h3></header>
          <GraficoBarra :labels="porSetor.labels" :valores="porSetor.data" />
        </section>
        <section class="painel bloco">
          <header class="bloco-cab"><h3 class="titulo-card">Top solicitantes</h3></header>
          <RankingLista :itens="topSolicitantes" />
        </section>
      </div>
    </template>
  </LayoutApp>
</template>

<script setup>
import { computed } from "vue";
import { Clock, CircleCheck } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import CardPainel from "../../componentes/painel/CardPainel.vue";
import EstadoVazio from "../../componentes/comuns/EstadoVazio.vue";
import SeletorPeriodo from "../../componentes/relatorios/SeletorPeriodo.vue";
import GraficoLinha from "../../componentes/relatorios/GraficoLinha.vue";
import GraficoBarra from "../../componentes/relatorios/GraficoBarra.vue";
import RankingLista from "../../componentes/relatorios/RankingLista.vue";
import { useRelatorios } from "../../composables/useRelatorios.js";
import { formatarDuracao } from "../../utils/relatorios.js";

const { periodo, temDados, volume, porSetor, tempoMedio, taxa, topSolicitantes } =
  useRelatorios("mes");

const tempoMedioTexto = computed(() => formatarDuracao(tempoMedio.value.ms));
const tempoMedioSub = computed(() => {
  const q = tempoMedio.value.quantidade;
  return q ? `sobre ${q} chamado${q > 1 ? "s" : ""} resolvido${q > 1 ? "s" : ""}` : "nenhum resolvido ainda";
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

.saudacao {
  margin-top: var(--espaco-sm);
}

.kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--espaco-md);
}

.bloco {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  min-width: 0;
}

.bloco-cab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
}

.grade-inferior {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: var(--espaco-md);
}

@media (max-width: 760px) {
  .kpis,
  .grade-inferior {
    grid-template-columns: 1fr;
  }
}
</style>
