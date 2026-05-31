<!--
  ============================================================================
  TicketFlow - PerfilUsuario.vue
  ----------------------------------------------------------------------------
  Perfil do usuario autenticado (secao 15.10). Exibe nome, e-mail, tipo de
  conta, departamento (se houver) e data de cadastro. Permite logout (RF003).
  Acessivel a qualquer usuario logado (solicitante ou suporte).
  ============================================================================
-->
<template>
  <LayoutApp titulo="Meu Perfil" :mostrar-busca="false">
    <div class="perfil">
      <section class="painel cartao-perfil">
        <header class="perfil-cabecalho">
          <span class="perfil-avatar">{{ inicial }}</span>
          <div>
            <h2 class="titulo-secao">{{ nome || "Usuario" }}</h2>
            <span class="pill-info"><span class="ponto"></span> {{ rotuloPerfil }}</span>
          </div>
        </header>

        <dl class="perfil-dados">
          <div class="perfil-item">
            <dt class="rotulo-pequeno">Nome completo</dt>
            <dd>{{ nome || "-" }}</dd>
          </div>
          <div class="perfil-item">
            <dt class="rotulo-pequeno">E-mail</dt>
            <dd>{{ email || "-" }}</dd>
          </div>
          <div class="perfil-item">
            <dt class="rotulo-pequeno">Tipo de conta</dt>
            <dd>{{ rotuloPerfil }}</dd>
          </div>
          <div v-if="departamento" class="perfil-item">
            <dt class="rotulo-pequeno">Departamento</dt>
            <dd>{{ departamento }}</dd>
          </div>
          <div class="perfil-item">
            <dt class="rotulo-pequeno">Membro desde</dt>
            <dd>{{ dataCadastro }}</dd>
          </div>
        </dl>

        <footer class="perfil-rodape">
          <BotaoBase variante="fantasma" :carregando="saindo" @click="aoSair">
            <template #icone><LogOut :size="16" /></template>
            Sair da conta
          </BotaoBase>
        </footer>
      </section>

      <section class="painel zona-perigo">
        <div class="zona-perigo-texto">
          <h3 class="titulo-card">Excluir minha conta</h3>
          <p class="texto-secundario">
            Remove sua conta e seus chamados ainda abertos de forma permanente.
            Chamados ja em atendimento ou finalizados sao mantidos como historico.
            Esta acao nao pode ser desfeita.
          </p>
        </div>
        <BotaoBase variante="perigo" @click="abrirExclusao">
          <template #icone><Trash2 :size="16" /></template>
          Excluir conta
        </BotaoBase>
      </section>
    </div>

    <ModalBase v-model="modalAberto" titulo="Excluir conta" @fechar="aoFecharModal">
      <p>
        Para confirmar, digite sua senha. Sua conta e seus chamados abertos serao
        apagados permanentemente.
      </p>
      <CampoTextoBase
        v-model="senha"
        label="Senha"
        tipo="password"
        placeholder="Sua senha atual"
        autocomplete="current-password"
        :erro="erroSenha"
        @blur="erroSenha = ''"
      />

      <template #acoes>
        <BotaoBase variante="fantasma" :desabilitado="excluindo" @click="modalAberto = false">
          Cancelar
        </BotaoBase>
        <BotaoBase variante="perigo" :carregando="excluindo" @click="confirmarExclusao">
          Excluir definitivamente
        </BotaoBase>
      </template>
    </ModalBase>
  </LayoutApp>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { LogOut, Trash2 } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import ModalBase from "../../componentes/comuns/ModalBase.vue";
import CampoTextoBase from "../../componentes/comuns/CampoTextoBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { obterInfoPerfil } from "../../constantes/perfisUsuario.js";
import { formatarData } from "../../utils/formatarData.js";

const router = useRouter();
const { usuario, perfil, nome, papel, sair, excluirConta } = useAutenticacao();

const saindo = ref(false);

// Estado do fluxo de exclusao de conta.
const modalAberto = ref(false);
const senha = ref("");
const erroSenha = ref("");
const excluindo = ref(false);

const email = computed(() => perfil.value?.email || usuario.value?.email || "");
const departamento = computed(() => perfil.value?.department || "");
const rotuloPerfil = computed(() =>
  papel.value ? obterInfoPerfil(papel.value).rotulo : "-"
);
const dataCadastro = computed(() =>
  perfil.value?.createdAt ? formatarData(perfil.value.createdAt) : "-"
);
const inicial = computed(() =>
  nome.value ? nome.value.charAt(0).toUpperCase() : "U"
);

/** Faz logout e volta para o login. */
async function aoSair() {
  saindo.value = true;
  await sair();
  router.push("/login");
}

/** Abre o modal de exclusao, limpando o estado anterior. */
function abrirExclusao() {
  senha.value = "";
  erroSenha.value = "";
  modalAberto.value = true;
}

/** Impede fechar o modal (e limpar o campo) durante a exclusao. */
function aoFecharModal() {
  if (!excluindo.value) {
    senha.value = "";
    erroSenha.value = "";
  }
}

/**
 * Confirma a exclusao: valida a senha localmente, chama excluirConta e, em caso
 * de sucesso, redireciona para o login (a sessao ja foi encerrada).
 */
async function confirmarExclusao() {
  if (!senha.value) {
    erroSenha.value = "Informe sua senha para confirmar.";
    return;
  }

  excluindo.value = true;
  const { ok } = await excluirConta(senha.value);
  excluindo.value = false;

  if (ok) {
    modalAberto.value = false;
    router.push("/login");
  } else {
    // Senha incorreta ou outro erro: mantem o modal aberto para nova tentativa.
    erroSenha.value = "Verifique sua senha e tente novamente.";
  }
}
</script>

<style scoped>
.perfil {
  max-width: 560px;
  width: 100%;
}

.cartao-perfil {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-lg);
}

.perfil-cabecalho {
  display: flex;
  align-items: center;
  gap: var(--espaco-md);
}

.perfil-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  font-family: var(--fonte-display);
  font-size: 26px;
  font-weight: var(--peso-bold);
  color: var(--cor-texto-sobre-acento);
  background: var(--cor-acento);
  box-shadow: var(--glow-acento);
  flex-shrink: 0;
}

.perfil-dados {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--espaco-md);
  padding: var(--espaco-md) 0;
  border-top: 1px solid var(--vidro-borda);
  border-bottom: 1px solid var(--vidro-borda);
}

.perfil-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.perfil-item dd {
  color: var(--cor-texto-principal);
}

.perfil-rodape {
  display: flex;
  justify-content: flex-end;
}

.zona-perigo {
  margin-top: var(--espaco-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
  border: 1px solid color-mix(in srgb, var(--cor-erro) 35%, transparent);
}

.zona-perigo-texto {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Botao nao encolhe abaixo do proprio texto quando a coluna de texto cresce. */
.zona-perigo :deep(.botao) {
  flex-shrink: 0;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .perfil-dados {
    grid-template-columns: 1fr;
  }

  .zona-perigo {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
