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
        <div v-if="loadError" class="error-state">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Não foi possível carregar a lista de alunos no momento.</p>
          <button class="btn-retry" @click="loadStudents">Tentar novamente</button>
        </div>

        <template v-else>
          <StudentCard
            v-for="student in filteredStudents"
            :key="student.id"
            :student="student"
          />

          <div v-if="hasLoadedStudents && filteredStudents.length === 0" class="no-results">
            Nenhum aluno encontrado com esses critérios.
          </div>
        </template>
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

const searchQuery = ref('')
const selectedThemes = ref([])
const notification = useNotificationStore()
const students = ref([])
const hasLoadedStudents = ref(false)
const loadError = ref(false)

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

const loadStudents = async () => {
  hasLoadedStudents.value = false
  loadError.value = false
  try {
    const { data } = await api.get('/students')
    students.value = Array.isArray(data) ? data.map(normalizeStudent) : []
  } catch (err) {
    console.error('Erro ao buscar alunos:', err)
    students.value = []
    loadError.value = true
  } finally {
    hasLoadedStudents.value = true
  }
}

onMounted(loadStudents)

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
  /* Alinhado à altura real do header (base.css → --header-height).
     Evita o gap que aparecia quando o sticky usava 6.5rem (~35px a mais
     do que a altura efetiva do header). */
  top: var(--header-height);
  /* Altura definida para o FilterBar interno (que usa min-height) poder
     esticar até o rodapé da viewport. */
  height: calc(100vh - var(--header-height));
}

/* Área de Conteúdo - SEM PADDING LATERAL DESNECESSÁRIO */
.content-area {
  flex: 1;
  /* min-width: 0 — quebra o `auto` default e impede que conteúdo
     "indivisível" do flex item gere scroll horizontal na página. */
  min-width: 0;
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

.error-state {
  grid-column: 1 / -1;
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  color: #b00020;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.error-state i { font-size: 2rem; }
.error-state p { margin: 0; color: #444; font-style: italic; }

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

/* Responsividade */
@media (max-width: 1024px) {
  .search-page-layout {
    flex-direction: column;
  }

  .search-page-layout > :first-child {
    width: 100%;
    /* Em mobile o filtro empilha — sem sticky/height fixo, flui natural. */
    position: static;
    height: auto;
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