<!--
  ============================================================================
  TicketFlow - AreaTextoBase.vue
  ----------------------------------------------------------------------------
  Area de texto (textarea) com rotulo, v-model, contador opcional e erro.
  Mesmo estilo de vidro do CampoTextoBase.

  Uso: <AreaTextoBase v-model="descricao" label="Descricao" :linhas="5" />
  ============================================================================
-->
<template>
  <div class="campo" :class="{ 'campo-erro': !!erro }">
    <label v-if="label" :for="idCampo" class="campo-label">
      {{ label }}
      <span v-if="obrigatorio" class="campo-obrigatorio" aria-hidden="true">*</span>
    </label>

    <textarea
      :id="idCampo"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="linhas"
      :maxlength="maximo || undefined"
      :disabled="desabilitado"
      :aria-invalid="!!erro"
      class="campo-textarea"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    ></textarea>

    <div class="campo-rodape">
      <p v-if="erro" class="campo-mensagem-erro">{{ erro }}</p>
      <span v-if="maximo" class="campo-contador">
        {{ String(modelValue).length }}/{{ maximo }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  erro: { type: String, default: "" },
  obrigatorio: { type: Boolean, default: false },
  desabilitado: { type: Boolean, default: false },
  linhas: { type: Number, default: 4 },
  maximo: { type: Number, default: 0 },
  id: { type: String, default: "" },
});

defineEmits(["update:modelValue", "blur"]);

const idCampo = computed(
  () => props.id || `area-${Math.random().toString(36).slice(2, 9)}`
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

.campo-textarea {
  width: 100%;
  padding: var(--espaco-sm) var(--espaco-md);
  border-radius: var(--raio-input);
  background: var(--vidro-fundo);
  border: 1px solid var(--vidro-borda);
  color: var(--cor-texto-principal);
  resize: vertical;
  min-height: 96px;
  line-height: 1.5;
  transition: border-color var(--transicao-rapida), box-shadow var(--transicao-rapida);
}

.campo-textarea::placeholder {
  color: var(--cor-texto-secundario);
  opacity: 0.7;
}

.campo-textarea:focus {
  outline: none;
  border-color: var(--cor-acento);
  box-shadow: var(--sombra-foco);
}

.campo-erro .campo-textarea {
  border-color: var(--cor-erro);
}

.campo-rodape {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--espaco-sm);
}

.campo-mensagem-erro {
  font-size: var(--fonte-pequena);
  color: var(--cor-erro);
}

.campo-contador {
  margin-left: auto;
  font-size: var(--fonte-pequena);
  color: var(--cor-texto-secundario);
}
</style>
