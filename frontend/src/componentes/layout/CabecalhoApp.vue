<!--
  ============================================================================
  TicketFlow - CabecalhoApp.vue
  ----------------------------------------------------------------------------
  Barra superior em capsula de vidro: botao de menu (mobile), titulo da area,
  campo de busca opcional, acoes (notificacoes/config) e avatar do usuario.

  Props:
    - titulo        : texto principal da barra
    - modelValue    : termo de busca (v-model) - opcional
    - mostrarBusca  : exibe ou nao o campo de busca
  Eventos:
    - abrir-menu        : pedido para abrir a sidebar no mobile
    - update:modelValue : digitacao na busca
  ============================================================================
-->
<template>
  <header class="topbar vidro">
    <!-- Esquerda: menu (mobile) + titulo -->
    <div class="topbar-esquerda">
      <button class="botao-icone topbar-menu" type="button" aria-label="Abrir menu" @click="$emit('abrir-menu')">
        <Menu :size="20" />
      </button>
      <h1 class="topbar-titulo">{{ titulo }}</h1>
    </div>

    <!-- Centro: busca -->
    <div v-if="mostrarBusca" class="topbar-busca">
      <Search :size="18" class="topbar-busca-icone" />
      <input
        :value="modelValue"
        type="search"
        class="topbar-busca-input"
        :placeholder="placeholderBusca"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>

    <!-- Direita: acoes + avatar -->
    <div class="topbar-direita">
      <!-- Sino de notificacoes (suporte: chamados novos / solicitante: respostas) -->
      <div v-if="temSino" ref="refSino" class="topbar-sino">
        <button
          class="botao-icone notif-botao"
          :class="{ 'notif-botao-ativo': abrirPainel }"
          type="button"
          :aria-label="`Notificacoes (${quantidade})`"
          aria-haspopup="dialog"
          :aria-expanded="abrirPainel"
          @click="abrirPainel = !abrirPainel"
        >
          <Bell :size="18" />
          <span
            v-if="quantidade > 0"
            class="notif-badge"
            :class="{ 'notif-badge-pop': destacar }"
            @animationend="destacar = false"
          >
            {{ quantidade > 9 ? "9+" : quantidade }}
          </span>
        </button>

        <transition name="notif-pop">
          <div
            v-if="abrirPainel"
            class="notif-painel vidro"
            role="dialog"
            :aria-label="tituloSino"
          >
            <header class="notif-cabecalho">
              <span class="notif-titulo">{{ tituloSino }}</span>
              <span v-if="quantidade > 0" class="notif-contagem">{{ quantidade }}</span>
            </header>

            <ul v-if="quantidade > 0" class="notif-lista">
              <li v-for="item in itensSino" :key="item.id">
                <RouterLink :to="item.rota" class="notif-item" @click="aoAbrirItem(item.id)">
                  <span class="notif-item-titulo">{{ item.titulo }}</span>
                  <span class="notif-item-meta">{{ item.meta }}</span>
                </RouterLink>
              </li>
            </ul>

            <p v-else class="notif-vazio">{{ textoVazio }}</p>
          </div>
        </transition>
      </div>

      <RouterLink to="/perfil" class="topbar-avatar" :title="nome">
        {{ inicial }}
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Menu, Search, Bell } from "@lucide/vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useNotificacaoSuporte } from "../../composables/useNotificacaoSuporte.js";
import { useNotificacaoSolicitante } from "../../composables/useNotificacaoSolicitante.js";
import { formatarDataRelativa } from "../../utils/formatarData.js";
import { rotuloStatus } from "../../constantes/statusChamado.js";

const props = defineProps({
  titulo: { type: String, default: "" },
  modelValue: { type: String, default: "" },
  mostrarBusca: { type: Boolean, default: true },
  placeholderBusca: { type: String, default: "Buscar chamado..." },
});

defineEmits(["abrir-menu", "update:modelValue"]);

const { nome, ehSuporte, ehSolicitante } = useAutenticacao();
const inicial = computed(() => (nome.value ? nome.value.charAt(0).toUpperCase() : "U"));

// O mesmo sino serve aos dois perfis, com fonte e textos diferentes:
//   - suporte: chamados novos aguardando atendimento;
//   - solicitante: atualizacoes do suporte nos proprios chamados.
const notifSuporte = useNotificacaoSuporte();
const notifSolicitante = useNotificacaoSolicitante();

