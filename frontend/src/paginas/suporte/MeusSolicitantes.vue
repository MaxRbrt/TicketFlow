<!--
  ============================================================================
  TicketFlow - MeusSolicitantes.vue
  ----------------------------------------------------------------------------
  Visao do suporte agrupada por SOLICITANTE. Reaproveita a escuta em tempo real
  dos chamados das sessoes do suporte (escutarTodos) e agrupa por requesterId,
  montando um cartao por pessoa com indicadores (total, abertos, em andamento,
  resolvidos, urgentes) e ultima atividade. Selecionar um solicitante revela os
  chamados dele, com atalho para o atendimento.

  Sem backend novo: tudo derivado do stream de chamados ja autorizado pelas
  regras (escopo por sessionSupportId).
  ============================================================================
-->
<template>
  <LayoutApp titulo="Meus Solicitantes" v-model:busca="busca">
    <!-- Cabecalho -->
    <div class="topo-painel">
      <div>
        <span class="pill-info"><span class="ponto"></span> Em tempo real</span>
        <h2 class="titulo-hero saudacao">Solicitantes</h2>
        <p class="texto-secundario">
          Pessoas conectadas a voce que ja abriram chamados, organizadas por atividade.
        </p>
      </div>
      <BotaoBase variante="fantasma" @click="irTodos">
        <template #icone><ListChecks :size="18" /></template>
        Ver todos os chamados
      </BotaoBase>
    </div>

    <!-- Indicadores gerais -->
    <ResumoPainel :cards="indicadores" />

    <EstadoCarregamento v-if="carregando" texto="Carregando solicitantes..." />

    <EstadoVazio
      v-else-if="!solicitantes.length"
      titulo="Nenhum solicitante ainda"
      descricao="Assim que alguem entrar com o seu codigo e abrir um chamado, aparece aqui."
    >
      <template #icone><Users :size="28" /></template>
    </EstadoVazio>

    <EstadoVazio
      v-else-if="!solicitantesFiltrados.length"
      titulo="Nada encontrado"
      descricao="Nenhum solicitante corresponde a busca."
    />

    <!-- Grade de solicitantes -->
    <div v-else class="grade-solicitantes">
      <article
        v-for="s in solicitantesFiltrados"
        :key="s.id"
        class="cartao-solicitante elevavel"
        :class="{ 'cartao-selecionado': s.id === selecionadoId }"
        role="button"
        tabindex="0"
        @click="selecionar(s.id)"
        @keydown.enter="selecionar(s.id)"
      >
        <header class="cs-cabecalho">
          <span class="cs-avatar">{{ inicial(s.nome) }}</span>
          <div class="cs-identidade">
            <strong class="cs-nome">{{ s.nome || "Solicitante" }}</strong>
            <span class="cs-email texto-secundario">{{ s.email || "—" }}</span>
          </div>
          <span v-if="s.urgentes" class="cs-urgente" title="Urgentes em aberto">
            <Flame :size="14" /> {{ s.urgentes }}
          </span>
        </header>

        <div class="cs-stats">
          <span class="cs-stat"><b>{{ s.total }}</b> total</span>
          <span class="cs-stat cs-aberto"><b>{{ s.abertos }}</b> abertos</span>
          <span class="cs-stat cs-andamento"><b>{{ s.emAndamento }}</b> em andamento</span>
          <span class="cs-stat cs-resolvido"><b>{{ s.resolvidos }}</b> resolvidos</span>
        </div>

        <footer class="cs-rodape texto-secundario">
          <Clock :size="13" /> Ultima atividade {{ formatarDataRelativa(s.ultima) }}
        </footer>
      </article>
    </div>

    <!-- Chamados do solicitante selecionado -->
    <section v-if="selecionado" class="bloco-chamados-solicitante">
      <div class="bloco-cabecalho">
        <h3 class="titulo-secao">Chamados de {{ selecionado.nome }}</h3>
        <button type="button" class="link-fechar" @click="selecionadoId = null">Fechar</button>
      </div>
      <TabelaChamados :chamados="selecionado.chamados" @abrir="abrirDetalhes" />
    </section>
  </LayoutApp>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ListChecks, Users, Flame, Clock } from "@lucide/vue";
import LayoutApp from "../../componentes/layout/LayoutApp.vue";
import ResumoPainel from "../../componentes/painel/ResumoPainel.vue";
import TabelaChamados from "../../componentes/chamados/TabelaChamados.vue";
import EstadoCarregamento from "../../componentes/comuns/EstadoCarregamento.vue";
import EstadoVazio from "../../componentes/comuns/EstadoVazio.vue";
import BotaoBase from "../../componentes/comuns/BotaoBase.vue";
import { useAutenticacao } from "../../composables/useAutenticacao.js";
import { useChamados } from "../../composables/useChamados.js";
import { STATUS } from "../../constantes/statusChamado.js";
import { PRIORIDADE } from "../../constantes/prioridadesChamado.js";
import { paraData, formatarDataRelativa } from "../../utils/formatarData.js";

const router = useRouter();
const { usuario } = useAutenticacao();
const { chamados, carregando, escutarTodos, pararEscutaLista } = useChamados();

const busca = ref("");
const selecionadoId = ref(null);

