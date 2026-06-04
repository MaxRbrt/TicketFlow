<!--
  ============================================================================
  TicketFlow - RankingLista.vue
  ----------------------------------------------------------------------------
  Lista de ranking (ex.: top solicitantes). Cada item mostra posicao, nome,
  uma barra proporcional ao maior valor e a contagem. Mostra EstadoVazio quando
  nao ha itens.

  Props: itens [{ id?, nome, quantidade }]
  ============================================================================
-->
<template>
  <ul v-if="itens.length" class="ranking">
    <li v-for="(item, i) in itens" :key="item.id || item.nome" class="rk">
      <span class="pos">{{ i + 1 }}</span>
      <div class="meio">
        <span class="nome">{{ item.nome }}</span>
        <span class="barra" :style="{ width: largura(item.quantidade) }"></span>
      </div>
      <span class="qtd">{{ item.quantidade }}</span>
    </li>
  </ul>
  <EstadoVazio
    v-else
    titulo="Sem dados"
    descricao="Nenhum chamado no periodo selecionado."
  />
</template>

<script setup>
import { computed } from "vue";
import EstadoVazio from "../comuns/EstadoVazio.vue";

const props = defineProps({
  itens: { type: Array, default: () => [] },
});

const maximo = computed(() =>
  props.itens.reduce((max, it) => Math.max(max, it.quantidade || 0), 0)
);

function largura(quantidade) {
  if (!maximo.value) return "0%";
  return `${Math.round((quantidade / maximo.value) * 100)}%`;
}
</script>

<style scoped>
.ranking {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}

.rk {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
}

.pos {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fonte-pequena);
  font-weight: var(--peso-bold);
  color: var(--cor-acento-claro, #9fe9ee);
  background: color-mix(in srgb, var(--cor-acento) 18%, transparent);
}

.meio {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nome {
  font-size: var(--fonte-corpo);
  color: var(--cor-texto-principal);
  overflow-wrap: anywhere;
}

.barra {
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--cor-acento), color-mix(in srgb, var(--cor-acento) 55%, #000));
  transition: width var(--transicao-media);
}

.qtd {
  flex-shrink: 0;
  font-weight: var(--peso-bold);
  color: var(--cor-acento);
}
</style>
