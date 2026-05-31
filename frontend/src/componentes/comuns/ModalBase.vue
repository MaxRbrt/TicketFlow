<!--
  ============================================================================
  TicketFlow - ModalBase.vue
  ----------------------------------------------------------------------------
  Modal reutilizavel (vidro escuro) com overlay borrado. Renderizado via
  <Teleport> no body para evitar problemas de empilhamento. Fecha ao clicar no
  overlay, no X ou ao pressionar Esc. Usado em confirmacoes (ex.: excluir).

  Props:  modelValue (aberto/fechado), titulo
  Slots:  default (conteudo), acoes (rodape com botoes)
  Eventos: update:modelValue, fechar
  ============================================================================
-->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click.self="fechar"
      >
        <div
          class="modal painel"
          role="dialog"
          aria-modal="true"
          :aria-label="titulo"
        >
          <header class="modal-cabecalho">
            <h2 class="titulo-secao">{{ titulo }}</h2>
            <button class="botao-icone" type="button" aria-label="Fechar" @click="fechar">
              <X :size="18" />
            </button>
          </header>

          <div class="modal-corpo">
            <slot />
          </div>

          <footer v-if="$slots.acoes" class="modal-acoes">
            <slot name="acoes" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onUnmounted } from "vue";
import { X } from "@lucide/vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  titulo: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "fechar"]);

function fechar() {
  emit("update:modelValue", false);
  emit("fechar");
}

// Fecha com a tecla Esc enquanto o modal estiver aberto.
function aoTeclar(evento) {
  if (evento.key === "Escape") {
    fechar();
  }
}

// Liga/desliga o listener de teclado e trava o scroll do fundo.
watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) {
      document.addEventListener("keydown", aoTeclar);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    }
  }
);

// Garante limpeza caso o componente seja destruido com o modal aberto.
onUnmounted(() => {
  document.removeEventListener("keydown", aoTeclar);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--espaco-md);
  background: rgba(8, 22, 27, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.modal {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: var(--espaco-md);
}

.modal-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-md);
}

.modal-corpo {
  color: var(--cor-texto-secundario);
  line-height: 1.6;
}

.modal-acoes {
  display: flex;
  justify-content: flex-end;
  gap: var(--espaco-sm);
  flex-wrap: wrap;
}

/* Transicao de entrada/saida (overlay + leve zoom no painel). */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transicao-media);
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform var(--transicao-media);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(12px) scale(0.97);
}
</style>
