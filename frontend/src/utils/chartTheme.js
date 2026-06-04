// ============================================================================
// TicketFlow - Tema do Chart.js (Twilight)
// ----------------------------------------------------------------------------
// Registra os controllers/elementos do Chart.js usados (tree-shaking) e ajusta
// os defaults globais para combinar com o tema escuro Twilight: acento ciano,
// fonte Inter, grid sutil e tooltip escuro. Cores sao lidas das variaveis CSS
// em tempo de execucao (com fallback fixo) para acompanhar o tema.
// ============================================================================

import {
  Chart as ChartJS,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
} from "chart.js";

// Fallbacks (hex do tema Twilight) caso a variavel CSS nao esteja disponivel.
const FALLBACK = {
  acento: "#45d3da",
  textoSecundario: "#9fb6ba",
  fundo2: "#1d3f48",
  borda: "rgba(255,255,255,0.09)",
  grid: "rgba(255,255,255,0.06)",
};

/**
 * Le uma variavel CSS do :root, com fallback. Seguro fora do browser.
 * @param {string} nome - Nome da variavel (ex.: "--cor-acento").
 * @param {string} reserva - Valor de reserva.
 * @returns {string}
 */
export function lerCor(nome, reserva) {
  if (typeof document === "undefined") return reserva;
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nome);
  return valor && valor.trim() ? valor.trim() : reserva;
}

export const corAcento = () => lerCor("--cor-acento", FALLBACK.acento);
export const corTextoSecundario = () => lerCor("--cor-texto-secundario", FALLBACK.textoSecundario);
export const corGrid = () => FALLBACK.grid;

/**
 * Cria um gradiente vertical de acento (forte no topo, transparente embaixo)
 * para o preenchimento de graficos de linha/area. Recebe o contexto do canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{top:number, bottom:number}} area - chartArea do Chart.js.
 */
export function gradienteAcento(ctx, area) {
  if (!ctx || !area) return "rgba(69,211,218,0.2)";
  const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
  const acento = corAcento();
  g.addColorStop(0, "rgba(69,211,218,0.35)");
  g.addColorStop(1, "rgba(69,211,218,0.02)");
  void acento; // acento usado via fallback fixo no gradiente
  return g;
}

// Garante registro/defaults uma unica vez.
let aplicado = false;

/**
 * Registra os componentes do Chart.js e aplica os defaults do tema. Idempotente.
 * Chamar uma vez (ex.: no main.js ou no 1o componente de grafico montado).
 */
export function registrarChart() {
  if (aplicado) return;
  aplicado = true;

  ChartJS.register(
    LineController,
    BarController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Filler
  );

  ChartJS.defaults.color = corTextoSecundario();
  ChartJS.defaults.font.family =
    "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ChartJS.defaults.font.size = 12;

  // Tooltip escuro, alinhado ao vidro do tema.
  Object.assign(ChartJS.defaults.plugins.tooltip, {
    backgroundColor: "rgba(12,28,33,0.95)",
    borderColor: "rgba(69,211,218,0.35)",
    borderWidth: 1,
    titleColor: "#e8f3f4",
    bodyColor: "#cfe3e6",
    padding: 10,
    cornerRadius: 10,
    displayColors: false,
  });
}