const temSino = computed(() => ehSuporte.value || ehSolicitante.value);
const pendentes = computed(() =>
  ehSuporte.value ? notifSuporte.pendentes.value : notifSolicitante.pendentes.value
);
const quantidade = computed(() =>
  ehSuporte.value ? notifSuporte.quantidade.value : notifSolicitante.quantidade.value
);
const tituloSino = computed(() =>
  ehSuporte.value ? "Aguardando atendimento" : "Atualizacoes dos seus chamados"
);
const textoVazio = computed(() =>
  ehSuporte.value ? "Nenhum chamado aguardando." : "Nenhuma atualizacao nova."
);

// Lista normalizada exibida no painel (titulo/meta/rota mudam por perfil).
const itensSino = computed(() =>
  pendentes.value.map((c) =>
    ehSuporte.value
      ? {
          id: c.id,
          titulo: c.title,
          meta: `${c.requesterName || "Solicitante"} - ${formatarDataRelativa(c.createdAt)}`,
          rota: { name: "suporte-detalhes-chamado", params: { id: c.id } },
        }
      : {
          id: c.id,
          titulo: c.title,
          meta: `${rotuloStatus(c.status)} - ${formatarDataRelativa(c.updatedAt)}`,
          rota: { name: "solicitante-detalhes-chamado", params: { id: c.id } },
        }
  )
);

// Ao abrir um chamado pela notificacao: marca como visto (some do badge) e fecha.
function aoAbrirItem(id) {
  if (ehSuporte.value) {
    notifSuporte.marcarLido(id);
  } else {
    const chamado = pendentes.value.find((c) => c.id === id);
    if (chamado) notifSolicitante.marcarVisto(chamado);
  }
  abrirPainel.value = false;
}

// Painel do sino: abre/fecha e fecha ao clicar fora ou apertar Esc.
const abrirPainel = ref(false);
const refSino = ref(null);

// Pop unico no badge quando chega chamado novo (a contagem sobe). O toast ja
// avisa a chegada; o pop so reforca o sinal na topbar. Sem loop infinito.
const destacar = ref(false);
watch(quantidade, (novo, antigo) => {
  if (novo > antigo) destacar.value = true;
});

function aoClicarFora(evento) {
  if (refSino.value && !refSino.value.contains(evento.target)) {
    abrirPainel.value = false;
  }
}
function aoTeclar(evento) {
  if (evento.key === "Escape") abrirPainel.value = false;
}

onMounted(() => {
  document.addEventListener("click", aoClicarFora);
  document.addEventListener("keydown", aoTeclar);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", aoClicarFora);
  document.removeEventListener("keydown", aoTeclar);
});
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: var(--espaco-md);
  height: var(--altura-topbar);
  padding: 0 var(--espaco-lg);
  border-radius: var(--raio-painel);
  /* O backdrop-filter de .vidro cria um stacking context; sem z-index ele fica
     no nivel 0 e o conteudo da pagina (DOM posterior) pinta por cima do painel
     do sino. Elevar a topbar garante que o dropdown fique acima do conteudo. */
  position: relative;
  z-index: var(--z-topbar);
}

.topbar-esquerda {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
}

.topbar-titulo {
  font-family: var(--fonte-display);
  font-size: var(--fonte-titulo);
  font-weight: var(--peso-semibold);
  color: var(--cor-texto-principal);
  white-space: nowrap;
}

/* ----- Busca -------------------------------------------------------------- */
.topbar-busca {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  flex: 1;
  max-width: 420px;
  margin: 0 auto;
  height: 46px;
  padding: 0 var(--espaco-md);
  border-radius: var(--raio-pill);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
}

.topbar-busca-icone {
  color: var(--cor-texto-secundario);
  flex-shrink: 0;
}

.topbar-busca-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--cor-texto-principal);
  outline: none;
}

.topbar-busca-input::placeholder {
  color: var(--cor-texto-secundario);
  opacity: 0.7;
}

/* ----- Direita ------------------------------------------------------------ */
.topbar-direita {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  margin-left: auto;
}

/* ----- Sino de notificacoes (suporte) ------------------------------------- */
.topbar-sino {
  position: relative;
  flex: 0 0 auto;
}

.notif-botao {
  position: relative;
}

.notif-botao-ativo {
  color: var(--cor-acento);
  background: color-mix(in srgb, var(--cor-acento) 14%, transparent);
}

.notif-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: var(--peso-bold);
  line-height: 1;
  color: var(--cor-texto-sobre-acento);
  background: var(--cor-acento);
  border-radius: var(--raio-pill);
  box-shadow: var(--glow-acento);
}

/* Pop unico ao chegar chamado novo (classe adicionada via watch da contagem). */
.notif-badge-pop {
  animation: pulso-sino 0.45s var(--easing-enter, cubic-bezier(0.22, 1, 0.36, 1));
}

