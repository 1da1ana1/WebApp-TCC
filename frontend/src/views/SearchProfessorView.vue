<template>
  <div class="search-page-layout">
    <FilterBar 
      :themes="themesList" 
      v-model:selectedThemes="selectedThemes"
      @clear="resetFilters"
    />

    <main class="content-area">
      <SearchBar v-model="searchQuery" />

      <div class="results-list">
        <ProfessorCard 
          v-for="prof in filteredProfessors" 
          :key="prof.id" 
          :professor="prof" 
        />
        
        <p v-if="filteredProfessors.length === 0" class="no-results">
          Nenhum orientador encontrado.
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FilterBar from '../components/FilterBar.vue'
import SearchBar from '../components/SearchBar.vue'
import ProfessorCard from '../components/ProfessorCard.vue'

// 1. Dados originais (Fonte de Verdade)
const allProfessors = ref([
  { id: 1, name: 'João Silva', themes: ['IA', 'Data Science'], availableSpots: 5, totalSpots: 5 },
  { id: 2, name: 'Maria Souza', themes: ['Web', 'Design'], availableSpots: 2, totalSpots: 5 },
])

const themesList = ['IA', 'Data Science', 'Web', 'Design', 'Engenharia de Software']

// 2. Estados dos filtros
const searchQuery = ref('')
const selectedThemes = ref([])

// 3. Lógica Única de Afunilamento
const filteredProfessors = computed(() => {
  return allProfessors.value.filter(prof => {
    const nameMatch = prof.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const themeMatch = selectedThemes.value.length === 0 || 
                       selectedThemes.value.some(t => prof.themes.includes(t))
    
    return nameMatch && themeMatch
  })
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedThemes.value = []
}
</script>

<style scoped>
/* 1. CONTAINER PRINCIPAL: Organiza a Sidebar e o Conteúdo lado a lado */
.search-page-layout {
  display: flex;
  align-items: flex-start; /* Garante que o filtro comece no topo */        /* Espaço generoso entre o filtro e os resultados */
  max-width: 1400px;       /* Limita a largura em telas muito grandes */
  margin: 0 auto;          /* Centraliza a página horizontalmente */
  background-color: #e0e0e0; /* Fundo cinza claro para combinar com o Perfil */
  min-height: 100vh;
  box-sizing: border-box;
}

/* 2. BARRA LATERAL: Mantém a largura fixa para o FilterBar */
.search-page-layout > :first-child {
  width: 280px;
  flex-shrink: 0; /* Impede que a barra lateral seja esmagada */
  position: sticky; /* Opcional: faz o filtro "rolar" junto com a tela */
  top: 6.5rem;
}

/* 3. ÁREA DE CONTEÚDO: Ocupa o restante do espaço à direita */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 4. LISTA DE RESULTADOS: Organiza os ProfessorCards verticalmente */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 0; /* Cards geralmente encostam um no outro com borda, conforme o design */
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

/* Estilo para quando não houver resultados */
.no-results {
  padding: 3rem;
  text-align: center;
  background: white;
  color: #666;
  font-style: italic;
  border-radius: 8px;
}

/* Responsividade para tablets/celulares */
@media (max-width: 1024px) {
  .search-page-layout {
    flex-direction: column; /* Empilha o filtro acima da busca em telas menores */
    padding: 6rem 1.5rem;
  }
  
  .search-page-layout > :first-child {
    width: 100%;
    position: static;
  }
}
</style>