// Agrupa os chamados por solicitante (requesterId) e calcula indicadores.
const solicitantes = computed(() => {
  const mapa = new Map();
  for (const c of chamados.value) {
    let s = mapa.get(c.requesterId);
    if (!s) {
      s = {
        id: c.requesterId,
        nome: c.requesterName,
        email: c.requesterEmail,
        chamados: [],
        total: 0,
        abertos: 0,
        emAndamento: 0,
        aguardando: 0,
        resolvidos: 0,
        cancelados: 0,
        urgentes: 0,
        ultima: null,
      };
      mapa.set(c.requesterId, s);
    }

    s.chamados.push(c);
    s.total++;
    if (c.status === STATUS.ABERTO) s.abertos++;
    else if (c.status === STATUS.EM_ANDAMENTO) s.emAndamento++;
    else if (c.status === STATUS.AGUARDANDO_SOLICITANTE) s.aguardando++;
    else if (c.status === STATUS.RESOLVIDO) s.resolvidos++;
    else if (c.status === STATUS.CANCELADO) s.cancelados++;

    if (
      c.priority === PRIORIDADE.URGENTE &&
      c.status !== STATUS.RESOLVIDO &&
      c.status !== STATUS.CANCELADO
    ) {
      s.urgentes++;
    }

    const data = paraData(c.updatedAt) || paraData(c.createdAt);
    if (data && (!s.ultima || data > s.ultima)) s.ultima = data;
  }

  // Mais ativos (atividade recente) primeiro.
  return [...mapa.values()].sort(
    (a, b) => (b.ultima?.getTime() || 0) - (a.ultima?.getTime() || 0)
  );
});

// Filtro textual por nome ou e-mail.
const solicitantesFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase();
  if (!termo) return solicitantes.value;
  return solicitantes.value.filter((s) =>
    `${s.nome} ${s.email}`.toLowerCase().includes(termo)
  );
});

const selecionado = computed(
  () => solicitantes.value.find((s) => s.id === selecionadoId.value) || null
);

// Indicadores gerais do topo.
const indicadores = computed(() => {
  const totalChamados = chamados.value.length;
  const urgentes = solicitantes.value.reduce((acc, s) => acc + s.urgentes, 0);
  return [
    { rotulo: "Solicitantes", numero: solicitantes.value.length, sub: "conectados a voce" },
    { rotulo: "Chamados", numero: totalChamados, sub: "no total" },
    {
      rotulo: "Em aberto",
      numero: solicitantes.value.reduce((acc, s) => acc + s.abertos + s.emAndamento + s.aguardando, 0),
      sub: "aguardando voce",
    },
    { rotulo: "Urgentes", numero: urgentes, sub: "exigem prioridade" },
  ];
});

function inicial(nome) {
  return nome ? nome.charAt(0).toUpperCase() : "?";
}

function selecionar(id) {
  selecionadoId.value = selecionadoId.value === id ? null : id;
}

function irTodos() {
  router.push("/suporte/chamados");
}

function abrirDetalhes(id) {
  router.push(`/suporte/chamados/${id}`);
}

onMounted(() => {
  if (usuario.value) {
    escutarTodos(usuario.value.uid);
  }
});

onUnmounted(() => {
  pararEscutaLista();
});
</script>

<style scoped>
.topo-painel {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--espaco-md);
  flex-wrap: wrap;
}

.saudacao {
  margin-top: var(--espaco-sm);
}

/* ----- Grade de solicitantes ---------------------------------------------- */
.grade-solicitantes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: var(--espaco-md);
}

.cartao-solicitante {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
  padding: var(--espaco-md);
  border-radius: var(--raio-card);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
  cursor: pointer;
  transition: border-color var(--transicao-rapida), box-shadow var(--transicao-rapida),
    transform var(--transicao-rapida);
}

.cartao-selecionado {
  border-color: color-mix(in srgb, var(--cor-acento) 45%, transparent);
  box-shadow: var(--glow-acento);
}

.cs-cabecalho {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
}

.cs-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  font-weight: var(--peso-bold);
  color: var(--cor-texto-sobre-acento);
  background: var(--cor-acento);
  flex-shrink: 0;
}

.cs-identidade {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cs-nome {
  font-weight: var(--peso-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cs-email {
  font-size: var(--fonte-pequena);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cs-urgente {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 3px 8px;
  border-radius: var(--raio-pill);
  font-size: var(--fonte-pequena);
  font-weight: var(--peso-semibold);
  color: var(--cor-status-cancelado);
  background: color-mix(in srgb, var(--cor-status-cancelado) 14%, transparent);
  flex-shrink: 0;
}

.cs-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaco-sm);
}

.cs-stat {
  font-size: var(--fonte-pequena);
  color: var(--cor-texto-secundario);
  padding: 3px 8px;
  border-radius: var(--raio-pill);
  background: var(--vidro-fundo-forte, var(--vidro-fundo));
  border: 1px solid var(--vidro-borda);
}

.cs-stat b {
  color: var(--cor-texto-principal);
}

.cs-aberto b {
  color: var(--cor-status-aberto);
}
.cs-andamento b {
  color: var(--cor-status-andamento);
}
.cs-resolvido b {
  color: var(--cor-status-resolvido);
}

.cs-rodape {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fonte-pequena);
}

/* ----- Chamados do solicitante selecionado -------------------------------- */
.bloco-chamados-solicitante {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.bloco-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
}

.link-fechar {
  color: var(--cor-acento-claro);
  font-weight: var(--peso-semibold);
}

.link-fechar:hover {
  text-decoration: underline;
}
</style>
