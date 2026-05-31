<!--
  ============================================================================
  TicketFlow - CampoTextoBase.vue
  ----------------------------------------------------------------------------
  Campo de texto com rotulo, v-model, mensagem de erro e icone opcional.
  Estilo de vidro escuro coerente com o tema. Suporta acessibilidade basica
  (label associado, aria-invalid) e, para campos de senha, um botao para
  mostrar/ocultar o conteudo.

  Uso: <CampoTextoBase v-model="email" label="E-mail" tipo="email" :erro="erroEmail" />
  ============================================================================
-->
<template>
  <div class="campo" :class="{ 'campo-erro': !!erro }">
    <label v-if="label" :for="idCampo" class="campo-label">
      {{ label }}
      <span v-if="obrigatorio" class="campo-obrigatorio" aria-hidden="true">*</span>
    </label>

    <div class="campo-caixa">
      <span v-if="$slots.icone" class="campo-icone"><slot name="icone" /></span>
      <input
        :id="idCampo"
        :type="tipoEfetivo"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="desabilitado"
        :aria-invalid="!!erro"
        class="campo-input"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur')"
      />
      <!-- Mostrar/ocultar senha (apenas para tipo password) -->
      <button
        v-if="ehSenha"
        type="button"
        class="campo-toggle"
        :aria-label="revelado ? 'Ocultar senha' : 'Mostrar senha'"
        @click="revelado = !revelado"
      >
        <EyeOff v-if="revelado" :size="18" />
        <Eye v-else :size="18" />
      </button>
    </div>

    <p v-if="erro" class="campo-mensagem-erro">{{ erro }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Eye, EyeOff } from "@lucide/vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  label: { type: String, default: "" },
  tipo: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  erro: { type: String, default: "" },
  obrigatorio: { type: Boolean, default: false },
  desabilitado: { type: Boolean, default: false },
  autocomplete: { type: String, default: "off" },
  id: { type: String, default: "" },
});

defineEmits(["update:modelValue", "blur"]);

// Controle do botao mostrar/ocultar para campos de senha.
const ehSenha = computed(() => props.tipo === "password");
const revelado = ref(false);

// Tipo real do input: senha revelada vira "text"; demais usam o tipo da prop.
const tipoEfetivo = computed(() =>
  ehSenha.value ? (revelado.value ? "text" : "password") : props.tipo
);

// Gera um id estavel para associar label e input (acessibilidade).
const idCampo = computed(
  () => props.id || `campo-${Math.random().toString(36).slice(2, 9)}`
);
</script>

<style scoped>
.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.campo-label {
  font-size: var(--fonte-pequena);
  font-weight: var(--peso-semibold);
  color: var(--cor-texto-secundario);
  letter-spacing: 0.02em;
}

.campo-obrigatorio {
  color: var(--cor-erro);
}

.campo-caixa {
  display: flex;
  align-items: center;
  gap: var(--espaco-sm);
  height: var(--altura-input);
  padding: 0 var(--espaco-md);
  border-radius: var(--raio-input);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
  transition: border-color var(--transicao-rapida), box-shadow var(--transicao-rapida),
    background var(--transicao-rapida);
}

/* Anel de foco UNICO, no container (o input interno nao recebe anel proprio). */
.campo-caixa:focus-within {
  border-color: var(--cor-acento);
  background: var(--vidro-fundo-forte);
  box-shadow: var(--sombra-foco);
}

.campo-icone {
  display: flex;
  align-items: center;
  color: var(--cor-texto-secundario);
  transition: color var(--transicao-rapida);
}

.campo-caixa:focus-within .campo-icone {
  color: var(--cor-acento);
}

.campo-input {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--cor-texto-principal);
  outline: none;
}

/* Reforco: o input nunca exibe anel/borda proprios (evita borda dupla). */
.campo-input:focus,
.campo-input:focus-visible {
  outline: none;
  box-shadow: none;
}

.campo-input::placeholder {
  color: var(--cor-texto-secundario);
  opacity: 0.7;
}

.campo-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Neutraliza o fundo amarelo do autofill do Chrome (mantem o vidro escuro). */
.campo-input:-webkit-autofill,
.campo-input:-webkit-autofill:hover,
.campo-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--cor-texto-principal);
  caret-color: var(--cor-texto-principal);
  transition: background-color 9999s ease-in-out 0s;
}

/* Botao mostrar/ocultar senha */
.campo-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cor-texto-secundario);
  border-radius: 999px;
  padding: 4px;
  transition: color var(--transicao-rapida), background var(--transicao-rapida);
}

.campo-toggle:hover {
  color: var(--cor-acento);
  background: var(--vidro-fundo);
}

.campo-erro .campo-caixa {
  border-color: var(--cor-erro);
}

.campo-mensagem-erro {
  font-size: var(--fonte-pequena);
  color: var(--cor-erro);
}
</style>
