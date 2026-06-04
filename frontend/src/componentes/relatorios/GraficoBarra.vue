<!--
  ============================================================================
  TicketFlow - GraficoBarra.vue
  ----------------------------------------------------------------------------
  Grafico de barras (ex.: chamados por setor/local) via vue-chartjs, tematizado
  para o Twilight. Mostra EstadoVazio quando nao ha dados.

  Props: labels [string], valores [number]
  ============================================================================
-->
<template>
  <div class="grafico">
    <Bar v-if="temDados" :data="dados" :options="opcoes" />
    <EstadoVazio
      v-else
      titulo="Sem dados"
      descricao="Nenhum chamado no periodo selecionado."
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import { registrarChart, gradienteAcento } from "../../utils/chartTheme.js";
import EstadoVazio from "../comuns/EstadoVazio.vue";

registrarChart();

const props = defineProps({
  labels: { type: Array, default: () => [] },
  valores: { type: Array, default: () => [] },
});

const temDados = computed(() => (props.valores || []).some((v) => v > 0));

const dados = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.valores,
      backgroundColor: (ctx) => gradienteAcento(ctx.chart.ctx, ctx.chart.chartArea),
      borderColor: "#45d3da",
      borderWidth: 1,
      borderRadius: 6,
      maxBarThickness: 48,
    },
  ],
}));

const opcoes = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: false } },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(255,255,255,0.06)" },
      ticks: { precision: 0, maxTicksLimit: 5 },
    },
  },
}));
</script>

<style scoped>
.grafico {
  position: relative;
  width: 100%;
  height: 240px;
}

/* Canvas fora do fluxo: evita o loop de resize do Chart.js (estouro do card). */
.grafico :deep(canvas) {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
