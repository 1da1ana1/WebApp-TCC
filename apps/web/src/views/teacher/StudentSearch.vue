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
        
        <div v-if="hasLoadedStudents && filteredStudents.length === 0" class="no-results">
          Nenhum aluno encontrado com esses critérios.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import SearchBar from '@/components/SearchBar.vue'
import StudentCard from '@/components/StudentCard.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import api from '@/services/api'
import { mockStudents } from '@/services/mockData'

const searchQuery = ref('')
const selectedThemes = ref([])
const notification = useNotificationStore()
const students = ref([])
const hasLoadedStudents = ref(false)

const normalizeStudent = (student) => {
  const tagsFromKeywords =
    student?.user?.keywords?.map((item) => item.keyword?.name).filter(Boolean) || []

  const tags = student?.tags || student?.themes || tagsFromKeywords

  return {
    id: student.id || student.registro,
    name: student.name || student.nome || student?.user?.name || 'Aluno sem nome',
    tags,
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/students')
    students.value = Array.isArray(data)
      ? data.map(normalizeStudent)
      : mockStudents.map(normalizeStudent)
  } catch {
    students.value = mockStudents.map(normalizeStudent)
  } finally {
    hasLoadedStudents.value = true
  }
})

const availableThemes = computed(() => {
  const allTags = students.value.flatMap(s => s.tags || [])
  return [...new Set(allTags)].sort()
})

const filteredStudents = computed(() => {
  return students.value.filter(student => {
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