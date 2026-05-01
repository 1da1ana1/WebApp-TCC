<template>
  
  <div class="search-page-layout">
    <FilterBar
      title="Filtrar professor por temas"
      @filter-changed="selectedThemes = $event"
      @clear="resetFilters"
    />


    <main class="content-area">

      <div class="search-container">
         <SearchBar v-model="searchQuery" />
      </div>
     

      <div class="results-list">
        <ProfessorCard 
          v-for="prof in filteredProfessors" 
          :key="prof.id" 
          :professor="prof" 
        />
        
        <p v-if="hasLoadedTeachers && filteredProfessors.length === 0" class="no-results">
          Nenhum orientador encontrado.
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FilterBar from '@/components/FilterBar.vue'
import SearchBar from '@/components/SearchBar.vue'
import ProfessorCard from '@/components/ProfessorCard.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { getTeachers } from '@/services/api'

import { mockProfessors } from '@/services/mockData' 

const searchQuery = ref('')
const selectedThemes = ref([])
const teachers = ref([])
const hasLoadedTeachers = ref(false)

const normalizeTeacher = (teacher) => {
  const tagsFromKeywords =
    teacher?.user?.keywords?.map((item) => item.keyword?.name).filter(Boolean) || []

  const tags = teacher?.tags || teacher?.themes || tagsFromKeywords

  return {
    id: teacher.id,
    name: teacher.name || teacher?.user?.name || 'Professor sem nome',
    tags,
    vagas:
      teacher.vagas ??
      teacher.availableSpots ??
      teacher?.vacancies?.available_spots ??
      teacher?.vacancies?.total_spots ??
      0,
  }
}

onMounted(async () => {
  try {
    const response = await getTeachers()
    teachers.value = Array.isArray(response)
      ? response.map(normalizeTeacher)
      : mockProfessors.map(normalizeTeacher)
  } catch {
    teachers.value = mockProfessors.map(normalizeTeacher)
  } finally {
    hasLoadedTeachers.value = true
  }
})

const filteredProfessors = computed(() => {
  return teachers.value.filter(prof => {
    const nameMatch = prof.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    const profTags = prof.tags || []
    const themeMatch = selectedThemes.value.length === 0 || 
                       selectedThemes.value.some(theme => profTags.includes(theme))
    
    return nameMatch && themeMatch
  })
})

const notification = useNotificationStore()
const resetFilters = () => {
  searchQuery.value = ''
  selectedThemes.value = []
  notification.success('Filtros de busca foram limpos.')
}
</script>

<style scoped>
/* 1. CONTAINER PRINCIPAL: Organiza a Sidebar e o Conteúdo lado a lado */
.search-page-layout {
  display: flex;
  align-items: flex-start;

}

/* 2. BARRA LATERAL: Mantém a largura fixa para o FilterBar */
.search-page-layout > :first-child {
  width: 280px;
  flex-shrink: 0; /* Impede que a barra lateral seja esmagada */
  position: sticky; /* Opcional: faz o filtro "rolar" junto com a tela */
  top: 6.5rem;
}

.search-container {
  margin: 2rem 2rem 0 2rem;
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
