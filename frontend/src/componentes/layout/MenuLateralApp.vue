<!--
  ============================================================================
  TicketFlow - MenuLateralApp.vue
  ----------------------------------------------------------------------------
  Sidebar de vidro com a marca, o menu de navegacao (montado conforme o perfil
  do usuario) e o botao de sair. O item ativo recebe destaque com glow ciano.

  Emite "navegou" ao clicar em um item (o layout usa isso para fechar o menu
  no mobile).
  ============================================================================
-->
<template>
  <aside class="sidebar vidro">
    <!-- Marca -->
    <RouterLink :to="rotaInicial" class="sidebar-marca" @click="$emit('navegou')">
      <span class="sidebar-logo"><Ticket :size="22" /></span>
      <div class="sidebar-marca-texto">
        <strong class="sidebar-nome">TicketFlow</strong>
        <span class="sidebar-tagline">Sistema de Chamados</span>
      </div>
    </RouterLink>

    <!-- Menu principal -->
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in itens"
        :key="item.rota"
        :to="item.rota"
        class="sidebar-item"
        active-class="sidebar-item-ativo"
        @click="$emit('navegou')"
      >
        <component :is="item.icone" :size="20" class="sidebar-item-icone" />
        <span>{{ item.rotulo }}</span>
      </RouterLink>
    </nav>

    <!-- Rodape: usuario + sair -->
    <div class="sidebar-rodape">
      <div class="sidebar-usuario">
        <span class="sidebar-avatar">{{ inicial }}</span>
        <div class="sidebar-usuario-texto">
          <strong class="sidebar-usuario-nome">{{ nome || "Usuario" }}</strong>
          <span class="sidebar-usuario-perfil">{{ rotuloPerfil }}</span>
        </div>
      </div>
      <button class="sidebar-sair" type="button" @click="aoSair">
        <LogOut :size="18" />
        <span>Sair</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  LayoutDashboard,
  Ticket,
  TicketPlus,
  Zap,
  Users,
  UserRound,
  LogOut,
} from "@lucide/vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { PERFIL, obterInfoPerfil } from "../../constantes/perfisUsuario.js";

const emit = defineEmits(["navegou"]);

const router = useRouter();
const { nome, papel, ehSuporte, rotaInicial, sair } = useAutenticacao();

// Menu do solicitante.
const MENU_SOLICITANTE = [
  { rota: "/solicitante/painel", rotulo: "Painel", icone: LayoutDashboard },
  { rota: "/solicitante/chamados", rotulo: "Meus Chamados", icone: Ticket },
  { rota: "/solicitante/chamados/novo", rotulo: "Novo Chamado", icone: TicketPlus },
  { rota: "/perfil", rotulo: "Perfil", icone: UserRound },
];

// Menu do suporte.
const MENU_SUPORTE = [
  { rota: "/suporte/painel", rotulo: "Painel", icone: LayoutDashboard },
  { rota: "/suporte/chamados", rotulo: "Todos os Chamados", icone: Ticket },
  { rota: "/suporte/chamados/urgentes", rotulo: "Urgentes", icone: Zap },
  { rota: "/suporte/solicitantes", rotulo: "Solicitantes", icone: Users },
  { rota: "/perfil", rotulo: "Perfil", icone: UserRound },
];

// Escolhe o menu conforme o perfil do usuario logado.
const itens = computed(() => (ehSuporte.value ? MENU_SUPORTE : MENU_SOLICITANTE));

// Rotulo amigavel do perfil (Solicitante/Suporte).
const rotuloPerfil = computed(() =>
  papel.value ? obterInfoPerfil(papel.value).rotulo : ""
);

// Inicial do nome para o avatar.
const inicial = computed(() => (nome.value ? nome.value.charAt(0).toUpperCase() : "U"));

/** Faz logout e volta para o login. */
async function aoSair() {
  await sair();
  emit("navegou");
  router.push("/login");
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-lg);
  width: var(--largura-sidebar);
  padding: var(--espaco-lg);
  border-radius: var(--raio-sidebar);
}

/* ----- Marca -------------------------------------------------------------- */
.sidebar-marca {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  color: var(--cor-texto-principal);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  color: var(--cor-texto-sobre-acento);
  background: var(--cor-acento);
  box-shadow: var(--glow-acento);
  flex-shrink: 0;
}

.sidebar-nome {
  display: block;
  font-family: var(--fonte-display);
  font-size: 18px;
  font-weight: var(--peso-bold);
  line-height: 1.1;
}

.sidebar-tagline {
  font-size: var(--fonte-pequena);
  color: var(--cor-texto-secundario);
}

/* ----- Navegacao ---------------------------------------------------------- */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  padding: 13px var(--espaco-md);
  border-radius: var(--raio-botao);
  color: var(--cor-texto-secundario);
  font-weight: var(--peso-medio);
  border: 1px solid transparent;
  transition: background var(--transicao-rapida), color var(--transicao-rapida),
    border-color var(--transicao-rapida), transform var(--transicao-rapida);
}

.sidebar-item:hover {
  color: var(--cor-texto-principal);
  background: var(--vidro-fundo);
  transform: translateX(2px);
}

.sidebar-item-ativo {
  color: var(--cor-texto-principal);
  background: var(--vidro-fundo-forte);
  border-color: color-mix(in srgb, var(--cor-acento) 35%, transparent);
  box-shadow: var(--glow-acento);
}

.sidebar-item-ativo .sidebar-item-icone {
  color: var(--cor-acento);
}

/* ----- Rodape ------------------------------------------------------------- */
.sidebar-rodape {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-sm);
  padding-top: var(--espaco-md);
  border-top: 1px solid var(--vidro-borda);
}

.sidebar-usuario {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
}

.sidebar-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-weight: var(--peso-bold);
  color: var(--cor-texto-sobre-acento);
  background: var(--cor-acento);
  flex-shrink: 0;
}

.sidebar-usuario-nome {
  display: block;
  font-size: var(--fonte-corpo);
  color: var(--cor-texto-principal);
  line-height: 1.2;
}

.sidebar-usuario-perfil {
  font-size: var(--fonte-pequena);
  color: var(--cor-texto-secundario);
}

.sidebar-sair {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  padding: 11px var(--espaco-md);
  border-radius: var(--raio-botao);
  color: var(--cor-texto-secundario);
  font-weight: var(--peso-medio);
  transition: background var(--transicao-rapida), color var(--transicao-rapida);
}

.sidebar-sair:hover {
  color: var(--cor-erro);
  background: color-mix(in srgb, var(--cor-erro) 12%, transparent);
}
</style>
