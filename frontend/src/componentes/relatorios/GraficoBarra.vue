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
  <div class="grafico" :style="{ height: alturaGrafico }">
    <Bar v-if="temDados" :data="dados" :options="opcoes" />
    <EstadoVazio
      v-else
      titulo="Sem dados"
      descricao="Nenhum chamado no periodo selecionado."
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Bar } from "vue-chartjs";
import { registrarChart, gradienteAcento } from "../../utils/chartTheme.js";
import EstadoVazio from "../comuns/EstadoVazio.vue";

registrarChart();

const props = defineProps({
  labels: { type: Array, default: () => [] },
  valores: { type: Array, default: () => [] },
});

const temDados = computed(() => (props.valores || []).some((v) => v > 0));
const ehMobile = ref(false);
let consultaMobile = null;

function atualizarMobile() {
  ehMobile.value = consultaMobile?.matches ?? false;
}

function rotuloMobile(_, indice) {
  const label = String(props.labels?.[indice] ?? "");
  return label.length > 18 ? `${label.slice(0, 17)}...` : label;
}

onMounted(() => {
  if (typeof window === "undefined") return;
  consultaMobile = window.matchMedia("(max-width: 760px)");
  atualizarMobile();
  if (consultaMobile.addEventListener) {
    consultaMobile.addEventListener("change", atualizarMobile);
  } else {
    consultaMobile.addListener(atualizarMobile);
  }
});

onBeforeUnmount(() => {
  if (!consultaMobile) return;
  if (consultaMobile.removeEventListener) {
    consultaMobile.removeEventListener("change", atualizarMobile);
  } else {
    consultaMobile.removeListener(atualizarMobile);
  }
});

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

const alturaGrafico = computed(() =>
  ehMobile.value ? `${Math.max(260, props.labels.length * 44)}px` : "240px"
);

const opcoes = computed(() => {
  const mobile = ehMobile.value;

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    resizeDelay: 120,
    indexAxis: mobile ? "y" : "x",
    plugins: { legend: { display: false } },
    scales: mobile
      ? {
          x: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: { precision: 0, maxTicksLimit: 5 },
          },
          y: {
            grid: { display: false },
            ticks: { autoSkip: false, callback: rotuloMobile },
          },
        }
      : {
          x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: false } },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: { precision: 0, maxTicksLimit: 5 },
          },
        },
  };
});
</script>

<style scoped>
.grafico {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* Canvas fora do fluxo: evita o loop de resize do Chart.js (estouro do card). */
.grafico :deep(canvas) {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
