<!--
  ============================================================================
  TicketFlow - DetalhesChamadoSuporte.vue
  ----------------------------------------------------------------------------
  Tela de atendimento do suporte (secao 15.9 / RF014-RF020). Mostra todos os
  dados do chamado e permite ao suporte:
    - assumir o chamado (vira responsavel, status -> em andamento);
    - atualizar o status;
    - responder ao solicitante;
    - registrar a solucao aplicada;
    - finalizar (resolver) exigindo resposta E solucao;
    - cancelar ou excluir (com confirmacao, RN009).
  Dados em tempo real (escutarChamado).
  ============================================================================
-->
<template>
  <LayoutApp titulo="Atendimento" :mostrar-busca="false">
    <div class="atendimento">
      <BotaoBase variante="fantasma" @click="voltar">
        <template #icone><ArrowLeft :size="16" /></template>
        Voltar para os chamados
      </BotaoBase>

      <EstadoCarregamento v-if="!chamadoAtual" texto="Carregando chamado..." pagina />

      <template v-else>
        <!-- Dados completos do chamado (read-only, com solicitante) -->
        <PainelDetalhesChamado :chamado="chamadoAtual" mostrar-solicitante />

        <!-- Conversa com o solicitante -->
        <ChatChamado :chamado-id="id" @estado="aoEstadoChat" />

        <!-- Painel de atendimento -->
        <section class="painel bloco-atendimento">
          <header class="bloco-cabecalho">
            <h3 class="titulo-secao">Atendimento</h3>
            <BotaoBase
              v-if="!chamadoAtual.assignedToId"
              variante="primario"
              :carregando="processando"
              @click="assumirChamado"
            >
              <template #icone><Hand :size="16" /></template>
              Assumir chamado
            </BotaoBase>
            <span v-else class="texto-secundario responsavel">
              Responsavel: {{ chamadoAtual.assignedToName }}
            </span>
          </header>

          <template v-if="podeAtender">
            <!-- Status -->
            <div class="linha-status">
              <SeletorBase
                v-model="statusSelecionado"
                label="Status do chamado"
                :opcoes="LISTA_STATUS"
              />
              <BotaoBase
                variante="secundario"
                :carregando="processando"
                :desabilitado="statusSelecionado === chamadoAtual.status"
                @click="aplicarStatus"
              >
                Atualizar status
              </BotaoBase>
            </div>

            <!-- Solucao aplicada -->
            <div class="linha-campo">
              <AreaTextoBase
                v-model="solucao"
                label="Solucao aplicada"
                placeholder="Descreva a solucao tecnica aplicada..."
                :linhas="3"
              />
              <BotaoBase
                variante="secundario"
                :carregando="processando"
                @click="salvarSolucao"
              >
                <template #icone><Wrench :size="16" /></template>
                Salvar solucao
              </BotaoBase>
            </div>

            <!-- Acoes principais -->
            <div class="acoes-principais">
              <BotaoBase
                variante="primario"
                :carregando="processando"
                :desabilitado="jaResolvido"
                @click="finalizarAtendimento"
              >
                <template #icone><CircleCheck :size="16" /></template>
                Finalizar como resolvido
              </BotaoBase>
              <BotaoBase
                variante="secundario"
                :carregando="processando"
                @click="confirmarCancelar = true"
              >
                <template #icone><Ban :size="16" /></template>
                Cancelar chamado
              </BotaoBase>
              <BotaoBase variante="perigo" @click="confirmarExcluir = true">
                <template #icone><Trash2 :size="16" /></template>
                Excluir
              </BotaoBase>
            </div>
          </template>

          <p v-else class="texto-secundario aviso">
            Assuma o chamado para iniciar o atendimento.
          </p>
        </section>

        <!-- Linha do tempo do chamado -->
        <HistoricoChamado :chamado-id="id" />
      </template>
    </div>

    <!-- Confirmacao de cancelamento -->
    <ModalBase v-model="confirmarCancelar" titulo="Cancelar chamado">
      Deseja realmente cancelar este chamado? O solicitante sera informado.
      <template #acoes>
        <BotaoBase variante="secundario" @click="confirmarCancelar = false">Voltar</BotaoBase>
        <BotaoBase variante="primario" :carregando="processando" @click="cancelarChamado">
          Confirmar
        </BotaoBase>
      </template>
    </ModalBase>

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
  </LayoutApp>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft, Hand, Wrench, CircleCheck, Ban, Trash2 } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import PainelDetalhesChamado from "../../componentes/chamados/PainelDetalhesChamado.vue";