@keyframes pulso-sino {
  0% { transform: scale(1); }
  45% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.notif-painel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(360px, calc(100vw - 2 * var(--espaco-md)));
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
  border-radius: var(--raio-painel);
  /* Fundo OPACO (color-mix de cores solidas). O vidro translucido deixava o
     conteudo atras vazar e o texto ficava ilegivel; o painel precisa de base
     solida. O radial ciano fica so como leve realce no topo. */
  background:
    radial-gradient(130% 130% at 100% 0%, rgba(69, 211, 218, 0.16), transparent 60%),
    color-mix(in srgb, var(--cor-fundo-2) 94%, #000);
  border: 1px solid color-mix(in srgb, var(--cor-acento) 28%, var(--vidro-borda));
  box-shadow: var(--sombra-hover), var(--sombra-interna);
  z-index: var(--z-notificacao);
}

.notif-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-sm);
  padding: var(--espaco-xs) var(--espaco-sm) var(--espaco-sm);
  border-bottom: 1px solid var(--vidro-borda);
}

.notif-titulo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: var(--peso-semibold);
  color: var(--cor-texto-principal);
}

.notif-titulo::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cor-acento);
  box-shadow: var(--glow-acento);
}

.notif-contagem {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: var(--peso-bold);
  color: var(--cor-texto-sobre-acento);
  background: var(--cor-acento);
  border-radius: var(--raio-pill);
}

.notif-lista {
  list-style: none;
  margin: 0;
  padding: var(--espaco-sm) 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notif-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px var(--espaco-sm);
  border-radius: var(--raio-input);
  text-decoration: none;
  color: inherit;
  border: 1px solid transparent;
  transition: background var(--transicao-rapida), border-color var(--transicao-rapida),
    transform var(--transicao-rapida);
}

.notif-item:hover {
  background: var(--vidro-fundo);
  border-color: color-mix(in srgb, var(--cor-acento) 22%, transparent);
  transform: translateX(2px);
}

.notif-item-titulo {
  color: var(--cor-texto-principal);
  font-weight: var(--peso-medio);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notif-item-meta {
  font-size: var(--fonte-pequena);
  color: var(--cor-texto-secundario);
  overflow-wrap: anywhere;
}

.notif-vazio {
  padding: var(--espaco-md) var(--espaco-sm) var(--espaco-lg);
  text-align: center;
  color: var(--cor-texto-secundario);
}

/* Transicao do painel: emerge do gatilho (sino), no canto superior direito.
   Entrada com curva de entrada; saida mais rapida (resposta instantanea). */
.notif-painel {
  transform-origin: top right;
}
.notif-pop-enter-active {
  transition: opacity var(--transicao-rapida) cubic-bezier(0.22, 1, 0.36, 1),
    transform var(--transicao-rapida) cubic-bezier(0.22, 1, 0.36, 1);
}
.notif-pop-leave-active {
  transition: opacity 140ms ease-out, transform 140ms ease-out;
}
.notif-pop-enter-from,
.notif-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}

.topbar-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-weight: var(--peso-bold);
  color: var(--cor-texto-sobre-acento);
  background: var(--cor-acento);
  box-shadow: var(--glow-acento);
  transition: transform var(--transicao-rapida);
}

.topbar-avatar:hover {
  transform: translateY(-2px);
}

/* Botao de menu (hamburguer): so aparece no mobile. Controle local, sem o
   helper global de visibilidade - evita conflito de display. */
.topbar-menu {
  display: none;
}

/* No modo compacto a sidebar vira drawer e a busca ocupa uma linha propria. */
@media (max-width: 1100px) {
  .topbar {
    flex-wrap: wrap;
    height: auto;
    min-height: var(--altura-topbar);
    padding: 10px 12px;
  }

  .topbar-esquerda {
    min-width: 0;
    flex: 1;
  }

  .topbar-busca {
    order: 3;
    flex: 0 0 100%;
    width: 100%;
    max-width: none;
    margin: 0;
  }

  .topbar-titulo {
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .topbar-menu {
    display: inline-flex;
  }
}

@media (max-width: 760px) {
  .topbar-sino {
    position: static;
  }

  .notif-painel {
    position: fixed;
    top: calc(var(--mobile-page-padding) + var(--altura-topbar) + 8px);
    right: var(--mobile-page-padding);
    left: var(--mobile-page-padding);
    width: auto;
    max-height: min(62dvh, 420px);
    border-radius: var(--raio-card);
  }

  .notif-item {
    padding: 12px var(--espaco-sm);
  }

  .notif-item:hover {
    transform: none;
  }
}
</style>
