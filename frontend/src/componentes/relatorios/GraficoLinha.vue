<!--
  ============================================================================
  TicketFlow - GraficoLinha.vue
  ----------------------------------------------------------------------------
  Grafico de linha/area (volume no tempo) via vue-chartjs, tematizado para o
  Twilight. Modo `mini` esconde eixos e pontos (sparkline para o Painel).

  Props: labels [string], valores [number], mini [boolean]
  ============================================================================
-->
<template>
  <div class="grafico" :class="{ mini }">
    <Line v-if="temDados" :data="dados" :options="opcoes" />
    <EstadoVazio
      v-else-if="!mini"
      titulo="Sem dados"
      descricao="Nenhum chamado no periodo selecionado."
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import { registrarChart, gradienteAcento } from "../../utils/chartTheme.js";
import EstadoVazio from "../comuns/EstadoVazio.vue";

registrarChart();

const props = defineProps({
  labels: { type: Array, default: () => [] },
  valores: { type: Array, default: () => [] },
  mini: { type: Boolean, default: false },
});

const temDados = computed(() => (props.valores || []).some((v) => v > 0));

const dados = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.valores,
      borderColor: "#45d3da",
      borderWidth: 2,
      fill: true,
      backgroundColor: (ctx) => gradienteAcento(ctx.chart.ctx, ctx.chart.chartArea),
      tension: 0.35,
      pointRadius: props.mini ? 0 : 3,
      pointHoverRadius: props.mini ? 0 : 5,
      pointBackgroundColor: "#45d3da",
    },
  ],
}));

const opcoes = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      display: !props.mini,
      grid: { display: false },
      ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
    },
    y: {
      display: !props.mini,
      beginAtZero: true,
      grid: { color: "rgba(255,255,255,0.06)" },
      ticks: { precision: 0, maxTicksLimit: 5 },
    },
  },
  elements: { line: { borderJoinStyle: "round" } },
}));
</script>

<style scoped>
.grafico {
  position: relative;
  width: 100%;
  height: 240px;
}

.grafico.mini {
  height: 56px;
}

/* Canvas fora do fluxo: impede que a largura do canvas realimente o container
   (loop de resize do Chart.js que estourava o card e deixava rastro de linhas). */
.grafico :deep(canvas) {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
