<template>
  <div class="search-page-layout">
    <FilterBar 
      title="Filtrar Aluno por temas"
      :themes="availableThemes" 
      v-model:selectedThemes="selectedThemes"
      @clear="resetFilters"
    />

    <main class="content-area">
      <div class="search-container">
         <SearchBar 
           v-model="searchQuery" 
           placeholder="ex: João da Silva junior"
         />
         </div>

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
import StudentCard from '@/components/StudentCard.vue' // Componente novo sugerido abaixo
import { useNotificationStore } from '@/stores/notificationStore'

// --- MOCK DATA (Simulando alunos para o exemplo) ---
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
/* Layout Macro */
.search-page-layout {
  display: flex;
  align-items: flex-start;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #e0e0e0; /* Fundo cinza da página */
  min-height: 100vh;
}

/* Sidebar Fixa */
.search-page-layout > :first-child {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 6.5rem;
}

/* Área Direita */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 0;
  gap: 1.5rem;
}

.search-container {
  width: 100%;
  padding: 0 2rem;
}

/* --- GRID DE 2 COLUNAS (A Mudança Principal) --- */
.results-grid {
  display: grid;
  /* Cria exatamente 2 colunas de larguras iguais */
  grid-template-columns: 1fr 1fr; 
  
  /* Truque para criar as bordas internas perfeitas (estilo planilha):
     Define o fundo container como cinza (cor da borda) e dá um gap de 1px.
     Os cards terão fundo branco. */
  background-color: #ccc; 
  gap: 1px;
  border: 1px solid #ccc; /* Borda externa */

  overflow: hidden; /* Para arredondar as bordas do grid */
}

/* Ajuste para o componente StudentCard preencher o espaço */
:deep(.student-card) {
  background-color: white; /* Garante que o card seja branco */
  height: 100%; /* Garante altura igual na linha */
}

/* Sem Resultados (ocupa as duas colunas) */
.no-results {
  grid-column: 1 / -1;
  padding: 3rem;
  text-align: center;
  background: white;
  color: #666;
  font-style: italic;
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
}

@media (max-width: 768px) {
  /* Em telas pequenas, volta para 1 coluna */
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>