<template>
  <div class="search-bar-wrapper">
    <div class="search-input-container">
      <input
        type="text"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        class="search-field"
      />
      <i class="bi bi-search search-icon"></i>
    </div>
  </div>
</template>

<script setup>
defineProps({
  // Permite mudar o texto de exemplo (ex: "Pesquisar aluno...") conforme quem usa
  placeholder: {
    type: String,
    default: "ex: João da Silva"
  },
  modelValue: String
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* O container branco externo com bordas arredondadas (conforme image_725341.png) */
.search-bar-wrapper {
  background-color: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.09);
  width: 100%;
  
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-field {
  width: 100%;
  padding: 0.8rem 1rem;
  padding-right: 3rem; /* Espaço para o ícone */
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  font-style: italic;
  color: #666;
  outline: none;
  transition: border-color 0.2s;
}

.search-field:focus {
  border-color: var(--color-brand-primary);
}

.search-icon {
  position: absolute;
  right: 1.2rem;
  color: #333;
  font-size: 1.2rem;
  pointer-events: none; /* O clique passa para o input */
}
</style>