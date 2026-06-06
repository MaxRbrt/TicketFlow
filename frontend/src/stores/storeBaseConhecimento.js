// ============================================================================
// TicketFlow - Store da Base de Conhecimento (Pinia)
// ----------------------------------------------------------------------------
// Mantem a lista de artigos e o artigo selecionado para leitura. Diferente da
// store de chamados, a base de conhecimento NAO usa escuta em tempo real: os
// artigos mudam pouco, entao a lista e buscada sob demanda (getDocs no mount) e
// recarregada apos cada mutacao. Isso evita listeners orfaos e leituras extras.
// Toda a comunicacao com o Firestore passa pelo servico.
// ============================================================================

import { defineStore } from "pinia";
import { ref } from "vue";
import {
  listarArtigos,
  buscarArtigo,
  criarArtigo,
  atualizarArtigo,
  excluirArtigo,
} from "../servicos/servicoBaseConhecimento.js";

export const useStoreBaseConhecimento = defineStore("baseConhecimento", () => {
  // ----- Estado ------------------------------------------------------------
  const artigos = ref([]); // lista completa (ordenada do mais recente)
  const artigoAtual = ref(null); // artigo selecionado (leitura)
  const carregando = ref(false);
  const erro = ref(null);

  // ----- Leitura -----------------------------------------------------------

  /** Carrega a lista completa de artigos. */
  async function carregarLista() {
    carregando.value = true;
    erro.value = null;
    try {
      artigos.value = await listarArtigos();
    } catch (e) {
      erro.value = e;
    } finally {
      carregando.value = false;
    }
  }

  /**
   * Carrega um artigo especifico (tela de leitura). Limpa o anterior antes para
   * evitar exibir o artigo errado durante a troca.
   * @param {string} id - ID do artigo.
   */
  async function carregarArtigo(id) {
    carregando.value = true;
    erro.value = null;
    artigoAtual.value = null;
    try {
      artigoAtual.value = await buscarArtigo(id);
    } catch (e) {
      erro.value = e;
    } finally {
      carregando.value = false;
    }
  }

  // ----- CRUD (delegado ao servico) ----------------------------------------
  // Retornam Promises; tratamento de erro/notificacao fica no composable.

  function criar(dados) {
    return criarArtigo(dados);
  }

  function atualizar(id, dados) {
    return atualizarArtigo(id, dados);
  }

  function excluir(id) {
    return excluirArtigo(id);
  }

  /** Limpa o estado (ex.: ao deslogar). */
  function limpar() {
    artigos.value = [];
    artigoAtual.value = null;
    erro.value = null;
  }

  return {
    // estado
    artigos,
    artigoAtual,
    carregando,
    erro,
    // leitura
    carregarLista,
    carregarArtigo,
    // crud
    criar,
    atualizar,
    excluir,
    limpar,
  };
});
