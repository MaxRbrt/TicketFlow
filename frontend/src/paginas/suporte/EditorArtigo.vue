<!--
  ============================================================================
  TicketFlow - EditorArtigo.vue (perfil suporte)
  ----------------------------------------------------------------------------
  Cria um novo artigo da base de conhecimento e tambem serve para EDITAR um
  artigo existente quando a rota traz um :id. Usa o FormularioArtigo e delega o
  salvar ao useBaseConhecimento. So o suporte autor pode editar (garantido pelas
  regras do Firestore); por seguranca, a tela tambem bloqueia a edicao de
  artigos de outro autor antes mesmo de tentar salvar.
  ============================================================================
-->
<template>
  <LayoutApp :titulo="modoEdicao ? 'Editar artigo' : 'Novo artigo'" :mostrar-busca="false">
    <div class="editor-artigo">
      <BotaoBase variante="fantasma" @click="voltar">
        <template #icone><ArrowLeft :size="16" /></template>
        Voltar
      </BotaoBase>

      <section class="painel">
        <header class="cabecalho">
          <h2 class="titulo-secao">
            {{ modoEdicao ? "Editar artigo" : "Escrever novo artigo" }}
          </h2>
          <p class="texto-secundario">
            Os artigos ficam visiveis para todos os usuarios na Base de Conhecimento.
          </p>
        </header>

        <EstadoCarregamento v-if="carregandoArtigo" texto="Carregando artigo..." />

        <FormularioArtigo
          v-else
          :valores-iniciais="valoresIniciais"
          :enviando="enviando"
          :texto-botao="modoEdicao ? 'Salvar alteracoes' : 'Publicar artigo'"
          @salvar="salvar"
          @cancelar="voltar"
        />
      </section>
    </div>
  </LayoutApp>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import FormularioArtigo from "../../componentes/baseconhecimento/FormularioArtigo.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useBaseConhecimento } from "../../composables/useBaseConhecimento.js";
import { useNotificacao } from "../../composables/useNotificacao.js";
import { buscarArtigo } from "../../servicos/servicoBaseConhecimento.js";

const router = useRouter();
const route = useRoute();
const { usuario } = useAutenticacao();
const { criar, atualizar } = useBaseConhecimento();
const notificacao = useNotificacao();

// Modo edicao quando a rota traz um id.
const idArtigo = computed(() => route.params.id || null);
const modoEdicao = computed(() => !!idArtigo.value);

const valoresIniciais = ref({});
const carregandoArtigo = ref(false);
const enviando = ref(false);

/** No modo edicao, carrega o artigo e preenche o formulario. */
async function carregar() {
  if (!modoEdicao.value) return;

  carregandoArtigo.value = true;
  const artigo = await buscarArtigo(idArtigo.value);
  carregandoArtigo.value = false;

  if (!artigo) {
    notificacao.erro("Artigo nao encontrado.");
    voltar();
    return;
  }
  // So o autor pode editar (espelha a regra do Firestore; evita salvar e falhar).
  if (artigo.authorId !== usuario.value?.uid) {
    notificacao.erro("Voce so pode editar os artigos que publicou.");
    router.push(`/base-conhecimento/${idArtigo.value}`);
    return;
  }
  valoresIniciais.value = artigo;
}

/** Salva: cria um novo artigo ou atualiza o existente. */
async function salvar(dados) {
  enviando.value = true;

  let resultado;
  if (modoEdicao.value) {
    resultado = await atualizar(idArtigo.value, dados);
  } else {
    resultado = await criar(dados);
  }

  enviando.value = false;

  if (resultado.ok) {
    // Vai para a leitura do artigo (no create, o id retorna em resultado.resultado).
    const id = modoEdicao.value ? idArtigo.value : resultado.resultado;
    router.push(id ? `/base-conhecimento/${id}` : "/base-conhecimento");
  }
}

function voltar() {
  router.push("/base-conhecimento");
}

onMounted(carregar);
</script>

<style scoped>
.editor-artigo {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  max-width: 720px;
  width: 100%;
}

.cabecalho {
  margin-bottom: var(--espaco-lg);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
