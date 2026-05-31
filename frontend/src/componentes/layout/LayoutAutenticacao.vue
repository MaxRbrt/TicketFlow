<!--
  ============================================================================
  TicketFlow - LayoutAutenticacao.vue
  ----------------------------------------------------------------------------
  Layout das telas publicas (login/cadastro): painel de acesso de vidro
  centralizado, com marca, selo de acesso seguro e uma aura ciano por tras.
  O fundo (atmosfera com blobs/glow) vem do estilo global; aqui adicionamos
  uma aura local e o brilho da costura superior do cartao.

  Slots: default (formulario), rodape (links auxiliares).
  Props: titulo, subtitulo.
  ============================================================================
-->
<template>
  <main class="auth">
    <!-- Aura ciano decorativa atras do cartao -->
    <div class="auth-aura" aria-hidden="true"></div>

    <section class="auth-cartao painel">
      <!-- Costura luminosa no topo do cartao -->
      <span class="auth-seam" aria-hidden="true"></span>

      <div class="auth-stack cascata">
        <!-- Marca + selo de acesso seguro -->
        <header class="auth-marca">
          <span class="auth-logo">
            <Ticket :size="24" />
          </span>
          <div class="auth-marca-texto">
            <h1 class="auth-nome">TicketFlow</h1>
            <p class="auth-tagline">Sistema de Chamados</p>
          </div>
          <span class="auth-selo">
            <ShieldCheck :size="14" />
            Acesso seguro
          </span>
        </header>

        <!-- Titulo da tela -->
        <div class="auth-cabecalho">
          <h2 class="auth-titulo">{{ titulo }}</h2>
          <p v-if="subtitulo" class="texto-secundario">{{ subtitulo }}</p>
        </div>

        <!-- Formulario -->
        <div class="auth-conteudo">
          <slot />
        </div>

        <!-- Rodape (links) -->
        <footer v-if="$slots.rodape" class="auth-rodape">
          <slot name="rodape" />
        </footer>
      </div>
    </section>
  </main>
</template>

<script setup>
import { Ticket, ShieldCheck } from "@lucide/vue";

defineProps({
  titulo: { type: String, default: "" },
  subtitulo: { type: String, default: "" },
});
</script>

<style scoped>
.auth {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--espaco-md);
  overflow: hidden;
}

/* ----- Aura ciano por tras do cartao -------------------------------------- */
.auth-aura {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(620px, 92vw);
  height: min(620px, 92vw);
  transform: translate(-50%, -58%);
  background: radial-gradient(
    circle at center,
    rgba(69, 211, 218, 0.22),
    rgba(69, 211, 218, 0.08) 38%,
    transparent 68%
  );
  filter: blur(10px);
  pointer-events: none;
  z-index: 0;
}

/* ----- Cartao ------------------------------------------------------------- */
.auth-cartao {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 452px;
  overflow: hidden;
}

/* Costura luminosa: fina linha ciano no topo do cartao. */
.auth-seam {
  position: absolute;
  top: 0;
  left: 12%;
  right: 12%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--cor-acento) 45%,
    var(--cor-acento-claro) 55%,
    transparent
  );
  box-shadow: 0 0 12px rgba(69, 211, 218, 0.6);
}

.auth-stack {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-lg);
}

/* ----- Marca -------------------------------------------------------------- */
.auth-marca {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
}

.auth-logo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 15px;
  color: var(--cor-texto-sobre-acento);
  background: linear-gradient(150deg, var(--cor-acento-claro), var(--cor-acento-escuro));
  box-shadow: var(--glow-acento);
  flex-shrink: 0;
}

/* Halo suave em volta do logo. */
.auth-logo::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--cor-acento) 35%, transparent);
  opacity: 0.7;
}

.auth-marca-texto {
  margin-right: auto;
}

.auth-nome {
  font-family: var(--fonte-display);
  font-size: 22px;
  font-weight: var(--peso-bold);
  color: var(--cor-texto-principal);
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.auth-tagline {
  font-size: var(--fonte-pequena);
  color: var(--cor-texto-secundario);
}

/* Selo "Acesso seguro" (pill de vidro). */
.auth-selo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--raio-pill);
  font-size: var(--fonte-pequena);
  font-weight: var(--peso-medio);
  color: var(--cor-acento-claro);
  background: var(--vidro-fundo);
  border: 1px solid color-mix(in srgb, var(--cor-acento) 28%, transparent);
  white-space: nowrap;
}

/* ----- Cabecalho ---------------------------------------------------------- */
.auth-cabecalho {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-titulo {
  font-family: var(--fonte-display);
  font-size: 30px;
  font-weight: var(--peso-bold);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--cor-texto-principal);
}

/* ----- Conteudo / rodape -------------------------------------------------- */
.auth-conteudo {
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.auth-rodape {
  text-align: center;
  font-size: var(--fonte-corpo);
  color: var(--cor-texto-secundario);
  padding-top: var(--espaco-sm);
  border-top: 1px solid var(--vidro-borda);
}

@media (max-width: 480px) {
  .auth-selo {
    display: none;
  }
  .auth-titulo {
    font-size: 26px;
  }
}
</style>
