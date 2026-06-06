<!--
  ============================================================================
  TicketFlow - PaginaBaseConhecimento.vue (compartilhada)
  ----------------------------------------------------------------------------
  Central de autoatendimento. Lista os artigos de ajuda publicados pelo suporte;
  qualquer usuario autenticado pode consultar e buscar. Apenas o suporte ve o
  botao "Novo artigo" (criar fica nas rotas /suporte/artigos/*). A busca textual
  vem da barra do LayoutApp; o filtro de categoria fica em FiltrosArtigo.
  ============================================================================
-->
<template>
  <LayoutApp titulo="Base de Conhecimento" v-model:busca="busca">
    <div class="topo">
      <div>
        <span class="pill-info"><span class="ponto"></span> Central de ajuda</span>
        <h2 class="titulo-hero saudacao">Base de Conhecimento</h2>
        <p class="texto-secundario">
          Encontre respostas prontas antes de abrir um chamado.
        </p>
      </div>
      <BotaoBase v-if="ehSuporte" variante="primario" @click="irNovo">
        <template #icone><Plus :size="18" /></template>
        Novo artigo
      </BotaoBase>
    </div>

    <FiltrosArtigo v-model="categoria" />

    <EstadoCarregamento v-if="carregando" texto="Carregando artigos..." />

    <EstadoVazio
      v-else-if="!artigos.length"
      titulo="Nenhum artigo ainda"
      :descricao="
        ehSuporte
          ? 'Publique o primeiro artigo de ajuda para os solicitantes.'
          : 'O suporte ainda nao publicou artigos de ajuda.'
      "
    >
      <template v-if="ehSuporte" #icone><BookOpen :size="32" /></template>
      <template v-if="ehSuporte" #acao>
        <BotaoBase variante="primario" @click="irNovo">
          <template #icone><Plus :size="18" /></template>
          Escrever artigo
        </BotaoBase>
      </template>
    </EstadoVazio>

    <EstadoVazio
      v-else-if="!artigosFiltrados.length"
      titulo="Nada encontrado"
      descricao="Nenhum artigo corresponde a busca ou ao filtro aplicado."
    />

    <div v-else class="grade-artigos">
      <CardArtigo
        v-for="artigo in artigosFiltrados"
        :key="artigo.id"
        :artigo="artigo"
        @abrir="abrirArtigo"
      />
    </div>
  </LayoutApp>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus, BookOpen } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import CardArtigo from "../../componentes/baseconhecimento/CardArtigo.vue";
import FiltrosArtigo from "../../componentes/baseconhecimento/FiltrosArtigo.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import EstadoVazio from "../../componentes/comuns/EstadoVazio.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useBaseConhecimento } from "../../composables/useBaseConhecimento.js";

const router = useRouter();
const { ehSuporte } = useAutenticacao();
const { artigos, carregando, carregarLista } = useBaseConhecimento();

const busca = ref("");
const categoria = ref("");

// Aplica o filtro de categoria e a busca textual (titulo + corpo).
const artigosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase();
  const cat = categoria.value;
  return artigos.value.filter((a) => {
    if (cat && a.category !== cat) return false;
    if (termo) {
      const alvo = `${a.title} ${a.body}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });
});

function irNovo() {
  router.push("/suporte/artigos/novo");
}

function abrirArtigo(id) {
  router.push(`/base-conhecimento/${id}`);
}

onMounted(carregarLista);
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

.grade-artigos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: var(--espaco-md);
}
</style>
