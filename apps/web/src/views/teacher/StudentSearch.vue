<template>
  <div class="search-page-layout">
    <FilterBar 
      title="Filtrar Aluno por temas"
      :themes="availableThemes" 
      v-model:selectedThemes="selectedThemes"
      @clear="resetFilters"
    />

    <main class="content-area">
      <!-- Search Container - SEM PADDING LATERAL -->
      <div class="search-container">
        <SearchBar 
          v-model="searchQuery" 
          placeholder="ex: João da Silva junior"
        />
      </div>

      <!-- Results Grid - SEM ESPAÇOS LATERAIS -->
      <div class="results-grid">
        <StudentCard 
          v-for="student in filteredStudents" 
          :key="student.id" 
          :student="student" 
        />
        
        <div v-if="filteredStudents.length === 0" class="no-results">
          Nenhum aluno encontrado com esses critérios.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import SearchBar from '@/components/SearchBar.vue'
import StudentCard from '@/components/StudentCard.vue'
import { useNotificationStore } from '@/stores/notificationStore'

// --- MOCK DATA ---
const mockStudents = [
  { id: '123456', name: 'Lorem Ipsum Dolor Sit', tags: ['Lorem', 'Lorem ipsum dolor sit amet'] },
  { id: '123457', name: 'João da Silva', tags: ['Inteligência Artificial', 'Python'] },
  { id: '123458', name: 'Maria Souza', tags: ['Engenharia de Software', 'Java'] },
  { id: '123459', name: 'Pedro Alvares', tags: ['Banco de Dados', 'SQL'] },
  { id: '123460', name: 'Ana Costa', tags: ['Lorem', 'Design'] },
  { id: '123461', name: 'Lucas Pereira', tags: ['Lorem ipsum dolor sit amet'] },
]

// --- ESTADOS ---
const searchQuery = ref('')
const selectedThemes = ref([])
const notification = useNotificationStore()

// --- LÓGICA ---
const availableThemes = computed(() => {
  const allTags = mockStudents.flatMap(s => s.tags || [])
  return [...new Set(allTags)].sort()
})

const filteredStudents = computed(() => {
  return mockStudents.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const studentTags = student.tags || []
    const themeMatch = selectedThemes.value.length === 0 || 
                       selectedThemes.value.some(theme => studentTags.includes(theme))
    return nameMatch && themeMatch
  })
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedThemes.value = []
  notification.success('Filtros limpos.')
}
</script>

<style scoped>
/* Layout Principal */
.search-page-layout {
  display: flex;
  align-items: flex-start;

}


.search-page-layout > :first-child {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 6.5rem;
}

/* Área de Conteúdo - SEM PADDING LATERAL DESNECESSÁRIO */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 0; 
  gap: 1.5rem;

}

/* Search Container - COM PADDING APENAS PARA O INPUT */
.search-container {
  width: 100%;
  padding: 0 2rem; /* Padding apenas para o input não grudar nas bordas */
}

/* Grid de Resultados - SEM PADDING LATERAL */
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: #ccc;
  gap: 1px;
  border: 1px solid #ccc;
  /* CRÍTICO: Sem padding lateral aqui! */
}

/* Cards preenchem o grid completamente */
:deep(.student-card) {
  background-color: white;
  height: 100%;
}

/* Mensagem sem resultados */
.no-results {
  grid-column: 1 / -1;
  padding: 3rem;
  text-align: center;
  background: white;
  color: #666;
  font-style: italic;
  font-size: 1rem;
}

/* Responsividade */
@media (max-width: 1024px) {
  .search-page-layout {
    flex-direction: column;
  }
  
  .search-page-layout > :first-child {
    width: 100%;
    position: static;
  }
  
  .content-area {
    padding: 1.5rem 0;
  }
}

@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .search-container {
    padding: 0 1rem;
  }
}


.content-area,
.results-grid {
  box-sizing: border-box;
}
</style>