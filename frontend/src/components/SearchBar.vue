<template>
  <div class="search-bar-container">
    <input 
      type="text" 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="ex: João da Silva" 
      class="search-input"
    />
    <i class="bi bi-search search-icon"></i>
  </div>
</template>

<script setup>
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>