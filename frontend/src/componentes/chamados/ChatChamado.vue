<!--
  ============================================================================
  TicketFlow - ChatChamado.vue
  ----------------------------------------------------------------------------
  Conversa em tempo real entre solicitante e suporte sobre um chamado. Usa a
  subcolecao `tickets/{id}/mensagens` via useChat. As mensagens do usuario logado
  aparecem alinhadas a direita; as do outro lado, a esquerda. Enter envia;
  Shift+Enter quebra linha.

  Props:
    - chamadoId: ID do chamado.
    - podeEnviar: habilita a caixa de envio (default true).
  Emite:
    - estado: { respondeuSuporte } sempre que as mensagens mudam (o pai usa para
      liberar a finalizacao do atendimento).
  ============================================================================
-->
<template>
  <section class="painel chat">
    <header class="chat-cabecalho">
      <h3 class="titulo-secao">
        <MessageSquare :size="18" /> Conversa
      </h3>
      <span class="texto-secundario">{{ mensagens.length }} mensagem(ns)</span>
    </header>

    <!-- Lista de mensagens -->
    <div ref="listaEl" class="chat-lista">
      <EstadoCarregamento v-if="carregando" texto="Carregando conversa..." />

      <p v-else-if="!mensagens.length" class="chat-vazio texto-secundario">
        Nenhuma mensagem ainda. Inicie a conversa abaixo.
      </p>

      <template v-else>
        <article
          v-for="m in mensagens"
          :key="m.id"
          class="chat-balao"
          :class="ehMinha(m) ? 'chat-balao-eu' : 'chat-balao-outro'"
        >
          <div class="chat-meta">
            <strong class="chat-autor">{{ m.autorNome || "Usuario" }}</strong>
            <span class="chat-papel">{{ rotuloPapel(m.autorPapel) }}</span>
            <span class="chat-hora">{{ formatarDataHora(m.criadoEm) }}</span>
          </div>
          <p class="chat-texto">{{ m.texto }}</p>
        </article>
      </template>
    </div>

    <!-- Caixa de envio -->
    <form v-if="podeEnviar" class="chat-envio" @submit.prevent="enviarMensagem">
      <textarea
        v-model="texto"
        class="chat-input"
        rows="2"
        :maxlength="limite"
        placeholder="Escreva uma mensagem... (Enter envia, Shift+Enter quebra linha)"
        :disabled="enviando"
        @keydown.enter.exact.prevent="enviarMensagem"
      ></textarea>
      <BotaoBase
        tipo="submit"
        variante="primario"
        :carregando="enviando"
        :desabilitado="!texto.trim()"
      >
        <template #icone><Send :size="16" /></template>
        Enviar
      </BotaoBase>
    </form>
  </section>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { MessageSquare, Send } from "@lucide/vue";
import BotaoBase from "../comuns/BotaoBase.vue";
import EstadoCarregamento from "../comuns/EstadoCarregamento.vue";
import { useChat } from "../../composables/useChat.js";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { formatarDataHora } from "../../utils/formatarData.js";
import { PERFIL } from "../../constantes/perfisUsuario.js";

const props = defineProps({
  chamadoId: { type: String, required: true },
  podeEnviar: { type: Boolean, default: true },
});

const emit = defineEmits(["estado"]);

const { usuario } = useAutenticacao();
const { mensagens, carregando, enviando, respondeuSuporte, limite, escutar, parar, enviar } =
  useChat();

const texto = ref("");
const listaEl = ref(null);

function ehMinha(m) {
  return m.autorId === usuario.value?.uid;
}

function rotuloPapel(papel) {
  return papel === PERFIL.SUPORTE ? "Suporte" : "Solicitante";
}

/** Rola a lista para o final (mensagem mais recente). */
async function rolarParaFim() {
  await nextTick();
  if (listaEl.value) {
    listaEl.value.scrollTop = listaEl.value.scrollHeight;
  }
}

async function enviarMensagem() {
  if (!texto.value.trim()) return;
  const resultado = await enviar(props.chamadoId, texto.value);
  if (resultado.ok) {
    texto.value = "";
    rolarParaFim();
  }
}

// Liga/religa a escuta quando o chamado muda.
watch(
  () => props.chamadoId,
  (id) => {
    if (id) escutar(id);
  },
  { immediate: true }
);

// A cada atualizacao das mensagens: rola para o fim e informa o pai se o suporte
// ja respondeu (libera a finalizacao do atendimento).
watch(mensagens, () => {
  rolarParaFim();
  emit("estado", { respondeuSuporte: respondeuSuporte.value });
});

onMounted(rolarParaFim);
onUnmounted(parar);
</script>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.chat-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
}

.titulo-secao {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* ----- Lista de mensagens (rolavel) --------------------------------------- */
.chat-lista {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.chat-vazio {
  padding: var(--espaco-lg) 0;
  text-align: center;
}

/* ----- Baloes ------------------------------------------------------------- */
.chat-balao {
  max-width: 78%;
  padding: var(--espaco-sm) var(--espaco-md);
  border-radius: var(--raio-card);
  border: 1px solid var(--vidro-borda);
  background: var(--vidro-fundo);
}

/* Minhas mensagens: alinhadas a direita, com acento. */
.chat-balao-eu {
  align-self: flex-end;
  background: color-mix(in srgb, var(--cor-acento) 16%, var(--vidro-fundo));
  border-color: color-mix(in srgb, var(--cor-acento) 32%, transparent);
}

/* Mensagens do outro lado: alinhadas a esquerda. */
.chat-balao-outro {
  align-self: flex-start;
}

.chat-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.chat-autor {
  font-size: var(--fonte-pequena);
  font-weight: var(--peso-semibold);
}

.chat-papel {
  font-size: var(--fonte-pequena);
  color: var(--cor-acento-claro);
}

.chat-hora {
  font-size: var(--fonte-pequena);
  color: var(--cor-texto-secundario);
  margin-left: auto;
}

.chat-texto {
  color: var(--cor-texto-principal);
  line-height: 1.5;
  white-space: pre-line;
  word-break: break-word;
}

/* ----- Caixa de envio ----------------------------------------------------- */
.chat-envio {
  display: flex;
  gap: var(--espaco-sm);
  align-items: flex-end;
  padding-top: var(--espaco-sm);
  border-top: 1px solid var(--vidro-borda);
}

.chat-input {
  flex: 1;
  padding: var(--espaco-sm) var(--espaco-md);
  border-radius: var(--raio-input);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
  color: var(--cor-texto-principal);
  resize: vertical;
  min-height: 48px;
  line-height: 1.5;
  transition: border-color var(--transicao-rapida), box-shadow var(--transicao-rapida);
}

.chat-input:focus {
  outline: none;
  border-color: var(--cor-acento);
  box-shadow: var(--sombra-foco);
}

.chat-input::placeholder {
  color: var(--cor-texto-secundario);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .chat-envio {
    flex-direction: column;
    align-items: stretch;
  }
  .chat-balao {
    max-width: 90%;
  }
}
</style>
