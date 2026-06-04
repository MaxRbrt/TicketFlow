// ============================================================================
// TicketFlow - useChat
// ----------------------------------------------------------------------------
// Conversa (chat) de um chamado entre solicitante e suporte. Escuta em tempo
// real a subcolecao `tickets/{id}/mensagens` e expoe o envio de mensagens com o
// autor preenchido a partir do usuario logado (papel incluso).
//
// Diferente das centrais de notificacao (singletons globais), aqui o estado e
// por instancia: cada tela de detalhes tem o seu chat.
// ============================================================================

import { ref, computed } from "vue";
import { enviarMensagem, observarMensagens } from "../servicos/servicoChamado.js";
import { useStoreAutenticacao } from "../stores/storeAutenticacao.js";
import { useNotificacao } from "./useNotificacao.js";
import { PERFIL } from "../constantes/perfisUsuario.js";

const LIMITE_TEXTO = 2000;

export function useChat() {
  const auth = useStoreAutenticacao();
  const notificacao = useNotificacao();

  const mensagens = ref([]);
  const carregando = ref(true);
  const enviando = ref(false);
  let cancelar = null;

  // Quantas mensagens o SUPORTE ja enviou (usado pela regra de finalizacao:
  // so resolve apos pelo menos uma resposta ao solicitante).
  const respondeuSuporte = computed(() =>
    mensagens.value.some((m) => m.autorPapel === PERFIL.SUPORTE)
  );

  /**
   * Liga a escuta em tempo real das mensagens do chamado.
   * @param {string} chamadoId - ID do chamado.
   */
  function escutar(chamadoId) {
    parar();
    carregando.value = true;
    cancelar = observarMensagens(
      chamadoId,
      (lista) => {
        mensagens.value = lista;
        carregando.value = false;
      },
      (e) => {
        console.error("Falha ao observar mensagens:", e);
        carregando.value = false;
      }
    );
  }

  /** Desliga a escuta e limpa o estado. */
  function parar() {
    if (cancelar) {
      cancelar();
      cancelar = null;
    }
    mensagens.value = [];
  }

  /**
   * Envia uma mensagem no chat, com o autor (e papel) do usuario logado.
   * @param {string} chamadoId - ID do chamado.
   * @param {string} texto - Conteudo da mensagem.
   * @returns {Promise<{ok: boolean}>}
   */
  async function enviar(chamadoId, texto) {
    const conteudo = (texto || "").trim();
    if (!conteudo) return { ok: false };
    if (conteudo.length > LIMITE_TEXTO) {
      notificacao.erro(`A mensagem excede ${LIMITE_TEXTO} caracteres.`);
      return { ok: false };
    }

    enviando.value = true;
    try {
      await enviarMensagem(chamadoId, {
        autorId: auth.usuario.uid,
        autorNome: auth.nome,
        autorPapel: auth.papel,
        texto: conteudo,
      });
      return { ok: true };
    } catch (e) {
      console.error("Falha ao enviar mensagem:", e?.code || e);
      notificacao.erro("Nao foi possivel enviar a mensagem.");
      return { ok: false };
    } finally {
      enviando.value = false;
    }
  }

  return {
    mensagens,
    carregando,
    enviando,
    respondeuSuporte,
    limite: LIMITE_TEXTO,
    escutar,
    parar,
    enviar,
  };
}
