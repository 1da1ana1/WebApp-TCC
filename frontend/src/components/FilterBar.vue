<template>
  <aside class="filter-sidebar">
    <h3>Filtrar professor por temas</h3>
    
    <div class="checkbox-group">
      <label v-for="theme in themes" :key="theme" class="checkbox-item">
        <input 
          type="checkbox" 
          :value="theme" 
          @change="toggleTheme(theme)"
        />
        <span>{{ theme }}</span>
      </label>
    </div>

    <button class="btn-clear" @click="$emit('clear')">Limpar seleção</button>
  </aside>
</template>

<script setup>
const props = defineProps(['themes', 'selectedThemes']);
const emit = defineEmits(['update:selectedThemes', 'clear']);

const toggleTheme = (theme) => {
  const newSelection = [...props.selectedThemes];
  const index = newSelection.indexOf(theme);
  
  if (index > -1) newSelection.splice(index, 1);
  else newSelection.push(theme);
  
  emit('update:selectedThemes', newSelection);
};
</script>