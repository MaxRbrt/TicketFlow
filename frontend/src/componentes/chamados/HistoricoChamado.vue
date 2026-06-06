<!--
  ============================================================================
  TicketFlow - HistoricoChamado.vue
  ----------------------------------------------------------------------------
  Linha do tempo (trilha de auditoria) de um chamado: abertura, atendimento
  assumido e mudancas de status, em ordem cronologica. Le em tempo real a
  subcolecao `tickets/{id}/historico`. Compartilhado pelas telas de detalhes do
  solicitante e do suporte.

  Prop: chamadoId
  ============================================================================
-->
<template>
  <section class="painel historico">
    <header class="hist-cabecalho">
      <h3 class="titulo-secao"><History :size="18" /> Linha do tempo</h3>
    </header>

    <EstadoCarregamento v-if="carregando" texto="Carregando historico..." />

    <p v-else-if="!eventos.length" class="hist-vazio texto-secundario">
      Sem eventos registrados ainda.
    </p>

    <ol v-else class="hist-lista">
      <li v-for="ev in eventos" :key="ev.id" class="hist-item">
        <span class="hist-marca" :class="`hist-marca-${corDe(ev)}`">
          <component :is="iconeDe(ev)" :size="15" />
        </span>
        <div class="hist-conteudo">
          <strong class="hist-titulo">{{ tituloDe(ev) }}</strong>
          <span class="hist-meta texto-secundario">
            {{ ev.autorNome || "Sistema" }} · {{ formatarDataHora(ev.criadoEm) }}
          </span>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import { History, CirclePlus, Hand, CircleCheck, Ban, RefreshCw } from "@lucide/vue";
import EstadoCarregamento from "../comuns/EstadoCarregamento.vue";
import { observarHistorico } from "../../servicos/servicoChamado.js";
import { formatarDataHora } from "../../utils/formatarData.js";
import { STATUS, rotuloStatus } from "../../constantes/statusChamado.js";

const props = defineProps({
  chamadoId: { type: String, required: true },
});

const eventos = ref([]);
const carregando = ref(true);
let cancelar = null;

function escutar(id) {
  parar();
  carregando.value = true;
  cancelar = observarHistorico(
    id,
    (lista) => {
      eventos.value = lista;
      carregando.value = false;
    },
    (e) => {
      console.error("Falha ao observar historico:", e);
      carregando.value = false;
    }
  );
}

function parar() {
  if (cancelar) {
    cancelar();
    cancelar = null;
  }
  eventos.value = [];
}

/** Texto do evento conforme a acao e a transicao de status. */
function tituloDe(ev) {
  if (ev.acao === "criado") return "Chamado aberto";
  if (ev.acao === "assumido") return "Atendimento assumido";
  if (ev.acao === "status_alterado") {
    if (ev.statusNovo === STATUS.RESOLVIDO) return "Chamado resolvido";
    if (ev.statusNovo === STATUS.CANCELADO) return "Chamado cancelado";
    const de = ev.statusAnterior ? `${rotuloStatus(ev.statusAnterior)} → ` : "";
    return `Status: ${de}${rotuloStatus(ev.statusNovo)}`;
  }
  return ev.acao || "Evento";
}

/** Cor do marcador (token de status reaproveitado). */
function corDe(ev) {
  if (ev.acao === "criado") return "aberto";
  if (ev.statusNovo === STATUS.RESOLVIDO) return "resolvido";
  if (ev.statusNovo === STATUS.CANCELADO) return "cancelado";
  return "acento";
}

function iconeDe(ev) {
  if (ev.acao === "criado") return CirclePlus;
  if (ev.acao === "assumido") return Hand;
  if (ev.statusNovo === STATUS.RESOLVIDO) return CircleCheck;
  if (ev.statusNovo === STATUS.CANCELADO) return Ban;
  return RefreshCw;
}

watch(
  () => props.chamadoId,
  (id) => {
    if (id) escutar(id);
  },
  { immediate: true }
);

onUnmounted(parar);
</script>

<style scoped>
.historico {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.hist-cabecalho .titulo-secao {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.hist-vazio {
  padding: var(--espaco-sm) 0;
}

/* ----- Linha do tempo ----------------------------------------------------- */
.hist-lista {
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  padding: 0;
}

.hist-item {
  display: flex;
  gap: var(--espaco-md);
  position: relative;
  padding-bottom: var(--espaco-md);
}

/* Linha vertical conectando os marcadores (some no ultimo). */
.hist-item:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 13px;
  top: 28px;
  bottom: 0;
  width: 2px;
  background: var(--vidro-borda);
}

.hist-marca {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
  color: var(--cor-texto-sobre-acento);
  background: var(--cor-acento);
}

.hist-marca-aberto {
  background: var(--cor-status-aberto);
}
.hist-marca-resolvido {
  background: var(--cor-status-resolvido);
}
.hist-marca-cancelado {
  background: var(--cor-status-cancelado);
}

.hist-conteudo {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  padding-top: 3px;
  overflow-wrap: anywhere;
}

.hist-titulo {
  font-weight: var(--peso-semibold);
  overflow-wrap: anywhere;
}

.hist-meta {
  font-size: var(--fonte-pequena);
  overflow-wrap: anywhere;
}
</style>
