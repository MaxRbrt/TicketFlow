<!--
  ============================================================================
  TicketFlow - SeletorBase.vue
  ----------------------------------------------------------------------------
  Select estilizado com rotulo, v-model e lista de opcoes. Cada opcao e um
  objeto { valor, rotulo } (formato das constantes do projeto, ex.: LISTA_STATUS).

  Uso:
    <SeletorBase v-model="status" label="Status" :opcoes="LISTA_STATUS"
      chave-valor="valor" chave-rotulo="rotulo" />
  ============================================================================
-->
<template>
  <div class="campo" :class="{ 'campo-erro': !!erro }">
    <label v-if="label" :for="idCampo" class="campo-label">
      {{ label }}
      <span v-if="obrigatorio" class="campo-obrigatorio" aria-hidden="true">*</span>
    </label>

    <div class="seletor-caixa">
      <select
        :id="idCampo"
        :value="modelValue"
        :disabled="desabilitado"
        :aria-invalid="!!erro"
        class="seletor"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="opcao in opcoes"
          :key="opcao[chaveValor]"
          :value="opcao[chaveValor]"
        >
          {{ opcao[chaveRotulo] }}
        </option>
      </select>
      <span class="seletor-seta" aria-hidden="true">
        <ChevronDown :size="18" />
      </span>
    </div>

    <p v-if="erro" class="campo-mensagem-erro">{{ erro }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ChevronDown } from "@lucide/vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  label: { type: String, default: "" },
  opcoes: { type: Array, default: () => [] },
  chaveValor: { type: String, default: "valor" },
  chaveRotulo: { type: String, default: "rotulo" },
  placeholder: { type: String, default: "" },
  erro: { type: String, default: "" },
  obrigatorio: { type: Boolean, default: false },
  desabilitado: { type: Boolean, default: false },
  id: { type: String, default: "" },
});

defineEmits(["update:modelValue"]);

const idCampo = computed(
  () => props.id || `sel-${Math.random().toString(36).slice(2, 9)}`
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

.seletor-caixa {
  position: relative;
  display: flex;
  align-items: center;
}

.seletor {
  width: 100%;
  height: var(--altura-input);
  padding: 0 calc(var(--espaco-md) + 22px) 0 var(--espaco-md);
  border-radius: var(--raio-input);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
  color: var(--cor-texto-principal);
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: border-color var(--transicao-rapida), box-shadow var(--transicao-rapida);
}

.seletor:focus {
  outline: none;
  border-color: var(--cor-acento);
  box-shadow: var(--sombra-foco);
}

/* As opcoes nativas herdam o fundo do sistema; forca cor legivel no dropdown. */
.seletor option {
  color: #16323a;
}

.seletor-seta {
  position: absolute;
  right: var(--espaco-md);
  display: flex;
  align-items: center;
  color: var(--cor-texto-secundario);
  pointer-events: none;
}

.campo-erro .seletor {
  border-color: var(--cor-erro);
}

.campo-mensagem-erro {
  font-size: var(--fonte-pequena);
  color: var(--cor-erro);
}
</style>
