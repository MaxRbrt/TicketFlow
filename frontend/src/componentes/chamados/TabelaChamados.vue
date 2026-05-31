<!--
  ============================================================================
  TicketFlow - TabelaChamados.vue
  ----------------------------------------------------------------------------
  Lista de chamados que se adapta ao tamanho da tela (RNF001):
    - Telas largas: tabela dentro de um painel de vidro.
    - Telas estreitas: cartoes empilhados (CardChamado).

  A alternancia e 100% AUTOCONTIDA neste componente (media query scoped, com
  valores de `display` explicitos). NAO usa os helpers globais .apenas-* para
  evitar o bug de `display: initial` (que vira `inline` e quebra a <table>).

  Props:  chamados, mostrarSolicitante
  Evento: abrir (id)
  ============================================================================
-->
<template>
  <div class="tabela-chamados">
    <!-- ===== Telas largas: tabela ===== -->
    <div class="tc-painel">
      <table class="tc-tabela">
        <thead>
          <tr>
            <th class="tc-th-titulo">Titulo</th>
            <th v-if="mostrarSolicitante">Solicitante</th>
            <th>Categoria</th>
            <th>Prioridade</th>
            <th>Status</th>
            <th>Aberto</th>
            <th class="tc-th-acao"><span class="sr-only">Acoes</span></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="chamado in chamados"
            :key="chamado.id"
            class="tc-linha"
            @click="$emit('abrir', chamado.id)"
          >
            <td class="tc-titulo">{{ chamado.title }}</td>
            <td v-if="mostrarSolicitante" class="tc-secundario">
              {{ chamado.requesterName }}
            </td>
            <td class="tc-secundario">{{ rotuloCategoria(chamado.category) }}</td>
            <td><SeloStatusChamado :valor="chamado.priority" tipo="prioridade" /></td>
            <td><SeloStatusChamado :valor="chamado.status" tipo="status" /></td>
            <td class="tc-data">{{ formatarData(chamado.createdAt) }}</td>
            <td class="tc-td-acao">
              <ChevronRight :size="18" class="tc-chevron" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== Telas estreitas: cards ===== -->
    <div class="tc-cards">
      <CardChamado
        v-for="chamado in chamados"
        :key="chamado.id"
        :chamado="chamado"
        :mostrar-solicitante="mostrarSolicitante"
        @abrir="$emit('abrir', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ChevronRight } from "@lucide/vue";
import SeloStatusChamado from "./SeloStatusChamado.vue";
import CardChamado from "./CardChamado.vue";
import { rotuloCategoria } from "../../constantes/categoriasChamado.js";
import { formatarData } from "../../utils/formatarData.js";

defineProps({
  chamados: { type: Array, default: () => [] },
  mostrarSolicitante: { type: Boolean, default: false },
});

defineEmits(["abrir"]);
</script>

<style scoped>
.tabela-chamados {
  width: 100%;
}

/* ----- Painel de vidro que envolve a tabela ------------------------------- */
/* O raio de borda fica no WRAPPER (confiavel), nao na <table> (border-radius
   em tabela com bordas e instavel entre navegadores). overflow:hidden faz as
   linhas respeitarem os cantos arredondados. */
.tc-painel {
  width: 100%;
  background: var(--vidro-fundo);
  backdrop-filter: blur(var(--vidro-blur));
  -webkit-backdrop-filter: blur(var(--vidro-blur));
  border: 1px solid var(--vidro-borda);
  border-radius: var(--raio-painel);
  box-shadow: var(--sombra-suave), var(--sombra-interna);
  overflow: hidden;
}

.tc-tabela {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

/* Cabecalho */
.tc-tabela thead th {
  text-align: left;
  padding: var(--espaco-md);
  font-size: var(--fonte-pequena);
  font-weight: var(--peso-semibold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--cor-texto-secundario);
  background: var(--vidro-fundo-forte);
  border-bottom: 1px solid var(--vidro-borda);
  white-space: nowrap;
}

/* Corpo */
.tc-tabela tbody td {
  padding: var(--espaco-md);
  border-bottom: 1px solid var(--vidro-borda);
  color: var(--cor-texto-principal);
  vertical-align: middle;
}

.tc-tabela tbody tr:last-child td {
  border-bottom: none;
}

.tc-linha {
  cursor: pointer;
  transition: background var(--transicao-rapida);
}

.tc-linha:hover {
  background: var(--vidro-fundo);
}

.tc-titulo {
  font-weight: var(--peso-semibold);
  max-width: 340px;
}

.tc-secundario {
  color: var(--cor-texto-secundario);
}

.tc-data {
  white-space: nowrap;
  color: var(--cor-texto-secundario);
  font-size: var(--fonte-pequena);
}

/* Coluna de acao (chevron) */
.tc-th-acao,
.tc-td-acao {
  width: 52px;
  text-align: right;
}

.tc-chevron {
  color: var(--cor-texto-secundario);
  transition: color var(--transicao-rapida), transform var(--transicao-rapida);
}

.tc-linha:hover .tc-chevron {
  color: var(--cor-acento);
  transform: translateX(2px);
}

/* Acessibilidade: rotulo so para leitores de tela. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ----- Alternancia tabela (largo) / cards (estreito) ---------------------- */
/* Cards escondidos por padrao; em telas estreitas a tabela some e os cards
   aparecem. Valores de display EXPLICITOS = sem ambiguidade. */
.tc-cards {
  display: none;
}

@media (max-width: 1100px) {
  .tc-painel {
    display: none;
  }
  .tc-cards {
    display: flex;
    flex-direction: column;
    gap: var(--espaco-md);
  }
}
</style>
