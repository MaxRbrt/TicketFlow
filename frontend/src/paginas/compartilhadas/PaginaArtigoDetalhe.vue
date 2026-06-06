<!--
  ============================================================================
  TicketFlow - PaginaArtigoDetalhe.vue (compartilhada)
  ----------------------------------------------------------------------------
  Leitura completa de um artigo da base de conhecimento. Qualquer usuario
  autenticado le. O suporte AUTOR do artigo ve as acoes de editar e excluir
  (excluir pede confirmacao, RN009). O corpo e exibido como texto puro com
  quebras de linha preservadas (sem HTML, evitando XSS).
  ============================================================================
-->
<template>
  <LayoutApp titulo="Artigo" :mostrar-busca="false">
    <div class="artigo-pagina">
      <BotaoBase variante="fantasma" @click="voltar">
        <template #icone><ArrowLeft :size="16" /></template>
        Voltar para a base de conhecimento
      </BotaoBase>

      <EstadoCarregamento v-if="carregando" texto="Carregando artigo..." pagina />

      <EstadoVazio
        v-else-if="!artigoAtual"
        titulo="Artigo nao encontrado"
        descricao="Ele pode ter sido removido. Volte e escolha outro artigo."
      />

      <template v-else>
        <article class="artigo painel">
          <header class="artigo-cabecalho">
            <span class="badge badge-suave" :style="{ '--cor-badge': 'var(--cor-acento)' }">
              <span class="ponto"></span>{{ rotuloCategoria(artigoAtual.category) }}
            </span>
            <h1 class="titulo-secao artigo-titulo">{{ artigoAtual.title }}</h1>
            <div class="artigo-meta texto-secundario">
              <span class="artigo-autor"><UserRound :size="14" /> {{ artigoAtual.authorName }}</span>
              <span aria-hidden="true">·</span>
              <span>Atualizado em {{ formatarDataHora(artigoAtual.updatedAt) }}</span>
            </div>
          </header>

          <div class="artigo-corpo">{{ artigoAtual.body }}</div>
        </article>

        <!-- Acoes do suporte autor -->
        <div v-if="podeGerenciar" class="acoes">
          <BotaoBase variante="secundario" @click="editar">
            <template #icone><Pencil :size="16" /></template>
            Editar
          </BotaoBase>
          <BotaoBase variante="perigo" @click="confirmarExcluir = true">
            <template #icone><Trash2 :size="16" /></template>
            Excluir
          </BotaoBase>
        </div>
      </template>
    </div>

    <!-- Confirmacao de exclusao -->
    <ModalBase v-model="confirmarExcluir" titulo="Excluir artigo">
      Tem certeza que deseja excluir este artigo? Esta acao nao pode ser desfeita.
      <template #acoes>
        <BotaoBase variante="secundario" @click="confirmarExcluir = false">Cancelar</BotaoBase>
        <BotaoBase variante="perigo" :carregando="processando" @click="excluirArtigo">
          Excluir
        </BotaoBase>
      </template>
    </ModalBase>
  </LayoutApp>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft, Pencil, Trash2, UserRound } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import EstadoVazio from "../../componentes/comuns/EstadoVazio.vue";
import ModalBase from "../../componentes/comuns/ModalBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useBaseConhecimento } from "../../composables/useBaseConhecimento.js";
import { rotuloCategoria } from "../../constantes/categoriasChamado.js";
import { formatarDataHora } from "../../utils/formatarData.js";

const router = useRouter();
const route = useRoute();
const { usuario, ehSuporte } = useAutenticacao();
const { artigoAtual, carregando, carregarArtigo, excluir } = useBaseConhecimento();

const confirmarExcluir = ref(false);
const processando = ref(false);

// Suporte autor pode gerenciar (mesmo escopo das regras do Firestore).
const podeGerenciar = computed(
  () =>
    ehSuporte.value &&
    !!artigoAtual.value &&
    artigoAtual.value.authorId === usuario.value?.uid
);

function voltar() {
  router.push("/base-conhecimento");
}

function editar() {
  router.push(`/suporte/artigos/${route.params.id}/editar`);
}

/** Exclui o artigo e volta para a lista. */
async function excluirArtigo() {
  processando.value = true;
  const resultado = await excluir(route.params.id);
  processando.value = false;
  confirmarExcluir.value = false;
  if (resultado.ok) {
    voltar();
  }
}

onMounted(() => {
  carregarArtigo(route.params.id);
});
</script>

<style scoped>
.artigo-pagina {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  max-width: 820px;
  width: 100%;
}

.artigo {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-lg);
}

.artigo-cabecalho {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
}

.artigo-titulo {
  font-family: var(--fonte-display);
}

.artigo-meta {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
  font-size: var(--fonte-pequena);
}

.artigo-autor {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.artigo-corpo {
  color: var(--cor-texto-principal);
  line-height: 1.7;
  /* Texto puro do banco: preserva paragrafos sem interpretar HTML (anti-XSS). */
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding-top: var(--espaco-md);
  border-top: 1px solid var(--vidro-borda);
}

.acoes {
  display: flex;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
}
</style>
