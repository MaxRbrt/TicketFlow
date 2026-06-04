<!--
  ============================================================================
  TicketFlow - DetalhesChamadoSolicitante.vue
  ----------------------------------------------------------------------------
  Detalhes de um chamado para o solicitante (secao 15.6). Mostra os dados em
  tempo real e, enquanto o chamado estiver ABERTO, permite editar, cancelar ou
  excluir (RF010/RF011). Exclusao pede confirmacao (RN009).
  ============================================================================
-->
<template>
  <LayoutApp titulo="Detalhes do Chamado" :mostrar-busca="false">
    <div class="detalhes-pagina">
      <BotaoBase variante="fantasma" @click="voltar">
        <template #icone><ArrowLeft :size="16" /></template>
        Voltar para meus chamados
      </BotaoBase>

      <EstadoCarregamento v-if="!chamadoAtual" texto="Carregando chamado..." pagina />

      <template v-else>
        <PainelDetalhesChamado :chamado="chamadoAtual" />

        <!-- Conversa com o suporte -->
        <ChatChamado :chamado-id="route.params.id" />

        <!-- Acoes (apenas enquanto aberto) -->
        <div v-if="estaAberto" class="acoes">
          <BotaoBase variante="secundario" @click="editar">
            <template #icone><Pencil :size="16" /></template>
            Editar
          </BotaoBase>
          <BotaoBase variante="secundario" @click="confirmarCancelar = true">
            <template #icone><Ban :size="16" /></template>
            Cancelar chamado
          </BotaoBase>
          <BotaoBase variante="perigo" @click="confirmarExcluir = true">
            <template #icone><Trash2 :size="16" /></template>
            Excluir
          </BotaoBase>
        </div>
        <p v-else class="texto-secundario aviso">
          Este chamado nao esta mais aberto e nao pode ser editado.
        </p>

        <!-- Linha do tempo do chamado -->
        <HistoricoChamado :chamado-id="route.params.id" />
      </template>
    </div>

    <!-- Confirmacao de exclusao -->
    <ModalBase v-model="confirmarExcluir" titulo="Excluir chamado">
      Tem certeza que deseja excluir este chamado? Esta acao nao pode ser desfeita.
      <template #acoes>
        <BotaoBase variante="secundario" @click="confirmarExcluir = false">Cancelar</BotaoBase>
        <BotaoBase variante="perigo" :carregando="processando" @click="excluirChamado">
          Excluir
        </BotaoBase>
      </template>
    </ModalBase>

    <!-- Confirmacao de cancelamento -->
    <ModalBase v-model="confirmarCancelar" titulo="Cancelar chamado">
      Deseja realmente cancelar este chamado? Ele deixara de ser atendido.
      <template #acoes>
        <BotaoBase variante="secundario" @click="confirmarCancelar = false">Voltar</BotaoBase>
        <BotaoBase variante="primario" :carregando="processando" @click="cancelarChamado">
          Confirmar
        </BotaoBase>
      </template>
    </ModalBase>
  </LayoutApp>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft, Pencil, Ban, Trash2 } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import PainelDetalhesChamado from "../../componentes/chamados/PainelDetalhesChamado.vue";
import ChatChamado from "../../componentes/chamados/ChatChamado.vue";
import HistoricoChamado from "../../componentes/chamados/HistoricoChamado.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import ModalBase from "../../componentes/comuns/ModalBase.vue";
import { useChamados } from "../../composables/useChamados.js";
import { useNotificacaoSolicitante } from "../../composables/useNotificacaoSolicitante.js";
import { STATUS } from "../../constantes/statusChamado.js";

const router = useRouter();
const route = useRoute();
const {
  chamadoAtual,
  escutarChamado,
  pararEscutaItem,
  excluir,
  cancelar,
} = useChamados();

const { marcarVisto } = useNotificacaoSolicitante();

const confirmarExcluir = ref(false);
const confirmarCancelar = ref(false);
const processando = ref(false);

const estaAberto = computed(() => chamadoAtual.value?.status === STATUS.ABERTO);

// Estando na tela do chamado, marca cada atualizacao como vista: limpa o badge
// e evita aviso de acoes do proprio solicitante (ex.: cancelar).
watch(chamadoAtual, (c) => c && marcarVisto(c), { immediate: true });

function voltar() {
  router.push("/solicitante/chamados");
}

function editar() {
  router.push(`/solicitante/chamados/${route.params.id}/editar`);
}

/** Exclui o chamado e volta para a lista. */
async function excluirChamado() {
  processando.value = true;
  const resultado = await excluir(route.params.id);
  processando.value = false;
  confirmarExcluir.value = false;
  if (resultado.ok) {
    voltar();
  }
}

/** Cancela o chamado (status -> cancelado); permanece na tela. */
async function cancelarChamado() {
  processando.value = true;
  await cancelar(route.params.id);
  processando.value = false;
  confirmarCancelar.value = false;
}

onMounted(() => {
  escutarChamado(route.params.id);
});

onUnmounted(() => {
  pararEscutaItem();
});
</script>

<style scoped>
.detalhes-pagina {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  max-width: 820px;
  width: 100%;
}

.acoes {
  display: flex;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
}

.aviso {
  padding: var(--espaco-md);
}
</style>
