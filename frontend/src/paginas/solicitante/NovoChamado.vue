<!--
  ============================================================================
  TicketFlow - NovoChamado.vue
  ----------------------------------------------------------------------------
  Cria um novo chamado (RF006) e tambem serve para EDITAR um chamado aberto
  (RF010) quando a rota traz um :id. Usa o FormularioChamado e delega o salvar
  ao useChamados. Os dados do solicitante sao preenchidos automaticamente.
  ============================================================================
-->
<template>
  <LayoutApp :titulo="modoEdicao ? 'Editar Chamado' : 'Novo Chamado'" :mostrar-busca="false">
    <div class="novo-chamado">
      <BotaoBase variante="fantasma" @click="voltar">
        <template #icone><ArrowLeft :size="16" /></template>
        Voltar
      </BotaoBase>

      <section class="painel">
        <header class="cabecalho">
          <h2 class="titulo-secao">
            {{ modoEdicao ? "Editar chamado" : "Abrir novo chamado" }}
          </h2>
          <p class="texto-secundario">
            Preencha os dados abaixo. Campos com * sao obrigatorios.
          </p>
        </header>

        <EstadoCarregamento v-if="carregandoChamado" texto="Carregando chamado..." />

        <FormularioChamado
          v-else
          :valores-iniciais="valoresIniciais"
          :enviando="enviando"
          :texto-botao="modoEdicao ? 'Salvar alteracoes' : 'Abrir chamado'"
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
import FormularioChamado from "../../componentes/chamados/FormularioChamado.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useChamados } from "../../composables/useChamados.js";
import { useSessao } from "../../composables/useSessao.js";
import { useNotificacao } from "../../composables/useNotificacao.js";
import { buscarChamado } from "../../servicos/servicoChamado.js";
import { STATUS } from "../../constantes/statusChamado.js";

const router = useRouter();
const route = useRoute();
const { usuario, nome } = useAutenticacao();
const { criar, atualizar } = useChamados();
const { ativa: sessaoAtiva, codigo: sessaoCodigo, suporteId: sessaoSuporteId } = useSessao();
const notificacao = useNotificacao();

// Modo edicao quando a rota traz um id.
const idChamado = computed(() => route.params.id || null);
const modoEdicao = computed(() => !!idChamado.value);

const valoresIniciais = ref({});
const carregandoChamado = ref(false);
const enviando = ref(false);

/** No modo edicao, carrega o chamado e preenche o formulario. */
async function carregar() {
  if (!modoEdicao.value) return;

  carregandoChamado.value = true;
  const chamado = await buscarChamado(idChamado.value);
  carregandoChamado.value = false;

  if (!chamado) {
    notificacao.erro("Chamado nao encontrado.");
    voltar();
    return;
  }
  // So permite editar chamados ainda abertos (RN005).
  if (chamado.status !== STATUS.ABERTO) {
    notificacao.erro("Este chamado nao pode mais ser editado.");
    router.push(`/solicitante/chamados/${idChamado.value}`);
    return;
  }
  valoresIniciais.value = chamado;
}

/** Salva: cria um novo chamado ou atualiza o existente. */
async function salvar(dados) {
  enviando.value = true;

  let resultado;
  if (modoEdicao.value) {
    resultado = await atualizar(idChamado.value, dados);
  } else {
    // Exige vinculo de sessao ativo: sem isso o chamado nao tem suporte destino.
    if (!sessaoAtiva.value) {
      enviando.value = false;
      notificacao.erro("Conecte-se a um suporte antes de abrir um chamado.");
      router.push("/solicitante/sessao");
      return;
    }
    resultado = await criar({
      ...dados,
      requesterId: usuario.value.uid,
      requesterName: nome.value,
      requesterEmail: usuario.value.email,
      sessionId: sessaoCodigo.value,
      sessionSupportId: sessaoSuporteId.value,
    });
  }

  enviando.value = false;

  if (resultado.ok) {
    router.push("/solicitante/chamados");
  }
}

function voltar() {
  router.push("/solicitante/chamados");
}

onMounted(carregar);
</script>

<style scoped>
.novo-chamado {
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