import ChatChamado from "../../componentes/chamados/ChatChamado.vue";
import HistoricoChamado from "../../componentes/chamados/HistoricoChamado.vue";
import SeletorBase from "../../componentes/comuns/SeletorBase.vue";
import AreaTextoBase from "../../componentes/comuns/AreaTextoBase.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import ModalBase from "../../componentes/comuns/ModalBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useChamados } from "../../composables/useChamados.js";
import { useNotificacaoSuporte } from "../../composables/useNotificacaoSuporte.js";
import { LISTA_STATUS, STATUS } from "../../constantes/statusChamado.js";

const router = useRouter();
const route = useRoute();
const { usuario, nome } = useAutenticacao();
const {
  chamadoAtual,
  escutarChamado,
  pararEscutaItem,
  assumir,
  mudarStatus,
  registrarSolucao,
  finalizar,
  excluir,
} = useChamados();

const { marcarLido } = useNotificacaoSuporte();

// Campos editaveis locais (sincronizados a partir do chamado em tempo real).
const statusSelecionado = ref(STATUS.ABERTO);
const solucao = ref("");

// Estado do chat: o suporte ja respondeu ao solicitante? (libera finalizar)
const respondeuSuporte = ref(false);

const processando = ref(false);
const confirmarCancelar = ref(false);
const confirmarExcluir = ref(false);

function aoEstadoChat({ respondeuSuporte: respondeu }) {
  respondeuSuporte.value = respondeu;
}

// So atende apos assumir (ter responsavel).
const podeAtender = computed(() => !!chamadoAtual.value?.assignedToId);
const jaResolvido = computed(() => chamadoAtual.value?.status === STATUS.RESOLVIDO);

// Preenche os campos quando o chamado chega/atualiza (sem sobrescrever digitacao
// em andamento: so popula a partir do valor salvo no banco).
watch(
  chamadoAtual,
  (c) => {
    if (!c) return;
    statusSelecionado.value = c.status;
    solucao.value = c.resolution || "";
  },
  { immediate: true }
);

const id = computed(() => route.params.id);

/** Suporte assume o chamado (vira responsavel, status -> em andamento). */
async function assumirChamado() {
  processando.value = true;
  await assumir(id.value, { uid: usuario.value.uid, nome: nome.value });
  processando.value = false;
}

/** Aplica o status escolhido no seletor. */
async function aplicarStatus() {
  processando.value = true;
  await mudarStatus(id.value, statusSelecionado.value);
  processando.value = false;
}

/** Salva apenas a solucao aplicada. */
async function salvarSolucao() {
  processando.value = true;
  await registrarSolucao(id.value, solucao.value);
  processando.value = false;
}

/** Finaliza o atendimento (exige resposta no chat E solucao - RF019). */
async function finalizarAtendimento() {
  processando.value = true;
  await finalizar(id.value, {
    solucao: solucao.value,
    respondeuSuporte: respondeuSuporte.value,
  });
  processando.value = false;
}

/** Cancela o chamado. */
async function cancelarChamado() {
  processando.value = true;
  await mudarStatus(id.value, STATUS.CANCELADO);
  processando.value = false;
  confirmarCancelar.value = false;
}

/** Exclui o chamado e volta para a lista. */
async function excluirChamado() {
  processando.value = true;
  const resultado = await excluir(id.value);
  processando.value = false;
  confirmarExcluir.value = false;
  if (resultado.ok) voltar();
}

function voltar() {
  router.push("/suporte/chamados");
}

onMounted(() => {
  escutarChamado(id.value);
  // Abrir o chamado (por qualquer caminho, nao so pelo sino) ja conta como
  // lido: some do badge/painel de notificacoes do suporte.
  marcarLido(id.value);
});

onUnmounted(() => {
  pararEscutaItem();
});
</script>

<style scoped>
.atendimento {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  max-width: 820px;
  width: 100%;
}

.bloco-atendimento {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-lg);
}

.bloco-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
  flex-wrap: wrap;
}

.responsavel {
  font-weight: var(--peso-semibold);
}

/* Campo + botao de salvar lado a lado (botao desce no mobile). */
.linha-status,
.linha-campo {
  display: flex;
  gap: var(--espaco-sm);
  align-items: flex-end;
}

.linha-status > :first-child,
.linha-campo > :first-child {
  flex: 1;
}

.acoes-principais {
  display: flex;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
  padding-top: var(--espaco-sm);
  border-top: 1px solid var(--vidro-borda);
}

.aviso {
  padding: var(--espaco-sm) 0;
}

@media (max-width: 640px) {
  .linha-status,
  .linha-campo {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
