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
        <p v-if="isLoading" class="no-results">Carregando…</p>

        <div v-else-if="errorMessage" class="error-state">
          <i class="bi bi-exclamation-triangle"></i>
          <p>{{ errorMessage }}</p>
          <button class="btn-retry" @click="loadTeachers">Tentar novamente</button>
        </div>

        <template v-else>
          <ProfessorCard
            v-for="prof in filteredProfessors"
            :key="prof.id"
            :professor="prof"
          />

          <p v-if="filteredProfessors.length === 0" class="no-results">
            Nenhum orientador encontrado.
          </p>
        </template>
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

const searchQuery = ref('')
const selectedThemes = ref([])
const teachers = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)

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

const loadTeachers = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const response = await getTeachers()
    teachers.value = Array.isArray(response) ? response.map(normalizeTeacher) : []
  } catch (err) {
    console.error('Erro ao buscar orientadores:', err)
    teachers.value = []
    errorMessage.value = 'Erro ao carregar os dados. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTeachers)

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
  position: sticky; /* Faz o filtro "rolar" junto com a tela */
  /* Usa a mesma variável do header (base.css → --header-height: 4.325rem)
     para o filtro grudar exatamente na borda inferior dele em qualquer
     breakpoint, sem hardcode. */
  top: var(--header-height);
  height: calc(100vh - var(--header-height));
}

.search-container {
  margin: 2rem 2rem 0 2rem;
}

/* 3. ÁREA DE CONTEÚDO: Ocupa o restante do espaço à direita */
.content-area {
  flex: 1;
  /* min-width: 0 quebra o min-width default `auto` dos flex items.
     Sem isso, conteúdo "indivisível" (URLs longas, imagens, tabelas)
     empurra o pai pra fora da viewport e gera scroll horizontal. */
  min-width: 0;
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

.error-state {
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  color: #b00020;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.error-state i {
  font-size: 2rem;
}

.error-state p {
  margin: 0;
  color: #444;
  font-style: italic;
}

.btn-retry {
  background-color: #065f8b;
  color: #fff;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.btn-retry:hover { opacity: 0.9; }

/* Responsividade para tablets/celulares */
@media (max-width: 1024px) {
  .search-page-layout {
    flex-direction: column; /* Empilha o filtro acima da busca em telas menores */
    /* Removido o `padding-top: 6rem` antigo — contradizia "filtro colado
       logo abaixo do header". Mantém apenas o padding horizontal. */
    padding: 0 1.5rem;
  }

  .search-page-layout > :first-child {
    width: 100%;
    /* Em mobile o filtro empilha — sem sticky e sem altura travada,
       deixa o conteúdo fluir naturalmente abaixo dele. */
    position: static;
    height: auto;
  }
}
</style>
