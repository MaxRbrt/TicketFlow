// ============================================================================
// TicketFlow - useBaseConhecimento
// ----------------------------------------------------------------------------
// Camada de conveniencia entre as telas e a store da base de conhecimento.
// Concentra:
//   - injecao do autor (usuario logado) ao publicar;
//   - notificacoes de sucesso/erro (RNF006);
//   - retorno padronizado { ok, ... } para as telas.
// O estado reativo (lista, artigo atual) vem direto da store.
// ============================================================================

import { storeToRefs } from "pinia";
import { useStoreBaseConhecimento } from "../stores/storeBaseConhecimento.js";
import { useNotificacao } from "./useNotificacao.js";
import { useAutenticacao } from "./useAutenticacao.js";

export function useBaseConhecimento() {
  const store = useStoreBaseConhecimento();
  const notificacao = useNotificacao();
  const { usuario, nome } = useAutenticacao();

  // Estado reativo da store.
  const { artigos, artigoAtual, carregando, erro } = storeToRefs(store);

  // Leitura (delegacao direta).
  const carregarLista = store.carregarLista;
  const carregarArtigo = store.carregarArtigo;

  /**
   * Executa uma operacao da store com tratamento de erro + notificacao.
   * @param {() => Promise<*>} operacao - Funcao assincrona a executar.
   * @param {string} mensagemSucesso - Texto exibido em caso de sucesso.
   * @param {string} mensagemErro - Texto exibido em caso de falha.
   */
  async function executar(operacao, mensagemSucesso, mensagemErro) {
    try {
      const resultado = await operacao();
      if (mensagemSucesso) {
        notificacao.sucesso(mensagemSucesso);
      }
      return { ok: true, resultado };
    } catch (e) {
      notificacao.erro(mensagemErro || "Ocorreu um erro. Tente novamente.");
      return { ok: false, erro: e };
    }
  }

  /** Publica um novo artigo, marcando o usuario logado como autor. */
  function criar(dados) {
    return executar(
      () =>
        store.criar({
          ...dados,
          authorId: usuario.value?.uid,
          authorName: nome.value,
        }),
      "Artigo publicado com sucesso.",
      "Nao foi possivel publicar o artigo."
    );
  }

  /** Edita um artigo existente (autor preservado pelas regras). */
  function atualizar(id, dados) {
    return executar(
      () => store.atualizar(id, dados),
      "Artigo atualizado com sucesso.",
      "Nao foi possivel atualizar o artigo."
    );
  }

  /** Exclui um artigo. */
  function excluir(id) {
    return executar(
      () => store.excluir(id),
      "Artigo excluido com sucesso.",
      "Nao foi possivel excluir o artigo."
    );
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
  };
}
