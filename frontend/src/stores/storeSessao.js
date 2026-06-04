// ============================================================================
// TicketFlow - Store de sessao de atendimento (Pinia)
// ----------------------------------------------------------------------------
// Guarda o vinculo ativo entre solicitante e suporte:
//   - SOLICITANTE: a sessao em que ele entrou (codigo + suporte vinculado).
//   - SUPORTE: a propria sessao gerada (codigo que ele divulga).
//
// Persiste em sessionStorage POR ABA e POR UID, coerente com a persistencia de
// autenticacao do projeto (browserSessionPersistence): cada aba tem a sua
// sessao, sobrevive ao F5, e nao vaza entre usuarios/abas diferentes.
// ============================================================================

import { defineStore } from "pinia";
import { ref, computed } from "vue";

function chaveStorage(uid) {
  return `tf-sessao-${uid}`;
}

export const useStoreSessao = defineStore("sessao", () => {
  // ----- Estado ------------------------------------------------------------
  const codigo = ref(null); // codigo da sessao vinculada
  const suporteId = ref(null); // UID do suporte dono da sessao
  const suporteNome = ref(null); // nome do suporte (exibicao)
  const uidDono = ref(null); // de qual usuario logado este estado foi carregado

  // ----- Getters -----------------------------------------------------------
  const ativa = computed(() => !!codigo.value && !!suporteId.value);

  // ----- Acoes -------------------------------------------------------------

  /**
   * Carrega o vinculo salvo no sessionStorage para o usuario informado. E
   * idempotente: se ja estiver carregado para o mesmo uid, nao relê. Se o uid
   * mudou (outro usuario na aba), limpa o estado antes.
   * @param {string} uid - UID do usuario logado.
   */
  function carregarDoStorage(uid) {
    if (!uid) {
      limparMemoria();
      return;
    }
    if (uidDono.value === uid && codigo.value) return;

    uidDono.value = uid;
    try {
      const salvo = JSON.parse(sessionStorage.getItem(chaveStorage(uid)) || "null");
      if (salvo && salvo.codigo && salvo.suporteId) {
        codigo.value = salvo.codigo;
        suporteId.value = salvo.suporteId;
        suporteNome.value = salvo.suporteNome || null;
        return;
      }
    } catch {
      // sessionStorage indisponivel ou corrompido: segue sem vinculo.
    }
    codigo.value = null;
    suporteId.value = null;
    suporteNome.value = null;
  }

  /**
   * Define o vinculo ativo e persiste para o usuario informado.
   * @param {object} dados - { codigo, suporteId, suporteNome }.
   * @param {string} uid - UID do usuario logado (dono do vinculo).
   */
  function definir({ codigo: cod, suporteId: sid, suporteNome: snome }, uid) {
    codigo.value = cod;
    suporteId.value = sid;
    suporteNome.value = snome || null;
    uidDono.value = uid;
    try {
      sessionStorage.setItem(
        chaveStorage(uid),
        JSON.stringify({ codigo: cod, suporteId: sid, suporteNome: snome || null })
      );
    } catch {
      // Sem persistencia: o vinculo vale apenas para esta aba enquanto aberta.
    }
  }

  /** Limpa apenas o estado em memoria (sem mexer no storage). */
  function limparMemoria() {
    codigo.value = null;
    suporteId.value = null;
    suporteNome.value = null;
    uidDono.value = null;
  }

  /**
   * Remove o vinculo do usuario (memoria + storage). Usado ao deslogar ou ao
   * encerrar/trocar de sessao.
   * @param {string} [uid] - UID cujo vinculo sera apagado do storage.
   */
  function limpar(uid) {
    const alvo = uid || uidDono.value;
    if (alvo) {
      try {
        sessionStorage.removeItem(chaveStorage(alvo));
      } catch {
        // ignora indisponibilidade do storage
      }
    }
    limparMemoria();
  }

  return {
    // estado
    codigo,
    suporteId,
    suporteNome,
    // getters
    ativa,
    // acoes
    carregarDoStorage,
    definir,
    limpar,
  };
});
