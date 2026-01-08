<template>
  <div class="search-layout">
    <FilterSidebar 
      :themes="allThemes" 
      v-model:selectedThemes="selectedThemes"
      @clear="resetFilters"
    />

    <main class="search-content">
      <SearchBar v-model="searchQuery" />

      <div class="results-list">
        <div v-for="prof in filteredProfessors" :key="prof.id" class="prof-card">
          </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import SearchBar from './components/SearchBar.vue';
import FilterSidebar from './components/FilterSidebar.vue';

const searchQuery = ref('');
const selectedThemes = ref([]);
const allThemes = ['Inteligência Artificial', 'Engenharia de Software', 'Banco de Dados'];

// Lógica de afunilamento (Filter Logic)
const filteredProfessors = computed(() => {
  return professors.value.filter(prof => {
    const nameMatch = prof.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const themeMatch = selectedThemes.value.length === 0 || 
                       selectedThemes.value.some(t => prof.themes.includes(t));
    return nameMatch && themeMatch;
  });
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedThemes.value = [];
};
</script>